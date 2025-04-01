const pool = require('../db');
const cloudinary = require('../cloudinary');

// Función para asegurar que los atributos sean arrays
const normalizarAArray = (valor) => {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;
  return [valor];
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

// Crear planta con Cloudinary
exports.crearPlanta = async (req, res) => {
  let {
    nombre, precio, disponibilidad, clima, tamanio, luz, riego
  } = req.body;

  clima = normalizarAArray(clima);
  tamanio = normalizarAArray(tamanio);
  luz = normalizarAArray(luz);
  riego = normalizarAArray(riego);

  if (!nombre || precio == null || disponibilidad == null || clima.length === 0 || tamanio.length === 0 || luz.length === 0 || riego.length === 0) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    let imagen_url = null;
    if (req.file) {
      const resultado = await cloudinary.uploader.upload(req.file.path);
      imagen_url = resultado.secure_url;
    }

    const resultado = await pool.query(
      `INSERT INTO plantas (nombre, precio, disponibilidad, clima, tamanio, luz, riego, imagen_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        nombre,
        parseFloat(precio),
        disponibilidad === 'true' || disponibilidad === true,
        JSON.stringify(clima),
        JSON.stringify(tamanio),
        JSON.stringify(luz),
        JSON.stringify(riego),
        imagen_url
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al agregar planta:', error);
    res.status(500).json({ error: 'Error al agregar la planta' });
  }
};

// Actualizar planta (Cloudinary compatible)
exports.actualizarPlanta = async (req, res) => {
  const { id } = req.params;
  let {
    nombre, precio, disponibilidad, imagen_url_actual, clima, tamanio, luz, riego
  } = req.body;

  clima = normalizarAArray(clima);
  tamanio = normalizarAArray(tamanio);
  luz = normalizarAArray(luz);
  riego = normalizarAArray(riego);

  try {
    let imagen_url = imagen_url_actual || null;

    if (req.file) {
      const resultado = await cloudinary.uploader.upload(req.file.path);
      imagen_url = resultado.secure_url;
    }

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
        disponibilidad === 'true' || disponibilidad === true,
        JSON.stringify(clima),
        JSON.stringify(tamanio),
        JSON.stringify(luz),
        JSON.stringify(riego),
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
