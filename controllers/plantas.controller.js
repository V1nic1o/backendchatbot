// controllers/plantas.controller.js
const pool = require('../db');

// Función para normalizar texto
const normalizarTexto = (txt) => txt?.trim().toLowerCase() || null;

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

// Crear nueva planta con imagen y atributos
exports.crearPlanta = async (req, res) => {
  try {
    const {
      nombre,
      precio,
      disponibilidad,
      clima,
      tamanio,
      luz,
      riego
    } = req.body;

    const imagen = req.file ? `/uploads/${req.file.filename}` : null;

    // Verifica si realmente llegan los datos
    console.log('BODY:', req.body);
    console.log('IMAGEN:', imagen);

    if (!nombre || !imagen || precio == null || disponibilidad == null || !clima || !tamanio || !luz || !riego) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const resultado = await pool.query(
      `INSERT INTO plantas 
      (nombre, imagen_url, precio, disponibilidad, clima, tamanio, luz, riego)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [nombre, imagen, precio, disponibilidad, clima, tamanio, luz, riego]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en crearPlanta:', error);
    res.status(500).json({ error: 'Error al agregar la planta' });
  }
};


// Actualizar planta con o sin nueva imagen y atributos
exports.actualizarPlanta = async (req, res) => {
  const { id } = req.params;
  const {
    nombre, precio, disponibilidad,
    imagen_url_actual, clima, tamanio, luz, riego
  } = req.body;

  let imagen_url = imagen_url_actual;
  if (req.file) {
    imagen_url = `/uploads/${req.file.filename}`;
  }

  // Normalizar atributos
  const climaNorm = normalizarTexto(clima);
  const tamanioNorm = normalizarTexto(tamanio);
  const luzNorm = normalizarTexto(luz);
  const riegoNorm = normalizarTexto(riego);

  try {
    const resultado = await pool.query(
      `UPDATE plantas SET 
      nombre = $1, imagen_url = $2, precio = $3, disponibilidad = $4,
      clima = $5, tamanio = $6, luz = $7, riego = $8
      WHERE id = $9
      RETURNING *`,
      [nombre, imagen_url, precio, disponibilidad, climaNorm, tamanioNorm, luzNorm, riegoNorm, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la planta' });
  }
};
