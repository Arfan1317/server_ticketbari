import express from 'express';
import { Transaction } from '../models/Transaction.js';
import { Ticket } from '../models/Ticket.js';
import { Booking } from '../models/Booking.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

router.get('/users/transactions', verifyJWT, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.userId });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/vendor/stats', verifyJWT, verifyRole('vendor'), async (req, res) => {
    try {
        const tickets = await Ticket.find({ vendorId: req.user.authId });
        const ticketIds = tickets.map(t => t._id);
        
        const bookings = await Booking.find({ ticketId: { $in: ticketIds }, status: 'paid' });
        
        const totalTickets = tickets.length;
        const totalSold = bookings.reduce((sum, b) => sum + b.quantity, 0);
        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        
        res.json({ totalTickets, totalSold, totalRevenue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
