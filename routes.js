const { Router } = require("express");
const {
  createUser,
  listUser,
  listPokedex,
  findUserById,
  deleteUser,
  updateUser,
} = require("./controllers/users");

const routes = Router();

routes.get("/", (req, res) => {
  res.status(200).json("Bem-Vindo ao Poketech");
});

routes.post("/users", createUser);

// routes.get("/users", listUser);

routes.get("/users/pokedex", listPokedex);

// routes.get("/users/:id", findUserById);

// routes.delete("/users/:id", deleteUser);

// routes.put("/users/:id", updateUser);

module.exports = routes;
