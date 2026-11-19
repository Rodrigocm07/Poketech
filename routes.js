const { Router } = require("express");
const {
  listPokedex,
  findPokemonByName,
  updateStatus,
  SortPokemonByRarity,
  getSortedPokemon,
  compararNumero,
  compararTipo,
  compararPesos,
  compararAlturas,
  compararIndex
} = require("./controllers/users");

const routes = Router();

routes.get("/", (req, res) => {
  res.status(200).json("Bem-Vindo ao Poketech");
});

routes.get("/users/pokedex/", listPokedex);

routes.get("/users/pokedex/sort", SortPokemonByRarity);

routes.get("/users/pokedex/sorted", getSortedPokemon);

routes.get("/users/pokedex/:pokemon", findPokemonByName);

routes.put("/users/pokedex/:id", updateStatus);



module.exports = routes;
