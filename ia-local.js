// ia-local.js
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const frasesCotizar = [
  'cotizar planta',
  'cuánto cuesta',
  'precio de la planta',
  'quiero saber el valor',
  'dame el precio',
  'cuánto vale',
  'me gustaría cotizar',
  'información de la planta',
  'quisiera cotizar una planta'
];

function clasificarFrase(input) {
  const tokensEntrada = tokenizer.tokenize(input.toLowerCase());

  for (const frase of frasesCotizar) {
    const tokensFrase = tokenizer.tokenize(frase.toLowerCase());

    const coincidencias = tokensFrase.filter(token => tokensEntrada.includes(token));
    const porcentaje = coincidencias.length / tokensFrase.length;

    if (porcentaje >= 0.5) return 'cotizar';
  }

  return 'desconocido';
}

module.exports = { clasificarFrase };
