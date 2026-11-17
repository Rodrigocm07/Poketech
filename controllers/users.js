const users = require("./users.mock");

function createUser(req, res) {
  const data = req.body;
  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username: data.username,
    password: data.password,
    pokedex: {
      id: data.id,
      pokemon: data.pokemon,
      peso: data.peso,
      altura: data.altura,
    },
  };
  users.push(newUser, pokedex);
  return res.status(201).json(newUser, pokedex);
}

module.exports = { createUser };
