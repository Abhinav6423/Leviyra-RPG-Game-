import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./modals/User.modal.js";

const getTodayDateString = () => new Date().toISOString().split("T")[0];

async function test() {
    await mongoose.connect(process.env.MONGO_URI);

    const userId = "6a43448eee996e874fc64523";

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    await User.findByIdAndUpdate(userId, {
        $set: {
            "usage.totalMessages": 10,
            "usage.messagesToday": 5,
            "usage.lastResetDate": yesterday
        }
    });

    const before = await User.findById(userId).select("usage");
    console.log("BEFORE:", before.usage);

    // Step 2: ACTUAL reset logic yahan chal raha hai
    const today = getTodayDateString();
    const isNewDay = before.usage?.lastResetDate !== today;
    console.log("isNewDay:", isNewDay);

    if (isNewDay) {
        await User.findByIdAndUpdate(userId, {
            $inc: { "usage.totalMessages": 1 },
            $set: {
                "usage.messagesToday": 1,
                "usage.lastResetDate": today
            }
        });
    } else {
        await User.findByIdAndUpdate(userId, {
            $inc: {
                "usage.totalMessages": 1,
                "usage.messagesToday": 1
            }
        });
    }

    const after = await User.findById(userId).select("usage");
    console.log("AFTER:", after.usage);
    console.log("Expected: messagesToday = 1, lastResetDate =", today);

    process.exit(0);
}

test();