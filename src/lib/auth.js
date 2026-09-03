import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let client;
let db;

try {
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketbari');
    db = client.db();
} catch (error) {
    console.error('Failed to initialize MongoDB Client for better-auth:', error);
}

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
        },
    },
    trustedOrigins: [process.env.CORS_ORIGIN || 'http://localhost:5173']
});
