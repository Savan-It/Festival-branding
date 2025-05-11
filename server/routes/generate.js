const express = require('express');
const path = require('path');
const Jimp = require('jimp');
const fs = require('fs');
const { authenticateToken } = require('./auth');

const router = express.Router();
const templatesFilePath = path.join(__dirname, '../data/templates.json');
const userDetailsFilePath = path.join(__dirname, '../data/userDetails.json');

// Helper function to read templates from the JSON file
const readTemplates = () => {
  const data = fs.readFileSync(templatesFilePath);
  return JSON.parse(data);
};

// Helper function to store user details
const storeUserDetails = (details) => {
  let userDetails = [];
  if (fs.existsSync(userDetailsFilePath)) {
    const data = fs.readFileSync(userDetailsFilePath);
    userDetails = JSON.parse(data);
  }
  userDetails.push(details);
  fs.writeFileSync(userDetailsFilePath, JSON.stringify(userDetails, null, 2));
};

router.post('/', authenticateToken, async (req, res) => {
  const { template, company, address, contact } = req.body;

  try {
    const templates = readTemplates();
    const selectedTemplate = templates.find((t) => t.filename === template);

    if (!selectedTemplate) {
      return res.status(404).send('Template not found');
    }

    const templatePath = path.join(__dirname, '../templates', selectedTemplate.filename);
    const image = await Jimp.read(templatePath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // Parse dimensions
    const [addrX, addrY] = selectedTemplate.dimensions.message.split(',').map(Number);
    const [compX, compY] = selectedTemplate.dimensions.company.split(',').map(Number);
    const [contX, contY] = selectedTemplate.dimensions.contact.split(',').map(Number);

    // Add text to the image
    image.print(font, addrX, addrY, address, 500);
    image.print(font, compX, compY, company, 500);
    image.print(font, contX, contY, contact, 500);

    // Generate a unique output file name
    const outputName = `${Date.now()}_${template}`;
    const outputPath = path.join(__dirname, '../output', outputName);
    await image.writeAsync(outputPath);

    // Store user details
    storeUserDetails({ template, company, address, contact, outputName });

    res.json({ image: outputName });
  } catch (err) {
    console.error('Error generating image:', err);
    res.status(500).send('Failed to generate image');
  }
});

module.exports = router;