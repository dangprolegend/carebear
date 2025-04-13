import express from 'express';
import userSchema from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        // Check if user already exists
        const existingEmail = await userSchema.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Create new user
        const newUser = new userSchema({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log("Error in register route", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;