import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';
import connectDB from './src/config/db.js';
import { auth } from './src/lib/auth.js';

import authRoutes from './src/routes/auth.routes.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import userRoutes from './src/routes/user.routes.js';
import seedDB from './src/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS must be applied FIRST — before everything, including BetterAuth
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// BetterAuth handler — MUST be before express.json()
// BetterAuth handles its own body parsing
app.all('/api/auth/*', toNodeHandler(auth));

// JSON body parser for our custom routes
app.use(express.json());

// Custom API routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'TicketBari API is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

connectDB().then(async () => {
    await seedDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
