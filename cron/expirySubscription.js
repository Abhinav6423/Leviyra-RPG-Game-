import cron from "node-cron";
import User from "../modals/User.modal.js";

// Runs every night at 12:05 AM (server timezone)
export const startSubscriptionExpiryCron = () => {
    cron.schedule("5 0 * * *", async () => {
        try {
            // Un users ko dhoondo jinka time aaj se peechhe ja chuka hai aur wo abhi bhi 'active' hain
            const result = await User.updateMany(
                {
                    "subscription.status": "active",
                    "subscription.currentPeriodEnd": { $lt: new Date() },
                },
                {
                    // Unka time aage MAT badhao. Unko seedha expire kar do. 
                    // Agar unhone pay kiya hota, toh webhook pehle hi time badha chuka hota.
                    $set: {
                        "subscription.status": "expired" 
                    }
                }
            );

            console.log(`⏰ Cron: ${result.modifiedCount} subscriptions expired safely.`);
        } catch (err) {
            console.error("Cron expiry job failed:", err.message);
        }
    });
};