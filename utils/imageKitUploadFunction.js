import imagekit from "../config/imagekit.js";
import sharp from 'sharp';

export const uploadToImageKit = async (file) => {
    return new Promise(async (resolve, reject) => {
        let isDone = false;

        const timer = setTimeout(() => {
            if (!isDone) {
                isDone = true;
                reject(new Error("ImageKit upload timed out after 60 seconds. Please check your network connection or try a smaller file."));
            }
        }, 60000);

        try {
            // ==========================================
            // 1. IMAGE PROCESSING (Resize & Convert to WebP)
            // ==========================================
            const optimizedBuffer = await sharp(file.buffer)
                // OPTIMIZATION: Prevent users from uploading massive 4K images.
                // This caps width at 1200px. If the image is smaller, it won't stretch it.
                .resize({
                    width: 1200,
                    withoutEnlargement: true
                })
                .webp({
                    quality: 80,
                    effort: 4
                })
                .toBuffer();

            const originalName = file.originalname || `upload_${Date.now()}`;
            const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            const webpFileName = `${baseName}.webp`;

            // ==========================================
            // 2. UPLOAD TO IMAGEKIT
            // ==========================================
            imagekit.upload(
                {
                    file: optimizedBuffer,
                    fileName: webpFileName,
                    folder: "characters",
                    useUniqueFileName: true,
                },
                (error, result) => {
                    if (isDone) return;

                    isDone = true;
                    clearTimeout(timer);

                    if (error) {
                        console.error("ImageKit Upload Error:", error);
                        return reject(error);
                    }

                    resolve(result);
                }
            );

        } catch (processingError) {
            if (isDone) return;
            isDone = true;
            clearTimeout(timer);

            console.error("Sharp Processing Error:", processingError);
            reject(new Error("Failed to process and optimize the image before uploading."));
        }
    });
};

export const deleteFromImageKit = async (fileId) => {
    if (!fileId) return;

    try {
        await imagekit.deleteFile(fileId);
    } catch (error) {
        console.error("Delete failed:", error.message);
    }
};