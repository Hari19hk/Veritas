import express from 'express';
import cors from 'cors'
import commitRoutes from './routes/commit.routes.js';
import executeRoutes from './routes/execute.routes.js';
import verifyRoutes from './routes/verify.routes.js';

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

export default app;
