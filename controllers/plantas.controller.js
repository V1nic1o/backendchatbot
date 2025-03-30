// plantas.controller.js
const pool = require('../db');

// Obtener todas las plantas
exports.obtenerTodas = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM plantas ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener todas las plantas' });
  }
};

// Obtener planta por nombre
exports.obtenerPlantaPorNombre = async (req, res) => {
  const { nombre } = req.params;
  try {
    const resultado = await pool.query(
      'SELECT * FROM plantas WHERE LOWER(nombre) = LOWER($1)',
      [nombre]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Planta no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener planta' });
  }
};

// Listar plantas disponibles
exports.listarDisponibles = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM plantas WHERE disponibilidad = true');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener plantas disponibles' });
  }
};

// Crear nueva planta con imagen y atributos múltiples
exports.crearPlanta = async (req, res) => {
  const imagen = req.file ? `/uploads/${req.file.filename}` : null;
  let { nombre, precio, disponibilidad, clima, tamanio, luz, riego } = req.body;

  // Parsear los campos que se enviaron como JSON desde el frontend
  try {
    clima = JSON.parse(clima);
    tamanio = JSON.parse(tamanio);
    luz = JSON.parse(luz);
    riego = JSON.parse(riego);
  } catch (error) {
    console.log('Error al parsear JSON:', error);
  }

  disponibilidad = (disponibilidad === 'true' || disponibilidad === true);

  // Validar que se envíen datos en cada campo
  if (!nombre || !imagen || precio == null || disponibilidad == null ||
      !clima || (Array.isArray(clima) && clima.length === 0) ||
      !tamanio || (Array.isArray(tamanio) && tamanio.length === 0) ||
      !luz || (Array.isArray(luz) && luz.length === 0) ||
      !riego || (Array.isArray(riego) && riego.length === 0)
  ) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  // Formatear cada array a minúsculas y sin espacios extra
  const climaArray = Array.isArray(clima) ? clima.map(item => item.trim().toLowerCase()) : [clima.trim().toLowerCase()];
  const tamanioArray = Array.isArray(tamanio) ? tamanio.map(item => item.trim().toLowerCase()) : [tamanio.trim().toLowerCase()];
  const luzArray = Array.isArray(luz) ? luz.map(item => item.trim().toLowerCase()) : [luz.trim().toLowerCase()];
  const riegoArray = Array.isArray(riego) ? riego.map(item => item.trim().toLowerCase()) : [riego.trim().toLowerCase()];

  try {
    const resultado = await pool.query(
      `INSERT INTO plantas 
      (nombre, imagen_url, precio, disponibilidad, clima, tamanio, luz, riego)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        nombre,
        imagen,
        parseFloat(precio),
        disponibilidad,
        climaArray,
        tamanioArray,
        luzArray,
        riegoArray
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al agregar planta:', error);
    res.status(500).json({ error: 'Error al agregar la planta' });
  }
};

// Actualizar planta con atributos múltiples
exports.actualizarPlanta = async (req, res) => {
  const { id } = req.params;
  let { nombre, precio, disponibilidad, imagen_url_actual, clima, tamanio, luz, riego } = req.body;
  const imagen_url = req.file ? `/uploads/${req.file.filename}` : imagen_url_actual;
  disponibilidad = (disponibilidad === 'true' || disponibilidad === true);

  // Parsear los arrays enviados
  try {
    clima = JSON.parse(clima);
    tamanio = JSON.parse(tamanio);
    luz = JSON.parse(luz);
    riego = JSON.parse(riego);
  } catch (error) {
    console.log('Error al parsear JSON:', error);
  }

  const climaArray = Array.isArray(clima) ? clima.map(item => item.trim().toLowerCase()) : [clima.trim().toLowerCase()];
  const tamanioArray = Array.isArray(tamanio) ? tamanio.map(item => item.trim().toLowerCase()) : [tamanio.trim().toLowerCase()];
  const luzArray = Array.isArray(luz) ? luz.map(item => item.trim().toLowerCase()) : [luz.trim().toLowerCase()];
  const riegoArray = Array.isArray(riego) ? riego.map(item => item.trim().toLowerCase()) : [riego.trim().toLowerCase()];

  try {
    const resultado = await pool.query(
      `UPDATE plantas SET
        nombre = $1,
        imagen_url = $2,
        precio = $3,
        disponibilidad = $4,
        clima = $5,
        tamanio = $6,
        luz = $7,
        riego = $8
      WHERE id = $9
      RETURNING *`,
      [
        nombre,
        imagen_url,
        parseFloat(precio),
        disponibilidad,
        climaArray,
        tamanioArray,
        luzArray,
        riegoArray,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar planta:', error);
    res.status(500).json({ error: 'Error al actualizar la planta' });
  }
};

// Eliminar planta
exports.eliminarPlanta = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM plantas WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }
    res.json({ mensaje: 'Planta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar planta:', error);
    res.status(500).json({ error: 'Error al eliminar la planta' });
  }
};
