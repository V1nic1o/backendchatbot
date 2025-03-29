const express = require('express');
const router = express.Router();
const axios = require('axios');


router.post('/identificar', async (req, res) => {
  const { imagenBase64 } = req.body;

  if (!imagenBase64) {
    return res.status(400).json({ error: 'Imagen en base64 requerida' });
  }

  try {
    const respuesta = await axios.post('https://api.plant.id/v2/identify', {
      images: [imagenBase64],
      modifiers: ['similar_images'],
      plant_language: 'es',
      plant_details: ['common_names', 'url', 'wiki_description']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.PLANT_ID_API_KEY
      }
    });

    const nombre = respuesta.data?.suggestions?.[0]?.plant_name || 'No identificado';
    res.json({ nombre, detalles: respuesta.data?.suggestions?.[0] });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Error al identificar planta' });
  }
});

module.exports = router;
