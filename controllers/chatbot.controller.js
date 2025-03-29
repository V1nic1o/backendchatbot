const pool = require('../db');
const { clasificarFrase } = require('../ia-local');

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
    const clasificacion = clasificarFrase(mensaje);
    if (clasificacion === 'cotizar') {
      return manejarCotizar(req, res, chatId);
    } else {
      return res.json({
        chatId,
        respuesta: '❗ Opción no válida. Por favor escribe "cotizar" o "finalizar".'
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
    respuesta: '✅ Conversación finalizada. Escribe un nuevo mensaje para comenzar otra vez.'
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
