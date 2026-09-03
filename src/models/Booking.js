import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    ticketTitle: { type: String, required: true },
    ticketImage: { type: String },
    from: { type: String, required: true },
    to: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    departureDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'paid'], default: 'pending' },
    vendorId: { type: String, required: true }
}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);
