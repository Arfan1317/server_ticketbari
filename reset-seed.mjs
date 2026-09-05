// Reset and re-seed admin + vendor accounts
// Run with: node reset-seed.mjs

import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function resetSeed() {
  try {
    // Connect with native MongoClient to access all collections
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('Connected to MongoDB');
    
    // 1. Remove admin and vendor from our custom 'users' collection
    const usersResult = await db.collection('users').deleteMany({
      email: { $in: ['admin@ticketbari.com', 'vendor@ticketbari.com'] }
    });
    console.log(`Deleted ${usersResult.deletedCount} users from 'users' collection`);
    
    // 2. Remove from BetterAuth's 'user' collection
    const baUserResult = await db.collection('user').deleteMany({
      email: { $in: ['admin@ticketbari.com', 'vendor@ticketbari.com'] }
    });
    console.log(`Deleted ${baUserResult.deletedCount} from BetterAuth 'user' collection`);
    
    // 3. Remove from BetterAuth's 'account' collection (linked by userId)
    // We need to find the user IDs first, but since we already deleted them,
    // let's just clean up any orphaned accounts
    const baAccountResult = await db.collection('account').deleteMany({
      providerId: 'credential',
      accountId: { $in: [] } // Will clean up in next step
    });
    
    // Also clean up any accounts linked to these emails by checking remaining
    // Actually, let's just list all collections for debugging
    const collections = await db.listCollections().toArray();
    console.log('\nAll collections in DB:', collections.map(c => c.name).join(', '));
    
    // Clean up sessions too
    try {
      await db.collection('session').deleteMany({});
      console.log('Cleared all sessions');
    } catch(e) {
      console.log('No session collection to clear');
    }
    
    // Clean up accounts collection
    try {
      const accounts = await db.collection('account').find({}).toArray();
      console.log(`Found ${accounts.length} accounts in BetterAuth 'account' collection`);
      // Delete all credential accounts (they'll be re-created by seed)
      if (accounts.length > 0) {
        // Only delete accounts where the userId no longer exists in user collection
        for (const account of accounts) {
          const userExists = await db.collection('user').findOne({ _id: account.userId });
          if (!userExists) {
            await db.collection('account').deleteOne({ _id: account._id });
            console.log(`Deleted orphaned account: ${account._id}`);
          }
        }
      }
    } catch(e) {
      console.log('No account collection to clean');
    }
    
    await client.close();
    console.log('\n✅ Cleanup done! Now restart the server to re-seed.');
    console.log('Run: npm run dev');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

resetSeed();
