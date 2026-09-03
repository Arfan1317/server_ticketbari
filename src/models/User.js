import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    authId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: '' },
    role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
    isFraud: { type: Boolean, default: false }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
