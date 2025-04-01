const pool = require('../db');

// Función auxiliar para normalizar valores a arrays
const normalizarAArray = (valor) => {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor.map(v => v.trim().toLowerCase());
  return [valor.trim().toLowerCase()];
};

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

// Crear nueva planta SIN imagen
exports.crearPlanta = async (req, res) => {
  const {
    nombre,
    precio,
    disponibilidad,
    clima,
    tamanio,
    luz,
    riego
  } = req.body;

  if (!nombre || precio == null || disponibilidad == null || !clima || !tamanio || !luz || !riego) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO plantas 
      (nombre, precio, disponibilidad, clima, tamanio, luz, riego)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        nombre.trim(),
        parseFloat(precio),
        disponibilidad === true || disponibilidad === 'true',
        normalizarAArray(clima),
        normalizarAArray(tamanio),
        normalizarAArray(luz),
        normalizarAArray(riego)
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al agregar planta:', error);
    res.status(500).json({ error: 'Error al agregar la planta' });
  }
};

// Actualizar planta
exports.actualizarPlanta = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    precio,
    disponibilidad,
    clima,
    tamanio,
    luz,
    riego
  } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE plantas SET
        nombre = $1,
        precio = $2,
        disponibilidad = $3,
        clima = $4,
        tamanio = $5,
        luz = $6,
        riego = $7
      WHERE id = $8
      RETURNING *`,
      [
        nombre.trim(),
        parseFloat(precio),
        disponibilidad === true || disponibilidad === 'true',
        normalizarAArray(clima),
        normalizarAArray(tamanio),
        normalizarAArray(luz),
        normalizarAArray(riego),
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
