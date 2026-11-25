// jogo.js — tela do jogo "Descubra o Pokémon".
// Ideia central: o BACK-END guarda tudo (pokémon secreto, palpites, tentativas).
// O front só pede o estado da partida e desenha na tela.

let jogador = getSavedPlayer(); // "jogador1" ou "jogador2"
let gameId = null; // id da partida atual, ex: "jogo-3"
let terminou = false;

const TELA_VAZIA = `
  <div class="empty-state">
    <div class="empty-ball">?</div>
    <b>Nenhum palpite ainda</b>
    <span>Seus resultados aparecerão aqui.</span>
  </div>`;

const ROTULOS = { maior: "↑ Maior", menor: "↓ Menor", igual: "✓ Correto" };
const CLASSE_TIPO = { certo: "good", existe: "exists", errado: "bad" };

// ---------- Funções pequenas de tela ----------
function mostrarMensagem(texto, tipo = "") {
  $("message").textContent = texto;
  $("message").className = `message ${tipo}`;
}

function travarBotoes(ocupado) {
  $("guessButton").disabled = ocupado || !gameId || terminou;
  $("newGameButton").disabled = ocupado;
}

// dica = { valor: "90,5 kg", resultado: "menor" }
// Mostra o valor do palpite e se o secreto é maior/menor/igual. Ex: "90,5 kg ↓ Menor"
function celula(dica, prefixo = "") {
  const classe = dica.resultado === "igual" ? "good" : "";
  return `<span class="result-cell ${classe}">${prefixo}${dica.valor}<br>${ROTULOS[dica.resultado]}</span>`;
}

function linhaPalpite(palpite) {
  const dicas = palpite.dicas;
  const tipos = dicas.tipos
    .map(
      (t) =>
        `<span class="type-chip ${CLASSE_TIPO[t.resultado]}">${t.tipo}</span>`,
    )
    .join("");

  return `
    <div class="guess-row">
      <div class="guess-name">
        ${sprite(palpite.id, palpite.pokemon)}
        <span>${palpite.pokemon}</span>
      </div>
      ${celula(dicas.id, "#")}
      ${celula(dicas.peso)}
      ${celula(dicas.altura)}
      <div class="type-results">${tipos}</div>
    </div>`;
}

// Na última tentativa o back manda o endereço da silhueta (partida.silhueta).
// Nas outras tentativas esse campo não existe e a caixa fica escondida.
function mostrarSilhueta(url) {
  const caixa = $("silhouetteBox");
  const imagem = $("silhouetteImg");

  if (!url) {
    caixa.classList.add("hidden");
    imagem.removeAttribute("src");
    return;
  }

  if (imagem.getAttribute("src") !== url) imagem.src = url;
  caixa.classList.remove("hidden");
}

// ---------- Desenha a partida inteira a partir do que o back mandou ----------
function mostrarPartida(partida, avisoEmAndamento) {
  terminou = partida.resultado !== "em_andamento";

  // palpites mais recentes primeiro
  $("guessHistory").innerHTML = partida.palpites.length
    ? [...partida.palpites].reverse().map(linhaPalpite).join("")
    : TELA_VAZIA;

  $("attemptsLeft").textContent = partida.tentativasRestantes;
  $("attemptTrack").innerHTML = [0, 1, 2, 3, 4]
    .map(
      (i) => `<span class="${i < partida.tentativas ? "filled" : ""}"></span>`,
    )
    .join("");

  mostrarSilhueta(partida.silhueta);

  if (partida.resultado === "vitoria") {
    mostrarMensagem(
      `Acertou! ${partida.secreto.pokemon} foi capturado na sua Pokédex.`,
      "success",
    );
  } else if (partida.resultado === "derrota") {
    mostrarMensagem(
      `Fim de jogo! O Pokémon era ${partida.secreto.pokemon}.`,
      "error",
    );
  } else {
    mostrarMensagem(avisoEmAndamento);
  }
}

// Pede ao back o estado atual da partida e desenha
async function carregarPartida(avisoEmAndamento) {
  const partida = await api(`/users/${jogador}/games/${gameId}`);
  mostrarPartida(partida, avisoEmAndamento);
}

// ---------- Ações do jogador ----------
async function iniciarPartida() {
  gameId = null;
  terminou = false;
  travarBotoes(true);
  mostrarMensagem("Preparando partida...");

  try {
    try {
      const nova = await api(`/users/${jogador}/games`, { method: "POST" });
      gameId = nova.gameId;
    } catch (erro) {
      // 409 = esse jogador já tem partida em andamento: continua nela
      if (erro.status !== 409) throw erro;
      gameId = erro.data.gameId;
    }
    await carregarPartida("Partida pronta. Faça seu palpite.");
  } catch (erro) {
    mostrarMensagem(erro.message, "error");
  } finally {
    travarBotoes(false);
  }
}

async function enviarPalpite() {
  const texto = $("pokemonInput").value.trim().replace("#", "");
  if (!texto) {
    mostrarMensagem("Digite o nome ou número de um Pokémon.", "error");
    return;
  }

  travarBotoes(true);
  try {
    // O back valida (existe? já tentou?) e calcula as dicas
    await api(`/users/${jogador}/games/${gameId}/guess`, {
      method: "POST",
      body: JSON.stringify({ pokemon: texto }),
    });
    $("pokemonInput").value = "";
    await carregarPartida("Palpite registrado! Veja as dicas abaixo.");
  } catch (erro) {
    mostrarMensagem(erro.message, "error");
  } finally {
    travarBotoes(false);
  }
}

// ---------- Início da página ----------
async function iniciar() {
  try {
    // Lista de pokémons só pra preencher as sugestões do campo de texto
    const catalogo = await api("/pokedex");
    $("pokemonOptions").innerHTML = catalogo
      .map((p) => `<option value="${p.pokemon}">#${p.id}</option>`)
      .join("");
    $("pokemonInput").disabled = false;

    await iniciarPartida();
  } catch (erro) {
    mostrarMensagem(`Erro ao conectar com o backend: ${erro.message}`, "error");
  }
}

setupPlayerModal((novoJogador) => {
  if (novoJogador === jogador) return;
  jogador = novoJogador;
  iniciarPartida();
});

$("newGameButton").addEventListener("click", iniciarPartida);
$("guessButton").addEventListener("click", enviarPalpite);
$("pokemonInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") enviarPalpite();
});

iniciar();
