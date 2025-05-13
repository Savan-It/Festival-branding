const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // Import sharp for image conversion
const { createCanvas, loadImage, registerFont } = require('canvas');
const { authenticateToken } = require('./auth');

const router = express.Router();
const templatesFilePath = path.join(__dirname, '../data/templates.json');
const userDetailsFilePath = path.join(__dirname, '../data/userDetails.json');

// Helper function to read templates from the JSON file
const readTemplates = () => {
  const data = fs.readFileSync(templatesFilePath);
  return JSON.parse(data);
};

// Helper function to read user details from the JSON file
const readUserDetails = () => {
  const data = fs.readFileSync(userDetailsFilePath);
  return JSON.parse(data);
};

// Helper function to convert unsupported image formats to PNG
const convertToPng = async (inputPath) => {
  const outputPath = inputPath.replace(/\.[^/.]+$/, '.png'); // Replace extension with .png
  await sharp(inputPath).toFormat('png').toFile(outputPath);
  return outputPath;
};

router.post('/', authenticateToken, async (req, res) => {
  const { template } = req.body; // Only the template is sent from the frontend
  const { username } = req.user; // Extract username from the token

  try {
    const templates = readTemplates();
    const selectedTemplate = templates.find((t) => t.filename === template);

    if (!selectedTemplate) {
      return res.status(404).send('Template not found');
    }

    const userDetails = readUserDetails();
    const user = userDetails.find((u) => u.username === username);

    if (!user) {
      return res.status(404).send('User not found');
    }

    const { company, address, contact } = user;

    const [addrX, addrY] = selectedTemplate.dimensions.address.split(',').map(Number);
    const [compX, compY] = selectedTemplate.dimensions.company.split(',').map(Number);
    const [contX, contY] = selectedTemplate.dimensions.contact.split(',').map(Number);

    const templatePath = path.join(__dirname, '../templates', selectedTemplate.filename);

    // Convert unsupported image formats to PNG
    const convertedTemplatePath = selectedTemplate.filename.endsWith('.webp')
      ? await convertToPng(templatePath)
      : templatePath;

    const img = await loadImage(convertedTemplatePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    // Draw the template image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Set font and color from the template
    ctx.fillStyle = selectedTemplate.color || '#000'; // Default to black if no color is specified
    ctx.font = `32px "${selectedTemplate.font || 'Arial'}"`; // Default to Arial if no font is specified

    // Add text to the canvas
    ctx.fillText(address, addrX, addrY);
    ctx.fillText(company, compX, compY);
    ctx.fillText(contact, contX, contY);

    // Generate a unique output file name
    const outputName = `${Date.now()}_${template}`;
    const outputPath = path.join(__dirname, '../output', outputName);

    // Save the canvas as a PNG file
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => res.json({ image: outputName }));
  } catch (err) {
    console.error('Error generating image:', err);
    res.status(500).send('Failed to generate image');
  }
});

module.exports = router;