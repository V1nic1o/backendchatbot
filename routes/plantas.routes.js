const express = require('express');
const router = express.Router();
const controlador = require('../controllers/plantas.controller');

// 📦 Rutas para plantas
router.get('/', controlador.obtenerTodas);
router.get('/disponibles', controlador.listarDisponibles);
router.get('/:nombre', controlador.obtenerPlantaPorNombre);

// 🌱 Crear planta SIN imagen
router.post('/plantas', controlador.crearPlanta);

// 📝 Actualizar planta SIN imagen
router.put('/:id', controlador.actualizarPlanta);

// ❌ Eliminar planta
router.delete('/:id', controlador.eliminarPlanta);

module.exports = router;
