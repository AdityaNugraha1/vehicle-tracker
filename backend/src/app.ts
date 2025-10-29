// src/app.ts - UPDATED WITH SWAGGER
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config';

// Import Swagger
import { swaggerSpec, swaggerUi } from './docs/swagger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import vehicleRoutes from './routes/vehicle.routes';
import reportRoutes from './routes/report.routes';
import maintenanceRoutes from './routes/maintenance.routes';

const app = express();

// Basic middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Vehicle Tracker API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Vehicle Tracker API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: {
      documentation: '/api-docs',
      health: '/health',
      api: {
        auth: '/api/auth',
        users: '/api/users',
        vehicles: '/api/vehicles',
        reports: '/api/reports',
        maintenance: '/api/maintenance'
      }
    }
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

export default app;