import admin from "../config/firebaseAdmin.js";
import User from "../modals/User.modal.js";

const extractAndVerifyToken = async (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        const err = new Error("Authorization token missing");
        err.status = 401;
        throw err;
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded;
};

/**
 * verifyFirebaseToken
 * Use on: POST /auth/sync-user only.
 * No DB check — sync-user is what ISSUES/reconciles the session, so it
 * can't require a session to already be valid.
 */
export const verifyFirebaseToken = async (req, res, next) => {
    try {
        req.userDecoded = await extractAndVerifyToken(req);
        next();
    } catch (error) {
        console.error("[verifyFirebaseToken]", error.message);
        return res.status(401).json({
            success: false,
            message: error.status === 401 ? error.message : "Invalid or expired token",
        });
    }
};

/**
 * protect
 * Use on: all other protected routes.
 * Verifies Firebase token AND loads the user.
 * (Single-device session enforcement removed.)
 */
export const protect = async (req, res, next) => {
    try {
        const decoded = await extractAndVerifyToken(req);

        const user = await User.findOne(
            { firebaseUid: decoded.uid },
            "name email firebaseUid isActive subscription"
        ).lean();

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (user.isActive === false) {
            return res.status(403).json({ success: false, message: "Account suspended." });
        }

        req.user = user;
        req.userDecoded = decoded;
        next();

    } catch (error) {
        console.error("[protect]", error.message);
        return res.status(401).json({
            success: false,
            message: error.status === 401 ? error.message : "Invalid or expired token",
        });
    }
};