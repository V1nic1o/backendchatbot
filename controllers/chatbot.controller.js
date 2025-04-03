const pool = require('../db');
const natural = require('natural');
const { clasificarFrase } = require('../ia-local');
const { recomendarPlantas } = require('../recomendador'); // nuevo archivo que crearás

// Cargar modelo NLP
let clasificador;
natural.BayesClassifier.load('./utils/modeloNLP.json', null, (err, classifier) => {
  if (err) console.error('❌ Error al cargar modelo NLP:', err);
  else {
    clasificador = classifier;
    console.log('✅ Modelo NLP cargado con éxito.');
  }
});

// Almacén de preferencias por usuario (temporal)
const recomendaciones = {};

const chatbotController = async (req, res) => {
  let mensaje = req.body.mensaje?.toLowerCase().trim();
  let chatId = req.body.chatId;

  if (!chatId) chatId = Date.now().toString();
  if (!mensaje) return res.status(400).json({ respuesta: 'No se proporcionó mensaje.' });
  if (!req.chatStates[chatId]) req.chatStates[chatId] = 'inicio';

  const estado = req.chatStates[chatId];
  console.log(`💬 [${chatId}] Estado: ${estado} | Mensaje: ${mensaje}`);

  if (['salir', 'terminar', 'finalizar', 'adios'].includes(mensaje)) {
    return finalizarConversacion(req, res, chatId);
  }

  // 🔄 Flujo del recomendador guiado
  if (estado.startsWith('recomendar')) {
    return manejarRecomendador(req, res, chatId, mensaje);
  }

  if (estado === 'esperando_retorno') {
    return manejarRetorno(req, res, chatId, mensaje);
  }

  if (estado === 'inicio') {
    return mensajeInicial(req, res, chatId);
  }

  if (estado === 'esperando_opcion') {
    if (clasificador) {
      const intent = clasificador.classify(mensaje);
      console.log(`🧠 Intento clasificado como: ${intent}`);

      switch (intent) {
        case 'cotizar':
          return manejarCotizar(req, res, chatId);
        case 'saludo':
          return mensajeInicial(req, res, chatId);
        case 'despedida':
          return finalizarConversacion(req, res, chatId);
        case 'recomendar':
        case 'recomendador de plantas':
          recomendaciones[chatId] = {};
          req.chatStates[chatId] = 'recomendar_clima';
          return res.json({
            chatId,
            respuesta: '🌤 ¿Qué tipo de clima prefieres?',
            botones: [
              { texto: 'Cálido', accion: 'cálido' },
              { texto: 'Templado', accion: 'templado' },
              { texto: 'Frío', accion: 'frío' }
            ]
          });
        case 'servicio_cliente':
          return res.json({ chatId, respuesta: '📞 Un asesor se comunicará contigo pronto. Gracias por escribirnos.' });
        default:
          return res.json({ chatId, respuesta: '🤖 No entendí tu mensaje. Selecciona una opción con los botones.' });
      }
    } else {
      return res.json({ chatId, respuesta: '🤖 Estoy cargando mi inteligencia... intenta de nuevo en unos segundos.' });
    }
  }

  if (estado === 'esperando_nombre') {
    return buscarPlanta(req, res, chatId, mensaje);
  }

  return res.json({ chatId, respuesta: '🤖 No entendí tu mensaje. Por favor selecciona una opción válida.' });
};

// 🌱 Manejar preguntas del recomendador
const manejarRecomendador = async (req, res, chatId, mensaje) => {
  const preferencias = recomendaciones[chatId] || {};

  switch (req.chatStates[chatId]) {
    case 'recomendar_clima':
      preferencias.clima = mensaje;
      req.chatStates[chatId] = 'recomendar_tamanio';
      return res.json({
        chatId,
        respuesta: '📏 ¿Qué tamaño buscas?',
        botones: [
          { texto: 'Pequeño', accion: 'pequeño' },
          { texto: 'Mediano', accion: 'mediano' },
          { texto: 'Grande', accion: 'grande' }
        ]
      });

    case 'recomendar_tamanio':
      preferencias.tamanio = mensaje;
      req.chatStates[chatId] = 'recomendar_luz';
      return res.json({
        chatId,
        respuesta: '💡 ¿Qué tipo de luz tiene el lugar?',
        botones: [
          { texto: 'Sol directo', accion: 'sol directo' },
          { texto: 'Semisombra', accion: 'semisombra' },
          { texto: 'Sombra', accion: 'sombra' }
        ]
      });

    case 'recomendar_luz':
      preferencias.luz = mensaje;
      req.chatStates[chatId] = 'recomendar_riego';
      return res.json({
        chatId,
        respuesta: '💧 ¿Qué nivel de riego deseas?',
        botones: [
          { texto: 'Bajo', accion: 'bajo' },
          { texto: 'Medio', accion: 'medio' },
          { texto: 'Alto', accion: 'alto' }
        ]
      });

    case 'recomendar_riego':
      preferencias.riego = mensaje;
      req.chatStates[chatId] = 'inicio';

      const plantas = await recomendarPlantas(preferencias);
      if (!plantas.length) {
        return res.json({
          chatId,
          respuesta: '😔 No encontramos plantas con esas características. ¿Querés intentar con otros filtros?',
        });
      }

      const respuestaPlantas = plantas.map(p => (
        `🌱 *${p.nombre}*\n💲 Q${p.precio} | 📦 ${p.disponibilidad ? 'Disponible' : 'Agotada'}`
      )).join('\n\n');

      return res.json({
        chatId,
        respuesta: `🌿 Aquí tienes algunas plantas que se ajustan a tus preferencias:\n\n${respuestaPlantas}`
      });

    default:
      return res.json({ chatId, respuesta: '🤖 Error en el flujo del recomendador.' });
  }
};

const mensajeInicial = (req, res, chatId) => {
  req.chatStates[chatId] = 'esperando_opcion';
  return res.json({
    chatId,
    respuesta: '👋 ¡Hola! Soy el asistente del vivero 🌿. ¿En qué puedo ayudarte hoy?\n\nSelecciona una opción:',
    botones: [
      { texto: 'Cotizar Planta', accion: 'cotizar' },
      { texto: 'Recomendador de Plantas', accion: 'recomendar' },
      { texto: 'Servicio al Cliente', accion: 'servicio_cliente' },
      { texto: 'Finalizar Conversación', accion: 'finalizar' }
    ]
  });
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
      respuesta: `🌱 *${planta.nombre}*\n💲 Precio: Q${planta.precio}\n📦 Disponible: ${planta.disponibilidad ? 'Sí' : 'No'}`,
      imagen: planta.imagen_url,
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
