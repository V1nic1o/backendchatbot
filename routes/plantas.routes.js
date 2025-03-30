// routes/plantas.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const controlador = require('../controllers/plantas.controller');

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Rutas para las plantas
router.get('/', controlador.obtenerTodas);
router.get('/disponibles', controlador.listarDisponibles);
router.get('/:nombre', controlador.obtenerPlantaPorNombre);

// ✅ Crear planta con imagen (desde formulario con imagen)
router.post('/', upload.single('imagen'), controlador.crearPlanta);

// ✅ Crear planta desde JSON (sin imagen)
router.post('/json', controlador.crearPlantaDesdeJSON);

// ✅ Actualizar planta con o sin nueva imagen
router.put('/:id', upload.single('imagen'), controlador.actualizarPlanta);

// ✅ Eliminar planta
router.delete('/:id', controlador.eliminarPlanta);

module.exports = router;
