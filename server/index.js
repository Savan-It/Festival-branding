const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: authRouter } = require('./routes/auth');
const generateRouter = require('./routes/generate');
const templatesRouter = require('./routes/templates');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/output', express.static(path.join(__dirname, 'output')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// Add authentication routes
app.use('/api/auth', authRouter);

// Add generate routes
app.use('/api/generate', generateRouter);

// Add template routes
app.use('/api/templates', templatesRouter);

app.listen(5000, () => console.log('Server running on http://localhost:5000'));