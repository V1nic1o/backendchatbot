const express = require('express');
const router = express.Router();
const { manejarMensaje } = require('../controllers/chatbot.controller');

// Ruta principal del chatbot
router.post('/', (req, res) => {
  manejarMensaje(req, res);
});

// Ruta para finalizar manualmente
router.post('/finalizar', (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    return res.status(400).json({ respuesta: 'El parámetro chatId es obligatorio para finalizar la sesión.' });
  }

  if (chatId && req.chatStates) {
    delete req.chatStates[chatId];
  }

  return res.json({ respuesta: '✅ La sesión ha sido finalizada. Puedes iniciar una nueva conversación cuando lo desees.' });
});

module.exports = router;
