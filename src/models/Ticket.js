import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    transportType: { type: String, required: true, enum: ['bus', 'train', 'launch', 'plane'] },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    departureDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    perks: [{ type: String }],
    image: { type: String, required: true },
    vendorName: { type: String, required: true },
    vendorEmail: { type: String, required: true },
    vendorId: { type: String, required: true },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isAdvertised: { type: Boolean, default: false },
    isFraudVendor: { type: Boolean, default: false }
}, { timestamps: true });

export const Ticket = mongoose.model('Ticket', ticketSchema);
