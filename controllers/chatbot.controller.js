const pool = require('../db');
const natural = require('natural');
const { clasificarFrase } = require('../ia-local');

// Cargar modelo NLP entrenado
let clasificador;
natural.BayesClassifier.load('./utils/modeloNLP.json', null, (err, classifier) => {
  if (err) console.error('❌ Error al cargar modelo NLP:', err);
  else {
    clasificador = classifier;
    console.log('✅ Modelo NLP cargado con éxito.');
  }
});

// Función para mensaje inicial
const mensajeInicial = (req, res, chatId) => {
  req.chatStates[chatId] = 'esperando_opcion';
  return res.json({
    chatId,
    respuesta: `👋 Hola, soy el Chatbot del vivero 🌿. Estoy listo para ayudarte.\n\n📄 Conoce nuestros términos y condiciones.\n\n❓ ¿Qué necesitas hacer?\n1. 📝 Cotizar planta\n2. ❌ Finalizar conversación`,
    botones: [
      { texto: 'Cotizar Planta', accion: 'cotizar' },
      { texto: 'Finalizar Conversación', accion: 'finalizar' }
    ]
  });
};

const chatbotController = async (req, res) => {
  let mensaje = req.body.mensaje?.toLowerCase().trim();
  let chatId = req.body.chatId;

  // Generar chatId si no existe
  if (!chatId) {
    chatId = Date.now().toString();
  }

  if (!mensaje) {
    return res.status(400).json({ respuesta: 'No se proporcionó mensaje.' });
  }

  if (!req.chatStates[chatId]) {
    req.chatStates[chatId] = 'inicio';
  }

  const estado = req.chatStates[chatId];
  console.log(`💬 [${chatId}] Estado actual: ${estado} | Mensaje: ${mensaje}`);

  if (['salir', 'terminar', 'finalizar', 'adios'].includes(mensaje)) {
    return finalizarConversacion(req, res, chatId);
  }

  if (estado === 'esperando_retorno') {
    return manejarRetorno(req, res, chatId, mensaje);
  }

  if (estado === 'inicio') {
    return mensajeInicial(req, res, chatId);
  }

  if (estado === 'esperando_opcion') {
    // 👉 Clasificación usando el modelo NLP si está cargado
    if (clasificador) {
      const intent = clasificador.classify(mensaje);
      console.log(`🧠 Intento clasificado como: ${intent}`);

      switch (intent) {
        case 'cotizar':
          return manejarCotizar(req, res, chatId);
        case 'recomendar_sombra':
          return res.json({
            chatId,
            respuesta: '🌿 Te recomiendo plantas para sombra como la *Calathea* o el *Helecho*. (Pronto podrás ver más sugerencias personalizadas)',
          });
        case 'recomendar_riego_bajo':
          return res.json({
            chatId,
            respuesta: '💧 Algunas plantas que requieren poco riego son el *Cactus* y la *Sansevieria*.',
          });
        case 'saludo':
          return res.json({
            chatId,
            respuesta: '👋 ¡Hola! ¿En qué puedo ayudarte hoy?',
          });
        case 'despedida':
          return finalizarConversacion(req, res, chatId);
        default:
          return res.json({
            chatId,
            respuesta: '🤖 No entendí tu mensaje. Por favor escribe una opción como "cotizar" o "quiero una planta para sombra".',
          });
      }
    } else {
      return res.json({
        chatId,
        respuesta: '🤖 Estoy cargando mi inteligencia... intenta de nuevo en unos segundos.',
      });
    }
  }

  if (estado === 'esperando_nombre') {
    return buscarPlanta(req, res, chatId, mensaje);
  }

  return res.json({ chatId, respuesta: '🤖 No entendí tu mensaje. Por favor selecciona una opción válida.' });
};

const finalizarConversacion = (req, res, chatId) => {
  req.chatStates[chatId] = 'inicio';
  return res.json({
    chatId,
    respuesta: '✅ Conversación finalizada. Escribe un nuevo mensaje para comenzar otra vez.',
  });
};

const manejarRetorno = (req, res, chatId, mensaje) => {
  if (['sí', 'si'].includes(mensaje)) {
    req.chatStates[chatId] = 'esperando_nombre';
    return res.json({ chatId, respuesta: '✍️ Escribe el nombre de la planta que deseas cotizar.' });
  } else if (['no'].includes(mensaje)) {
    req.chatStates[chatId] = 'inicio';
    return res.json({ chatId, respuesta: '✅ Gracias por usar nuestro servicio. Puedes iniciar otra conversación cuando lo desees.' });
  }
  return res.json({ chatId, respuesta: '🤖 No entendí tu respuesta. Escribe "sí" o "no".' });
};

const manejarCotizar = (req, res, chatId) => {
  req.chatStates[chatId] = 'esperando_nombre';
  return res.json({ chatId, respuesta: '✍️ Escribe el nombre de la planta que deseas cotizar.' });
};

const buscarPlanta = async (req, res, chatId, nombrePlanta) => {
  try {
    const resultado = await pool.query('SELECT * FROM plantas WHERE LOWER(nombre) = $1', [nombrePlanta.toLowerCase()]);

    if (resultado.rows.length === 0) {
      return res.json({ chatId, respuesta: `😔 No encontré "${nombrePlanta}" en nuestra base de datos.` });
    }

    const planta = resultado.rows[0];
    req.chatStates[chatId] = 'esperando_retorno';

    return res.json({
      chatId,
      respuesta: `🌱 *${planta.nombre}*\n💲 Precio: Q${planta.precio}\n📦 Disponible: ${planta.disponible ? 'Sí' : 'No'}`,
      imagen: planta.imagen,
      botones: [
        { texto: 'Sí, cotizar otra', accion: 'sí' },
        { texto: 'No, finalizar', accion: 'no' }
      ]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ chatId, respuesta: '❌ Error al buscar la planta.' });
  }
};

module.exports = { manejarMensaje: chatbotController };
