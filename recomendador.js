const pool = require('./db');

// Función para buscar plantas que coincidan con las preferencias del usuario
async function recomendarPlantas(preferencias) {
  const { clima, tamanio, luz, riego } = preferencias;

  try {
    const resultado = await pool.query(
      `SELECT * FROM plantas
       WHERE clima ? $1
         AND tamanio ? $2
         AND luz ? $3
         AND riego ? $4
         AND disponibilidad = true
       ORDER BY nombre ASC
       LIMIT 10`,
      [clima, tamanio, luz, riego]
    );

    return resultado.rows;
  } catch (error) {
    console.error('❌ Error al recomendar plantas:', error);
    return [];
  }
}

module.exports = { recomendarPlantas };
