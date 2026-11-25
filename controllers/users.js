const path = require("path");
const pokedex = require("./pokedex.mock");
const { compararPalpite, tiposDe } = require("./compare");

const MAX_TENTATIVAS = 5;

const usuarios = {
    jogador1: { id: "jogador1", nome: "Jogador 1", capturados: [] },
    jogador2: { id: "jogador2", nome: "Jogador 2", capturados: [] }
};

const partidas = new Map();
let proximoJogo = 1;

function buscarUsuario(id) {
    return usuarios[id];
}

function buscarPokemon(texto) {
    const busca = String(texto ?? "").trim().toLowerCase();

    return pokedex.find((pokemon) =>
        pokemon.id === busca.padStart(3, "0") ||
        pokemon.pokemon.toLowerCase() === busca
    );
}

function mostrarPokemon(pokemon) {
    return {
        id: pokemon.id,
        pokemon: pokemon.pokemon,
        tipos: tiposDe(pokemon),
        peso: pokemon.peso,
        altura: pokemon.altura,
        raridade: pokemon.raridade,
        imagem: pokemon.imagem
    };
}

function sortearPokemon() {
    const indice = Math.floor(Math.random() * pokedex.length);
    return pokedex[indice];
}

// true quando o jogador está na sua última tentativa (e a partida não acabou)
function ultimaTentativa(partida) {
    return !partida.finalizada && MAX_TENTATIVAS - partida.tentativas === 1;
}

function buscarPartida(id, usuarioId) {
    const partida = partidas.get(id);

    if (!partida || partida.usuarioId !== usuarioId) {
        return null;
    }

    return partida;
}

function listPokedex(req, res) {
    const lista = req.query.id
        ? pokedex.filter((pokemon) => pokemon.id === String(req.query.id).padStart(3, "0"))
        : pokedex;

    return res.status(200).json(lista.map(mostrarPokemon));
}

function findPokemonByName(req, res) {
    const pokemon = buscarPokemon(req.params.pokemon);

    if (!pokemon) {
        return res.status(404).json({ erro: "Pokémon não encontrado" });
    }

    return res.status(200).json(mostrarPokemon(pokemon));
}

function getUserPokedex(req, res) {
    const usuario = buscarUsuario(req.params.userId);

    if (!usuario) {
        return res.status(404).json({ erro: "Jogador não encontrado" });
    }

    const lista = pokedex.map((pokemon) => {
        if (usuario.capturados.includes(pokemon.id)) {
            return { ...mostrarPokemon(pokemon), capturado: true };
        }

        return { id: pokemon.id, capturado: false };
    });

    return res.status(200).json({
        jogador: usuario.nome,
        total: pokedex.length,
        capturados: usuario.capturados.length,
        pokedex: lista
    });
}

function startGame(req, res) {
    const usuario = buscarUsuario(req.params.userId);

    if (!usuario) {
        return res.status(404).json({ erro: "Jogador não encontrado" });
    }

    const partidaAtiva = [...partidas.values()].find(
        (partida) => partida.usuarioId === usuario.id && !partida.finalizada
    );

    if (partidaAtiva) {
        return res.status(409).json({
            erro: "Já existe uma partida em andamento",
            gameId: partidaAtiva.id,
            tentativasRestantes: MAX_TENTATIVAS - partidaAtiva.tentativas
        });
    }

    const id = `jogo-${proximoJogo++}`;

    partidas.set(id, {
        id,
        usuarioId: usuario.id,
        secreto: sortearPokemon(),
        tentativas: 0,
        palpites: [],
        finalizada: false,
        resultado: null
    });

    return res.status(201).json({
        gameId: id,
        tentativasRestantes: MAX_TENTATIVAS
    });
}

function getGameState(req, res) {
    const usuario = buscarUsuario(req.params.userId);

    if (!usuario) {
        return res.status(404).json({ erro: "Jogador não encontrado" });
    }

    const partida = buscarPartida(req.params.gameId, usuario.id);

    if (!partida) {
        return res.status(404).json({ erro: "Partida não encontrada" });
    }

    const estado = {
        resultado: partida.resultado || "em_andamento",
        tentativas: partida.tentativas,
        tentativasRestantes: MAX_TENTATIVAS - partida.tentativas,
        palpites: partida.palpites
    };

    if (partida.finalizada) {
        estado.secreto = mostrarPokemon(partida.secreto);
    } else if (ultimaTentativa(partida)) {
        // Última chance: o front recebe só o endereço da silhueta,
        // nunca o id nem o nome do Pokémon secreto.
        estado.silhueta = `/users/${usuario.id}/games/${partida.id}/silhueta`;
    }

    return res.status(200).json(estado);
}

// Só libera a silhueta quando falta exatamente 1 tentativa
function getSilhouette(req, res) {
    const usuario = buscarUsuario(req.params.userId);

    if (!usuario) {
        return res.status(404).json({ erro: "Jogador não encontrado" });
    }

    const partida = buscarPartida(req.params.gameId, usuario.id);

    if (!partida) {
        return res.status(404).json({ erro: "Partida não encontrada" });
    }

    if (partida.finalizada || !ultimaTentativa(partida)) {
        return res.status(403).json({ erro: "A silhueta só aparece na última tentativa" });
    }

    const arquivo = path.join(__dirname, "..", "public", "assets", "pokemon", `${partida.secreto.id}.png`);

    res.set("Cache-Control", "no-store");
    return res.sendFile(arquivo);
}

function makeGuess(req, res) {
    const usuario = buscarUsuario(req.params.userId);

    if (!usuario) {
        return res.status(404).json({ erro: "Jogador não encontrado" });
    }

    const partida = buscarPartida(req.params.gameId, usuario.id);

    if (!partida) {
        return res.status(404).json({ erro: "Partida não encontrada" });
    }

    if (partida.finalizada) {
        return res.status(400).json({ erro: "Esta partida já foi finalizada" });
    }

    const palpite = buscarPokemon(req.body.pokemon);

    if (!palpite) {
        return res.status(404).json({ erro: "Pokémon não encontrado" });
    }

    if (partida.palpites.some((pokemon) => pokemon.id === palpite.id)) {
        return res.status(400).json({ erro: "Você já tentou esse Pokémon" });
    }

    partida.tentativas++;

    const dicas = compararPalpite(palpite, partida.secreto);

    partida.palpites.push({
        id: palpite.id,
        pokemon: palpite.pokemon,
        imagem: palpite.imagem,
        dicas
    });

    const tentativasRestantes = MAX_TENTATIVAS - partida.tentativas;

    if (dicas.acertou) {
        partida.finalizada = true;
        partida.resultado = "vitoria";

        if (!usuario.capturados.includes(partida.secreto.id)) {
            usuario.capturados.push(partida.secreto.id);
        }

        return res.status(200).json({
            resultado: "vitoria",
            dicas,
            tentativasRestantes,
            capturado: mostrarPokemon(partida.secreto)
        });
    }

    if (tentativasRestantes === 0) {
        partida.finalizada = true;
        partida.resultado = "derrota";

        return res.status(200).json({
            resultado: "derrota",
            dicas,
            tentativasRestantes: 0,
            secreto: mostrarPokemon(partida.secreto)
        });
    }

    return res.status(200).json({
        resultado: "em_andamento",
        dicas,
        tentativasRestantes
    });
}

module.exports = {
    listPokedex,
    findPokemonByName,
    getUserPokedex,
    startGame,
    getGameState,
    getSilhouette,
    makeGuess
};
