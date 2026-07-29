import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";

let model = null;

export const loadModel = async () => {
    if (!model) {
        model = await nsfwjs.load();
        console.log("✅ NSFW model loaded");
    }
};

export const checkImageSafety = async (buffer) => {
    await loadModel();

    const image = new Image();
    image.src = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    await new Promise(res => (image.onload = res));

    const predictions = await model.classify(image);

    const unsafe = predictions.some(p =>
        (p.className === "Porn" && p.probability > 0.5) ||
        (p.className === "Hentai" && p.probability > 0.8) ||
        (p.className === "Sexy" && p.probability > 0.8)
    );

    return {
        allowed: !unsafe,
        reason: unsafe ? "NSFW content detected" : "Safe"
    };
};