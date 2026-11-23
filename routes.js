const { Router } = require("express");
const {
  listPokedex,
  findPokemonByName,
  getUserPokedex,
  startGame,
  getGameState,
  makeGuess,
} = require("./controllers/users");

const routes = Router();

routes.get("/", (req, res) => {
  res.status(200).json("Bem-Vindo ao Poketech");
});

routes.get("/pokedex", listPokedex);
routes.get("/pokedex/:pokemon", findPokemonByName);

routes.get("/users/:userId/pokedex", getUserPokedex);
routes.post("/users/:userId/games", startGame);
routes.get("/users/:userId/games/:gameId", getGameState);
routes.post("/users/:userId/games/:gameId/guess", makeGuess);

module.exports = routes;
