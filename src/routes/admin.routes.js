import express from 'express';
import { Ticket } from '../models/Ticket.js';
import { User } from '../models/User.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

router.get('/tickets', verifyJWT, verifyRole('admin'), async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/tickets/:id/approve', verifyJWT, verifyRole('admin'), async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { verificationStatus: 'approved' }, { new: true });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/tickets/:id/reject', verifyJWT, verifyRole('admin'), async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { verificationStatus: 'rejected' }, { new: true });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/users', verifyJWT, verifyRole('admin'), async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/users/:id/role', verifyJWT, verifyRole('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/users/:id/fraud', verifyJWT, verifyRole('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isFraud: true }, { new: true });
        if (user && user.role === 'vendor') {
            await Ticket.updateMany({ vendorEmail: user.email }, { isFraudVendor: true });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/tickets/:id/advertise', verifyJWT, verifyRole('admin'), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        
        if (!ticket.isAdvertised) {
            const count = await Ticket.countDocuments({ isAdvertised: true });
            if (count >= 6) return res.status(400).json({ message: 'Maximum 6 tickets can be advertised' });
        }
        
        ticket.isAdvertised = !ticket.isAdvertised;
        await ticket.save();
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/stats', verifyJWT, verifyRole('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTickets = await Ticket.countDocuments();
        res.json({ totalUsers, totalTickets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
