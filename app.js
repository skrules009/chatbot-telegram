const express = require('express');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/chatboatservice', webhookRoutes);

module.exports = app;