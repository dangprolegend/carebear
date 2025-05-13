//@ts-nocheck
import { Request, Response } from 'express';
import User from '../models/User';
import { TypedRequest } from '../types/express';

import { Webhook } from 'svix';

interface UserBody {
  email: string;
  name: string;
  username?: string; // Changed from userID to username
  image?: string;
}

interface UserParams {
  id: string; // Represents either MongoDB ObjectID or username
}

// Clerk webhook handler to sync data with MongoDB
export const signup = async (req, res) => {
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
        dateOfBirth: null, // Default to null
        gender: null, // Default to null
        weight: null, // Default to null
        height: null, // Default to null
        groupID: null, // Default to null
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
  };
  
  // POST /auth/login
  export const login = async (req: TypedRequest<Partial<UserBody>>, res: Response): Promise<void> => {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    
    try {
      // Try to find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
  