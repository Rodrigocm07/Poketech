// api.js arquivo de funções que TODAS as páginas usam

// Atalho: $("message") em vez de document.getElementById("message")
const $ = (id) => document.getElementById(id);

// ---------- Conversa com o back ----------
// Faz o fetch, converte a resposta em objeto e, se o servidor retornar erro, responde com um erro
async function api(caminho, opcoes = {}) {
  const resposta = await fetch(caminho, {
    ...opcoes,
    headers: { "Content-Type": "application/json" },
  });
  const dados = await resposta.json();

  if (!resposta.ok) {
    const erro = new Error(dados.erro || `Erro ${resposta.status}`);
    erro.status = resposta.status; //status de erro, 404, 409 etc...
    erro.data = dados; // corpo completo 
    throw erro;
  }
  return dados;
}

// ---------- Mudança de tema ----------
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  localStorage.setItem("poketech_theme", tema);
  $("themeToggle").textContent = tema === "light" ? "Tema escuro" : "Tema claro";
}

aplicarTema(localStorage.getItem("poketech_theme") || "dark");

$("themeToggle").addEventListener("click", () => {
  const atual = document.documentElement.getAttribute("data-theme");
  aplicarTema(atual === "dark" ? "light" : "dark");
});

// ---------- Jogador (jogador1 ou jogador2) ----------
const NOMES_JOGADORES = {
  jogador1: "Treinador (Masculino)",
  jogador2: "Treinadora (Feminina)",
};

function getSavedPlayer() {
  return localStorage.getItem("poketech_player") || "jogador1";
}

// Abre e fecha o modal de escolha de personagem e quando a pessoa escolhe alguém, chama aoEscolher(jogador).
function setupPlayerModal(aoEscolher) {
  const modal = $("playerModal");
  const opcoes = document.querySelectorAll(".player-option");

  function atualizarTela() {
    const atual = getSavedPlayer();
    $("openPlayerModal").textContent = NOMES_JOGADORES[atual];
    opcoes.forEach((botao) => {
      botao.classList.toggle("selected", botao.dataset.player === atual);
    });
  }

  const fechar = () => modal.classList.add("hidden");

  atualizarTela();

  $("openPlayerModal").addEventListener("click", () => modal.classList.remove("hidden"));
  $("closePlayerModal").addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar(); // clicou no fundo escuro
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fechar();
  });

  opcoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      localStorage.setItem("poketech_player", botao.dataset.player);
      atualizarTela();
      fechar();
      aoEscolher(botao.dataset.player);
    });
  });
}

// ---------- Imagem do Pokémon ----------
// id já vem do back como "001", "025"... e a imagem tem o mesmo nome
function sprite(id, nome, classe = "mini-sprite") {
  return `<img class="${classe}" src="/assets/pokemon/${id}.png" alt="${nome}" loading="lazy">`;
}

// ---------- Menu lateral ----------
function setupSideMenu() {
  const menu = $("sideMenu");
  const fundo = $("sideMenuBackdrop");

  function abrir() {
    menu.classList.add("open");
    fundo.classList.remove("hidden");
  }
  function fechar() {
    menu.classList.remove("open");
    fundo.classList.add("hidden");
  }

  $("openSideMenu").addEventListener("click", abrir);
  $("closeSideMenu").addEventListener("click", fechar);
  fundo.addEventListener("click", fechar);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fechar();
  });

  // Marca como "ativo" o link da página em que estamos
  const paginaAtual = location.pathname.split("/").pop() || "index.html";
  menu.querySelectorAll("a[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === paginaAtual);
  });
}

setupSideMenu();
