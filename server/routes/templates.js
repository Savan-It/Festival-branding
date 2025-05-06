const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('./auth');

const router = express.Router();
const templatesFilePath = path.join(__dirname, '../data/templates.json');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../templates'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// Helper function to read templates from the JSON file
const readTemplates = () => {
  if (!fs.existsSync(templatesFilePath)) {
    fs.writeFileSync(templatesFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(templatesFilePath);
  return JSON.parse(data);
};

// Helper function to write templates to the JSON file
const writeTemplates = (templates) => {
  fs.writeFileSync(templatesFilePath, JSON.stringify(templates, null, 2));
};

// Add a new template
router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  const { name, dimensions } = req.body;

  try {
    const templates = readTemplates();
    const newTemplate = {
      id: templates.length + 1,
      name,
      filename: req.file.filename,
      dimensions: JSON.parse(dimensions),
    };
    templates.push(newTemplate);
    writeTemplates(templates);
    res.status(201).send('Template added successfully');
  } catch (err) {
    console.error('Error adding template:', err);
    res.status(500).send('Failed to add template');
  }
});

// Get all templates
router.get('/', (req, res) => {
  try {
    const templates = readTemplates();
    res.json(templates);
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).send('Failed to fetch templates');
  }
});

module.exports = router;