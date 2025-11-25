import cron from 'node-cron';
import Booking from '../models/Booking.js'; // Adjust path to your model

const startCronJobs = () => {
    // Schedule a task to run every minute ('* * * * *')
    cron.schedule('* * * * *', async () => {
        try {
            // 1. Calculate the time 1 hour ago from now
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            // 2. Find and Update bookings
            const result = await Booking.updateMany(
                { 
                    status: 'pending', 
                    createdAt: { $lt: oneHourAgo } // Created LESS THAN (before) 1 hour ago
                },
                { 
                    $set: { status: 'timeout' } 
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`Auto-cancelled ${result.modifiedCount} bookings due to timeout.`);
            }

        } catch (error) {
            console.error('Error in auto-cancellation cron job:', error);
        }
    });
};

export default startCronJobs;