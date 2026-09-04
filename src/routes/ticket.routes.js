import express from 'express';
import { Ticket } from '../models/Ticket.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { search, transportType, sort, page = 1, limit = 9 } = req.query;
        let query = { verificationStatus: 'approved', isFraudVendor: { $ne: true } };

        if (search) {
            query.$or = [
                { from: { $regex: search, $options: 'i' } },
                { to: { $regex: search, $options: 'i' } }
            ];
        }

        if (transportType) {
            query.transportType = transportType;
        }

        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else sortOption.createdAt = -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const tickets = await Ticket.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));
            
        const totalTickets = await Ticket.countDocuments(query);

        res.json({
            tickets,
            totalPages: Math.ceil(totalTickets / limit),
            currentPage: parseInt(page),
            totalTickets
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/advertised', async (req, res) => {
    try {
        const tickets = await Ticket.find({ verificationStatus: 'approved', isAdvertised: true, isFraudVendor: { $ne: true } }).limit(6);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/latest', async (req, res) => {
    try {
        const tickets = await Ticket.find({ verificationStatus: 'approved', isFraudVendor: { $ne: true } }).sort({ createdAt: -1 }).limit(8);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/vendor/my-tickets', verifyJWT, verifyRole('vendor'), async (req, res) => {
    try {
        const tickets = await Ticket.find({ vendorEmail: req.user.email });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', verifyJWT, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', verifyJWT, verifyRole('vendor'), async (req, res) => {
    try {
        const ticket = await Ticket.create({ ...req.body, vendorEmail: req.user.email, vendorId: req.user.authId });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', verifyJWT, verifyRole('vendor'), async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ _id: req.params.id, vendorEmail: req.user.email });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found or unauthorized' });
        
        const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', verifyJWT, verifyRole('vendor'), async (req, res) => {
    try {
        const ticket = await Ticket.findOneAndDelete({ _id: req.params.id, vendorEmail: req.user.email });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found or unauthorized' });
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
