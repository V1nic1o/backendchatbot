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


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// ✅ Servir imágenes desde /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Inicializar req.chatStates
app.use((req, res, next) => {
  if (!global.chatStates) global.chatStates = {};
  req.chatStates = global.chatStates;
  next();
});

// 🕒 Middleware de inactividad
app.use(chatbotTimeoutMiddleware);



// 🌱 Conexión a la base de datos
pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar con PostgreSQL:', err));

// 📦 Rutas
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