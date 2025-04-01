const pool = require('../db');
const cloudinary = require('../cloudinary');

// Asegura que los atributos sean arrays
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

// Crear nueva planta con imagen subida a Cloudinary
exports.crearPlanta = async (req, res) => {
  let { nombre, precio, disponibilidad, clima, tamanio, luz, riego } = req.body;

  clima = normalizarAArray(clima);
  tamanio = normalizarAArray(tamanio);
  luz = normalizarAArray(luz);
  riego = normalizarAArray(riego);

  if (!nombre || precio == null || disponibilidad == null || clima.length === 0 || tamanio.length === 0 || luz.length === 0 || riego.length === 0 || !req.file) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const subida = await cloudinary.uploader.upload(req.file.path);

    const resultado = await pool.query(
      `INSERT INTO plantas (nombre, precio, disponibilidad, clima, tamanio, luz, riego, imagen_url, imagen_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        nombre,
        parseFloat(precio),
        disponibilidad === 'true' || disponibilidad === true,
        JSON.stringify(clima),
        JSON.stringify(tamanio),
        JSON.stringify(luz),
        JSON.stringify(riego),
        subida.secure_url,
        subida.public_id
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al agregar planta:', error);
    res.status(500).json({ error: 'Error al agregar la planta' });
  }
};

// Actualizar planta con imagen opcional en Cloudinary
exports.actualizarPlanta = async (req, res) => {
  const { id } = req.params;
  let {
    nombre, precio, disponibilidad, imagen_url_actual,
    clima, tamanio, luz, riego
  } = req.body;

  clima = normalizarAArray(clima);
  tamanio = normalizarAArray(tamanio);
  luz = normalizarAArray(luz);
  riego = normalizarAArray(riego);

  try {
    let imagen_url = imagen_url_actual;
    let imagen_id = null;

    if (req.file) {
      // Eliminar imagen anterior si existe
      const anterior = await pool.query('SELECT imagen_id FROM plantas WHERE id = $1', [id]);
      if (anterior.rows[0]?.imagen_id) {
        await cloudinary.uploader.destroy(anterior.rows[0].imagen_id);
      }

      // Subir nueva imagen
      const subida = await cloudinary.uploader.upload(req.file.path);
      imagen_url = subida.secure_url;
      imagen_id = subida.public_id;
    }

    const resultado = await pool.query(
      `UPDATE plantas SET nombre=$1, imagen_url=$2, imagen_id=$3, precio=$4, disponibilidad=$5,
       clima=$6, tamanio=$7, luz=$8, riego=$9 WHERE id=$10 RETURNING *`,
      [
        nombre,
        imagen_url,
        imagen_id,
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

// Eliminar planta y su imagen de Cloudinary
exports.eliminarPlanta = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM plantas WHERE id = $1 RETURNING *', [id]);
    const plantaEliminada = resultado.rows[0];

    if (!plantaEliminada) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }

    if (plantaEliminada.imagen_id) {
      await cloudinary.uploader.destroy(plantaEliminada.imagen_id);
    }

    res.json({ mensaje: 'Planta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar planta:', error);
    res.status(500).json({ error: 'Error al eliminar la planta' });
  }
};