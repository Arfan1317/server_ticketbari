import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();

router.post('/jwt', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const payload = {
            userId: user._id,
            authId: user.authId,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/users/me', verifyJWT, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/users/sync', async (req, res) => {
    try {
        const { authId, name, email, image } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            user.authId = authId;
            user.name = name;
            user.image = image;
            await user.save();
        } else {
            user = await User.create({ authId, name, email, image });
        }
        
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
