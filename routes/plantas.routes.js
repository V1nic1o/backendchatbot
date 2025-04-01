const express = require('express');
const router = express.Router();
const controlador = require('../controllers/plantas.controller');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary'); // ajusta la ruta si es necesario

// Configuración del storage para Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'plantas',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit' }]
  }
});

const upload = multer({ storage });

// Rutas
router.get('/', controlador.obtenerTodas);
router.get('/disponibles', controlador.listarDisponibles);
router.get('/:nombre', controlador.obtenerPlantaPorNombre);
router.post('/plantas', upload.single('imagen'), controlador.crearPlanta);
router.put('/:id', upload.single('imagen'), controlador.actualizarPlanta);
router.delete('/:id', controlador.eliminarPlanta);

module.exports = router;
