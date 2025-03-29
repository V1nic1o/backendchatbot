// middleware/chatbotTimeout.js

// Estructura en memoria para controlar el tiempo de inactividad por chatId
const estadosChat = {};

const chatbotTimeoutMiddleware = (req, res, next) => {
  const { chatId } = req.body;

  if (!chatId) return next(); // Si no hay chatId, continuar normalmente

  // Reiniciar el temporizador si ya existe
  if (estadosChat[chatId]?.timeout) {
    clearTimeout(estadosChat[chatId].timeout);
  } else {
    estadosChat[chatId] = { estado: 'inicio' };
  }

  // Guardar el estado actual del chat para accederlo desde el controlador si es necesario
  req.estadoChat = estadosChat[chatId];

  // Configurar nuevo timeout para reiniciar flujo después de 5 minutos (300,000 ms)
  estadosChat[chatId].timeout = setTimeout(() => {
    estadosChat[chatId].estado = 'inicio';
    console.log(`⏱️ Chat ${chatId} reiniciado por inactividad.`);
  }, 5 * 60 * 1000);

  next();
};

// Exportar referencia al objeto de estados para el controlador
module.exports = { chatbotTimeoutMiddleware, estadosChat };
