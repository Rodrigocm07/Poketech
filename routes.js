const { Router } = require("express");
const {
  createUser,
  listPokedex,
  findPokemonByName,
  updateStatus,
} = require("./controllers/users");

const routes = Router();

routes.get("/", (req, res) => {
  res.status(200).json("Bem-Vindo ao Poketech");
});

routes.get("/users/pokedex/", listPokedex);

routes.get("/users/pokedex/:pokemon", findPokemonByName);

routes.put("/users/pokedex/:id", updateStatus);

module.exports = routes;
