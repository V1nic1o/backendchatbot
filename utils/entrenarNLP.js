const natural = require('natural');
const fs = require('fs');

const classifier = new natural.BayesClassifier();

/* ================================
   INTENCIÓN: cotizar
================================ */
classifier.addDocument('quiero cotizar una planta', 'cotizar');
classifier.addDocument('me gustaria cotizar', 'cotizar');
classifier.addDocument('cotizar', 'cotizar');
classifier.addDocument('puedo cotizar una planta', 'cotizar');
classifier.addDocument('necesito una cotizacion', 'cotizar');
classifier.addDocument('cotizacion', 'cotizar');
classifier.addDocument('quiero saber el precio', 'cotizar');
classifier.addDocument('precio de la planta', 'cotizar');
classifier.addDocument('cuanto cuesta una planta', 'cotizar');
classifier.addDocument('cual es el precio de una planta', 'cotizar');
classifier.addDocument('cuanto vale la planta', 'cotizar');
classifier.addDocument('cuanto sale una planta', 'cotizar');
classifier.addDocument('cuanto cuesta', 'cotizar');
classifier.addDocument('cuanto vale', 'cotizar');
classifier.addDocument('quiero saber cuanto vale', 'cotizar');
classifier.addDocument('cuanto es la planta', 'cotizar');
classifier.addDocument('cuanto cuesta esta planta', 'cotizar');
classifier.addDocument('cuanto cuesta esa planta', 'cotizar');
classifier.addDocument('quisiera cotizar una', 'cotizar');
classifier.addDocument('podria cotizar una planta', 'cotizar');
classifier.addDocument('me puedes dar precio', 'cotizar');
classifier.addDocument('dame precio', 'cotizar');
classifier.addDocument('tienen precios de plantas', 'cotizar');
classifier.addDocument('me interesa saber el precio', 'cotizar');

/* ================================
   INTENCIÓN: saludo
================================ */
classifier.addDocument('hola', 'saludo');
classifier.addDocument('holaaa', 'saludo');
classifier.addDocument('buenas', 'saludo');
classifier.addDocument('buenas tardes', 'saludo');
classifier.addDocument('buenos dias', 'saludo');
classifier.addDocument('que onda', 'saludo');
classifier.addDocument('hola buenas', 'saludo');
classifier.addDocument('saludos', 'saludo');
classifier.addDocument('hola que tal', 'saludo');
classifier.addDocument('hey', 'saludo');
classifier.addDocument('ey', 'saludo');
classifier.addDocument('ola', 'saludo');
classifier.addDocument('holi', 'saludo');
classifier.addDocument('holis', 'saludo');
classifier.addDocument('buen dia', 'saludo');

/* ================================
   INTENCIÓN: despedida
================================ */
classifier.addDocument('adios', 'despedida');
classifier.addDocument('me voy', 'despedida');
classifier.addDocument('hasta luego', 'despedida');
classifier.addDocument('gracias', 'despedida');
classifier.addDocument('muchas gracias', 'despedida');
classifier.addDocument('nos vemos', 'despedida');
classifier.addDocument('chau', 'despedida');
classifier.addDocument('bye', 'despedida');
classifier.addDocument('ok gracias', 'despedida');
classifier.addDocument('eso es todo gracias', 'despedida');
classifier.addDocument('ya no necesito nada', 'despedida');
classifier.addDocument('listo gracias', 'despedida');
classifier.addDocument('vale gracias', 'despedida');
classifier.addDocument('todo bien gracias', 'despedida');
classifier.addDocument('bueno gracias', 'despedida');
classifier.addDocument('grx', 'despedida');
classifier.addDocument('thx', 'despedida');
classifier.addDocument('thank you', 'despedida');

// Entrenar el modelo
classifier.train();

// Guardar el modelo
classifier.save('./utils/modeloNLP.json', (err, classifier) => {
  if (err) console.error('❌ Error al guardar modelo NLP:', err);
  else console.log('✅ Modelo NLP entrenado y guardado correctamente.');
});
