const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const controlador = require('../controllers/plantas.controller');

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 📦 Rutas para plantas
router.get('/', controlador.obtenerTodas);
router.get('/disponibles', controlador.listarDisponibles);
router.get('/:nombre', controlador.obtenerPlantaPorNombre);

// 🌱 Crear planta con imagen y atributos
router.post('/', upload.single('imagen'), controlador.crearPlanta);

// 📝 Actualizar planta con o sin nueva imagen
router.put('/:id', upload.single('imagen'), controlador.actualizarPlanta);

// ❌ Eliminar planta
router.delete('/:id', controlador.eliminarPlanta);

module.exports = router;
