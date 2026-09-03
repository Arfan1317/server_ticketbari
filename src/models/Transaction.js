import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    ticketTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    stripeTransactionId: { type: String, required: true },
    paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
