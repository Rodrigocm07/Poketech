const express = require("express");
const path = require("path");
const routes = require("./routes");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

app.listen(3001, () => {
  console.log("Poketech disponível em http://localhost:3001");
});
