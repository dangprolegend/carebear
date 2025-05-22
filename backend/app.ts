import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Import database connection
import connectDB from './config/db';

// Import routes
import userRoutes from './routes/userRoutes';
import groupRoutes from './routes/groupRoutes';
import memberRoutes from './routes/memberRoutes';
import taskRoutes from './routes/taskRoutes';
import notificationRoutes from './routes/notificationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import authRoutes from './routes/authRoutes';
import aiRoutes from './routes/aiRoutes';


import { Webhook } from 'svix';
import User from './models/User';
import job from './config/cron';


import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CareBear API',
      version: '1.0.0',
      description: 'API documentation for CareBear application',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.ts'], // Path to route files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5000');

// cron job for render
job.start();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


// Serve Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Define routes
app.use('/api/webhooks', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', memberRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);



// Health check route
app.get('/', (req: Request, res: Response) => {
  res.send('CareBear API is running');
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;