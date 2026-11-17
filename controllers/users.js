const pokedex = require("./pokedex.mock");
const users = [];

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

function listPokedex(req, res) {
  return res.status(200).json(pokedex);
}

module.exports = { createUser, listPokedex };
