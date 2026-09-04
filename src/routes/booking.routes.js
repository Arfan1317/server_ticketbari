import express from 'express';
import { Booking } from '../models/Booking.js';
import { Ticket } from '../models/Ticket.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

router.post('/', verifyJWT, verifyRole('user', 'admin'), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.body.ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (req.body.quantity > ticket.quantity) {
            return res.status(400).json({ message: 'Requested quantity exceeds available tickets' });
        }
        const booking = await Booking.create({ ...req.body, userEmail: req.user.email });
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/my-bookings', verifyJWT, async (req, res) => {
    try {
        const bookings = await Booking.find({ userEmail: req.user.email });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/vendor-requests', verifyJWT, verifyRole('vendor'), async (req, res) => {
    try {
        const bookings = await Booking.find({ vendorId: req.user.authId });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/accept', verifyJWT, verifyRole('vendor'), async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.user.authId },
            { status: 'accepted' },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/reject', verifyJWT, verifyRole('vendor'), async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.user.authId },
            { status: 'rejected' },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id/cancel', verifyJWT, async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, userEmail: req.user.email, status: 'pending' });
        if (!booking) return res.status(404).json({ message: 'Booking not found or cannot be cancelled' });
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
