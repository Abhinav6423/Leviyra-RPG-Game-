import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let nsfwModel = null;
let cocoModel = null;
let loadingPromise = null;

// ✅ Load models ONLY once
export const loadModels = async () => {
  if (nsfwModel && cocoModel) return;

  if (!loadingPromise) {
    loadingPromise = (async () => {
      nsfwModel = await nsfwjs.load();
      cocoModel = await cocoSsd.load();
      console.log("✅ Models loaded");
    })();
  }

  return loadingPromise;
};

const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

// 🔥 NSFW CHECK — Only block COMPLETE NUDITY / explicit porn
export const isNsfw = async (img) => {
  const predictions = await nsfwModel.classify(img);

  const porn =
    predictions.find((p) => p.className === "Porn")?.probability || 0;
  const hentai =
    predictions.find((p) => p.className === "Hentai")?.probability || 0;
  const sexy =
    predictions.find((p) => p.className === "Sexy")?.probability || 0;
  const drawing =
    predictions.find((p) => p.className === "Drawing")?.probability || 0;

  // Very strict: only block when it's clearly full nude / explicit
  // Bikini, panty, lingerie, tight clothes = allowed
  const isExplicitNude =
    porn > 0.65 || // Real explicit porn
    (hentai > 0.88 && drawing < 0.3); // Strong explicit hentai (full nude)

  // Sexy class is completely ignored (bikini, lingerie, etc. allowed)
  return isExplicitNude;
};

// 🔥 REAL HUMAN CHECK
export const hasRealHuman = async (img) => {
  const [cocoPreds, nsfwPreds] = await Promise.all([
    cocoModel.detect(img),
    nsfwModel.classify(img),
  ]);

  const person = cocoPreds.find((p) => p.class === "person");
  const drawing =
    nsfwPreds.find((p) => p.className === "Drawing")?.probability || 0;

  // Real human only when:
  // - COCO is highly confident
  // - AND it's not a drawing/anime
  if (person && person.score >= 0.9 && drawing < 0.35) {
    return true;
  }

  return false;
};

// 🚀 FINAL FUNCTION
export const checkImageSafety = async (file) => {
  await loadModels();

  const img = await loadImage(file);

  const [nsfw, realHuman] = await Promise.all([isNsfw(img), hasRealHuman(img)]);

  if (realHuman) {
    return {
      allowed: false,
      reason: "Real human detected",
    };
  }

  if (nsfw) {
    return {
      allowed: false,
      reason: "Complete nude / explicit content detected",
    };
  }

  return {
    allowed: true,
    reason: "Safe image",
  };
};
