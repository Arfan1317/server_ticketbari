import express from 'express';
import Stripe from 'stripe';
import { Booking } from '../models/Booking.js';
import { Ticket } from '../models/Ticket.js';
import { Transaction } from '../models/Transaction.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', verifyJWT, async (req, res) => {
    try {
        const { totalPrice } = req.body;
        const amount = Math.round(totalPrice * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card']
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/confirm', verifyJWT, async (req, res) => {
    try {
        const { bookingId, paymentIntentId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = 'paid';
        await booking.save();

        await Ticket.findByIdAndUpdate(booking.ticketId, {
            $inc: { quantity: -booking.quantity }
        });

        const transaction = await Transaction.create({
            userId: req.user.userId,
            bookingId: booking._id,
            ticketTitle: booking.ticketTitle,
            amount: booking.totalPrice,
            stripeTransactionId: paymentIntentId
        });

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
