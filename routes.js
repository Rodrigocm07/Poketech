const { Router } = require("express");
const {
  createUser,
  listPokedex,
  findPokemonById,
  updateStatus,
} = require("./controllers/users");

const routes = Router();

routes.get("/", (req, res) => {
  res.status(200).json("Bem-Vindo ao Poketech");
});

routes.post("/users", createUser);

routes.get("/users/pokedex/", listPokedex);

routes.get("/users/pokedex/:id", findPokemonById);

 routes.put("/users/podedex/:id", updateStatus);

module.exports = routes;
