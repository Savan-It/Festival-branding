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
  const { name, dimensions, font, color } = req.body;

  try {
    const templates = readTemplates();
    const newTemplate = {
      id: templates.length + 1,
      name,
      filename: req.file.filename,
      dimensions: JSON.parse(dimensions),
      font,
      color,
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

// Edit an existing template
router.put('/:id', authenticateToken, upload.single('file'), (req, res) => {
  const { id } = req.params;
  const { name, dimensions, font, color } = req.body;

  try {
    const templates = readTemplates();
    const templateIndex = templates.findIndex((t) => t.id === parseInt(id));

    if (templateIndex === -1) {
      return res.status(404).send('Template not found');
    }

    // Update the template
    templates[templateIndex] = {
      ...templates[templateIndex],
      name,
      dimensions: JSON.parse(dimensions),
      font,
      color,
      ...(req.file && { filename: req.file.filename }), // Update file if a new one is uploaded
    };

    writeTemplates(templates);
    res.status(200).send('Template updated successfully');
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).send('Failed to update template');
  }
});

// Delete a template
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const templates = readTemplates();
    const templateIndex = templates.findIndex((t) => t.id === parseInt(id));

    if (templateIndex === -1) {
      return res.status(404).send('Template not found');
    }

    // Remove the template file from the filesystem
    const template = templates[templateIndex];
    const filePath = path.join(__dirname, '../templates', template.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove the template from the JSON file
    templates.splice(templateIndex, 1);
    writeTemplates(templates);

    res.status(200).send('Template deleted successfully');
  } catch (err) {
    console.error('Error deleting template:', err);
    res.status(500).send('Failed to delete template');
  }
});

module.exports = router;