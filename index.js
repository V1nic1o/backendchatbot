const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const plantaRoutes = require('./routes/plantas.routes');
const iaRoutes = require('./routes/ia.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const chatbotTimeoutMiddleware = require('./middlewares/chatbot.middleware');
const pool = require('./db');

dotenv.config();
const app = express();

// ✅ Middleware para leer cuerpos JSON y formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ CORS (para desarrollo con frontend en localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ✅ Servir imágenes desde /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Inicializar estado del chatbot
app.use((req, res, next) => {
  if (!global.chatStates) global.chatStates = {};
  req.chatStates = global.chatStates;
  next();
});

// 🕒 Middleware de inactividad del chatbot
app.use(chatbotTimeoutMiddleware);

// ✅ Confirmación de conexión al pool
console.log('✅ Conexión a PostgreSQL configurada (pool listo para usar)');

// 📦 Rutas principales
app.use('/plantas', plantaRoutes);
app.use('/ia', iaRoutes);
app.use('/chatbot', chatbotRoutes);

// ✅ Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente 🚀');
});

// ❌ Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
