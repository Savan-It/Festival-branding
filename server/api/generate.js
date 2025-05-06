const express = require('express');
const generateImage = require('../utils/imageGenerator');
const router = express.Router();

router.post('/generate', async (req, res) => {
  const { template, company, message, contact } = req.body;

  try {
    const outputName = await generateImage(template, company, message, contact);
    res.json({ image: outputName });
  } catch (err) {
    console.error('Failed to generate image:', err);
    res.status(500).send('Failed to generate image');
  }
});

module.exports = router;