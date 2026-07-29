import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        let isDone = false;

        const timer = setTimeout(() => {
            if (!isDone) {
                isDone = true;
                reject(new Error("Cloudinary upload timed out"));
            }
        }, 10000);

        const stream = cloudinary.uploader.upload_stream(
            { folder: "characters" },
            (error, result) => {
                if (isDone) return;

                isDone = true;
                clearTimeout(timer);

                if (error) return reject(error);

                resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        const readStream = streamifier.createReadStream(file.buffer);

        readStream.on("error", (err) => {
            if (!isDone) {
                isDone = true;
                clearTimeout(timer);
                reject(err);
            }
        });

        readStream.pipe(stream);
    });
};

export const deleteFromCloudinary = async (public_id) => {
    if (!public_id) return;

    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error("Delete failed:", error.message);
    }
};