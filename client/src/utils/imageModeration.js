import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let nsfwModel = null;
// let cocoModel = null;
let loadingPromise = null;

// ✅ Load models ONLY once (singleton)
export const loadModels = async () => {
  if (nsfwModel) return;

  if (!loadingPromise) {
    loadingPromise = (async () => {
      nsfwModel = await nsfwjs.load();
      // cocoModel = await cocoSsd.load();
      console.log("✅ Models loaded");
    })();
  }

  return loadingPromise;
};

// 🔥 Convert file → image
const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

// 🔥 NSFW CHECK (balanced)
export const isNsfw = async (img) => {
  const predictions = await nsfwModel.classify(img);


  const unsafe = predictions.some(p =>
    (p.className === "Porn" && p.probability > 0.70) ||
    (p.className === "Hentai" && p.probability > 0.90)
  );

  return unsafe;
};

// 🔥 HUMAN CHECK
// export const hasHuman = async (img) => {
//   const predictions = await cocoModel.detect(img);

//   const person = predictions.find(p => p.class === "person");

//   if (!person) return false;

//   // 🔥 ignore low/medium confidence (anime usually here)
//   if (person.score < 0.9) return false;

//   return true;
// };

// 🚀 FINAL SAFE FUNCTION (NO CRASH EVER)
export const checkImageSafety = async (file) => {
  // ✅ always ensure models are ready
  await loadModels();

  const img = await loadImage(file);

  const [nsfw] = await Promise.all([
    isNsfw(img),
    // hasHuman(img),
  ]);

  return {
    allowed: !(nsfw),
    reason: nsfw
      ? "NSFW content detected"

      : "Safe image",
  };
};