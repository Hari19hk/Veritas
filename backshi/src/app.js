const express = require('express');
const cors = require('cors');
const commitRoutes = require('./routes/commit.routes');
const executeRoutes = require('./routes/execute.routes');
const verifyRoutes = require('./routes/verify.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', commitRoutes);
app.use('/', executeRoutes);
app.use('/', verifyRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('PoEChain Backend is running');
});

module.exports = app;
