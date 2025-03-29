const chatStates = {}; // Memoria temporal para estados

function verificarInactividad(req, res, next) {
  const chatId = req.body.chatId;

  // Si no hay chatId, continúa sin hacer nada
  if (!chatId) {
    req.chatStates = chatStates;
    return next();
  }

  // Si no existe el estado del chat, inicialízalo
  if (!chatStates[chatId]) {
    chatStates[chatId] = { estado: 'inicio', timestamp: Date.now() };
  }

  const ahora = Date.now();
  const { timestamp } = chatStates[chatId];

  // Reiniciar si hubo más de 5 minutos de inactividad
  if (ahora - timestamp > 5 * 60 * 1000) {
    chatStates[chatId] = { estado: 'inicio', timestamp: ahora };
  }

  chatStates[chatId].timestamp = ahora;
  req.chatStates = chatStates;
  req.estadoChat = chatStates[chatId].estado;

  next();
}

module.exports = verificarInactividad;
