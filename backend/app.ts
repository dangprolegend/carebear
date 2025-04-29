//@ts-nocheck
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

import { Webhook } from 'svix';
import User from './models/User';
import { verifyWebhook } from '@clerk/express/webhooks'

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5000');

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
// app.use('/api/webhooks', clerkRoutes);
app.post(
  '/api/webhooks/clerk', 
  express.raw({ type: 'application/json' }),
  async function (req, res) {
    try {
      const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

      if (!WEBHOOK_SECRET) {
          throw new Error('WEBHOOK_SECRET is not defined in environment variables');
      }

      const svixId = req.headers['svix-id'] as string;
      const svixTimestamp = req.headers['svix-timestamp'] as string;
      const svixSignature = req.headers['svix-signature'] as string;
      
      // If any of these headers are missing, the verification will fail
      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error('Missing Svix headers:', { 
          'svix-id': svixId ? 'present' : 'missing',
          'svix-timestamp': svixTimestamp ? 'present' : 'missing',
          'svix-signature': svixSignature ? 'present' : 'missing'
        });
        return res.status(400).json({ error: 'Missing required Svix headers' });
      }
      const payload = JSON.stringify(req.body);

      const wh = new Webhook(WEBHOOK_SECRET)
      const evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature
      })
      const { id, ...attributes } = evt.data;

      const eventType = evt.type;

      if (eventType === 'user.created') {
        const { id, email_addresses, image_url, first_name, last_name } = evt.data;

        const user = new User({
          clerkID: id,
          email: email_addresses[0].email_address,
          imageURL: image_url!,
          firstName: first_name,
          lastName: last_name,
        });

        await user.save();
        console.log('User is created');
      }

      res.status(200).json({
        success: true,
        message: 'Webhook received',
      });
    } catch (err: any) {
      console.log(err);
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  });
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', memberRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

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