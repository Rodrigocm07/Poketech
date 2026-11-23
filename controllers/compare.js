const numero = (texto) => parseFloat(String(texto).replace(",", "."));

function compararNumero(palpite, secreto) {
  const a = numero(palpite);
  const b = numero(secreto);
  if (a === b) return "igual";
  return b > a ? "maior" : "menor";
}

function tiposDe(pokemon) {
    return [pokemon.tipo1, pokemon.tipo2].filter(Boolean);
}
function compararPalpite(palpite, secreto) {
    const tiposSecreto = tiposDe(secreto);

    return {
        acertou: palpite.id === secreto.id,
        id: secreto.id > palpite.id ? "maior" :
            secreto.id < palpite.id ? "menor" : "igual",
        peso: compararNumero(palpite.peso, secreto.peso),
        altura: compararNumero(palpite.altura, secreto.altura),
         tipos: tiposDe(palpite).map((tipo, i) => ({
          tipo, resultado: tipo === tiposSecreto[i] ? "certo" : tiposSecreto.includes(tipo) ? "existe": "errado"
        }))
    };
}

module.exports = { compararNumero, compararPalpite, tiposDe };
