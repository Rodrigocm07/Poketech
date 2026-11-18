const pokedex = require("./pokedex.mock");
const users = []; //NOTA: Ainda pode ser feito como usuario predefinido, conversar com a turma.

//LISTAR A POKEDEX
function listPokedex(req, res) {
  const { id } = req.query;

  if (id) {
    const PokemonFilter = pokedex.filter((pokemon) => pokemon.id === id);
    return res.status(200).json(PokemonFilter);
  }
  return res.status(200).json(pokedex);
}
//PARA MUDAR O STATUS DE DISPONIVEL PARA CAPTURADO (Isso é apenas uma ideia ainda)
function updateStatus(req, res) {
  const id = req.params.id;
  const { status } = req.body;
  const index = pokedex.findIndex((pokemon) => pokemon.id === id);
  const statusValidos = ["capturado", "disponivel"];

  if (index === -1) return res.status(404).json("Pokémon não encontrado");

  if (!statusValidos.includes(status)) {
    return res.status(400).json("Status inválido");
  }

  pokedex[index].status = status;
  return res.status(200).json(pokedex[index]);
}

const mapaPokemon = new Map(pokedex.map((p) => [p.pokemon.toLowerCase(), p]));

function findPokemonByName(req, res) {
  const nome = req.params.pokemon.toLowerCase().trim();

  const pokemonEncontrado = mapaPokemon.get(nome);

  if (!pokemonEncontrado) {
    return res.status(404).json({
      erro: "Pokémon não encontrado",
    });
  }

  return res.status(200).json(pokemonEncontrado);
}

function SortPokemonByRarity(req, res) {
  const candidatos = pokedex.filter(
    (p) => p.status === "disponivel"
  );

    if (candidatos.length === 0) {
    return res.status(404).json({ erro: "Nenhum Pokémon disponível" });
  }

  const sorteado = candidatos[Math.floor(Math.random() * candidatos.length)];
  return res.status(200).json(sorteado);
}

module.exports = {
  listPokedex,
  updateStatus,
  findPokemonByName,
  SortPokemonByRarity,
};
