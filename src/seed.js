import { User } from './models/User.js';
import { auth } from './lib/auth.js';

const seedDB = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@ticketbari.com' });
        
        if (!adminExists) {
            console.log('Seeding initial admin and vendor...');
            
            // Create Admin
            const adminAuth = await auth.api.signUpEmail({
                body: {
                    email: 'admin@ticketbari.com',
                    password: 'Admin@123',
                    name: 'Admin'
                }
            });
            
            if (adminAuth?.user) {
                await User.create({
                    authId: adminAuth.user.id,
                    name: 'Admin',
                    email: 'admin@ticketbari.com',
                    role: 'admin'
                });
                console.log('Admin user created.');
            }

            // Create Vendor
            const vendorAuth = await auth.api.signUpEmail({
                body: {
                    email: 'vendor@ticketbari.com',
                    password: 'Vendor@123',
                    name: 'Vendor'
                }
            });
            
            if (vendorAuth?.user) {
                await User.create({
                    authId: vendorAuth.user.id,
                    name: 'Vendor',
                    email: 'vendor@ticketbari.com',
                    role: 'vendor'
                });
                console.log('Vendor user created.');
            }
        } else {
            console.log('Database already seeded.');
        }
    } catch (error) {
        console.error('Seeding error:', error.message);
    }
};

export default seedDB;
