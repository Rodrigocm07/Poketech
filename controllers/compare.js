const numero = (texto) => parseFloat(String(texto).replace(",", "."));

function compararNumero(palpite, secreto) {
  const a = numero(palpite);
  const b = numero(secreto);
  if (a === b) return "igual";
  return b > a ? "maior" : "menor";
}

// Devolve o valor do PALPITE junto com a comparação.
// Ex: { valor: "6,9 kg", resultado: "maior" }
// ("maior" = o secreto é maior que o palpite)
function dicaNumero(palpite, secreto) {
  return {
    valor: palpite,
    resultado: compararNumero(palpite, secreto),
  };
}

function tiposDe(pokemon) {
  return [pokemon.tipo1, pokemon.tipo2].filter(Boolean);
}

function compararPalpite(palpite, secreto) {
  const tiposSecreto = tiposDe(secreto);

  return {
    acertou: palpite.id === secreto.id,
    id: dicaNumero(palpite.id, secreto.id),
    peso: dicaNumero(palpite.peso, secreto.peso),
    altura: dicaNumero(palpite.altura, secreto.altura),
    tipos: tiposDe(palpite).map((tipo, i) => ({
      tipo,
      resultado:
        tipo === tiposSecreto[i]
          ? "certo"
          : tiposSecreto.includes(tipo)
            ? "existe"
            : "errado",
    })),
  };
}

module.exports = { compararNumero, compararPalpite, tiposDe };