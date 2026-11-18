const pokedex = require("./pokedex.mock");
const users = []; //NOTA: Ainda pode ser feito como usuario predefinido, conversar com a turma. 

//CRIAR USUARIO COM A POKEDEX
function createUser(req, res) {
  const data = req.body;
  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username: data.username,
    password: data.password,
    pokedex: {
      id: data.id,
      pokemon: data.pokemon,
      tipo1: data.tipo1,
      tipo2: data.tipo2,
      peso: data.peso,
      altura: data.altura,
    },
  };
  users.push(newUser);
  return res.status(201).json(newUser);
}

//LISTAR A POKEDEX
function listPokedex(req, res) {
  const { id } = req.query;

  if (id) {
    const PokemonFilter = pokedex.filter(
      (pokemon) => pokemon.id === id,
    );
    return res.status(200).json(PokemonFilter);
  }
  return res.status(200).json(pokedex);
}

//PROCURAR POKEMON POR ID - Vai servir para usar no termo
function findPokemonById(req, res) {
  const currentPokemon = pokedex.find(
    (pokemon) => pokemon.id === req.params.id
  );

  if (!currentPokemon) return res.status(404).json("Pokémon não encontrado");

  return res.status(200).json(currentPokemon);
}

//PARA MUDAR O STATUS DE DISPONIVEL PARA CAPTURADO (Isso é apenas uma ideia ainda)
function updateStatus(req, res) {
  const { status } = req.body;
  const index = pokedex.findIndex((pokemon) => pokemon.id === req.params.id);

  if (!index === -1) return res.status(404).json("Pokémon não encontrado");

  const updateStatus = {
    id: users[index].id,
    status: status,
  };
  pokedex[index] = updateStatus;
  return res.status(200).json("Status editado com sucesso!");
}


module.exports = { createUser, listPokedex, findPokemonById, updateStatus };
