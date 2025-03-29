const express = require('express');
const router = express.Router();
const multer = require('multer');
const controlador = require('../controllers/plantas.controller');

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Rutas para las plantas
router.get('/', controlador.obtenerTodas);
router.get('/disponibles', controlador.listarDisponibles);
router.get('/:nombre', controlador.obtenerPlantaPorNombre);

// ✅ Ruta POST que acepta imagen
router.post('/', upload.single('imagen'), controlador.crearPlanta);

router.put('/:id', upload.single('imagen'), controlador.actualizarPlanta);
router.delete('/:id', controlador.eliminarPlanta);

module.exports = router;
