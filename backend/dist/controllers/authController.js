"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const User_1 = __importDefault(require("../models/User"));
const svix_1 = require("svix");
// Clerk webhook handler to sync data with MongoDB
const signup = async (req, res) => {
    try {
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
        if (!WEBHOOK_SECRET) {
            throw new Error('WEBHOOK_SECRET is not defined in environment variables');
        }
        const svixId = req.headers['svix-id'];
        const svixTimestamp = req.headers['svix-timestamp'];
        const svixSignature = req.headers['svix-signature'];
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
        const wh = new svix_1.Webhook(WEBHOOK_SECRET);
        const evt = wh.verify(payload, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature
        });
        const { id, ...attributes } = evt.data;
        const eventType = evt.type;
        if (eventType === 'user.created') {
            const { id, email_addresses, image_url, first_name, last_name } = evt.data;
            const user = new User_1.default({
                clerkID: id,
                email: email_addresses[0].email_address,
                imageURL: image_url,
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
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
exports.signup = signup;
// POST /auth/login
const login = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    try {
        // Try to find user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.login = login;
