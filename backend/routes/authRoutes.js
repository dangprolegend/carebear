import express from 'express';
import userSchema from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Check if user already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }
    
        // Create new user
        const newUser = new userSchema({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log("Error in register route", error);
        res.status(500).json({ message: 'Server error', error });
    }
});

export default router;