// plantas.controller.js
const pool = require('../db');

// Crear nueva planta con imagen y atributos
exports.crearPlanta = async (req, res) => {
  const imagen = req.file ? `/uploads/${req.file.filename}` : null;
  let {
    nombre,
    precio,
    disponibilidad,
    clima,
    tamanio,
    luz,
    riego
  } = req.body;

  try {
    clima = JSON.parse(clima);
    tamanio = JSON.parse(tamanio);
    luz = JSON.parse(luz);
    riego = JSON.parse(riego);
  } catch (error) {
    return res.status(400).json({ error: 'Error al parsear arrays. Verifica que los datos sean JSON válidos.' });
  }

  if (!nombre || !imagen || precio == null || disponibilidad == null || !clima.length || !tamanio.length || !luz.length || !riego.length) {
    return res.status(400).json({ error: 'Todos los campos son requeridos y deben tener al menos un valor.' });
  }

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
        disponibilidad === 'true',
        clima,
        tamanio,
        luz,
        riego
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al agregar planta:', error);
    res.status(500).json({ error: 'Error al agregar la planta' });
  }
};

// Actualizar planta existente
exports.actualizarPlanta = async (req, res) => {
  const { id } = req.params;
  let {
    nombre,
    precio,
    disponibilidad,
    imagen_url_actual,
    clima,
    tamanio,
    luz,
    riego
  } = req.body;

  const imagen_url = req.file ? `/uploads/${req.file.filename}` : imagen_url_actual;

  try {
    clima = JSON.parse(clima);
    tamanio = JSON.parse(tamanio);
    luz = JSON.parse(luz);
    riego = JSON.parse(riego);
  } catch (error) {
    return res.status(400).json({ error: 'Error al parsear arrays. Verifica los datos JSON.' });
  }

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
        disponibilidad === 'true',
        clima,
        tamanio,
        luz,
        riego,
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
