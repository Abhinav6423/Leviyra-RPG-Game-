// create/hooks.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createCharacter } from "../../api-calls/createCharacter.js";
import { loadModels, checkImageSafety } from "../../utils/imageModeration.js";
import { LIMITS } from "./constantValues.js";
import { validateCharacter } from "./ValidationCheck.js";

// ==========================================
// 🖼️ IMAGE HELPERS (Hook ke andar use hone wale helpers)
// ==========================================
const getImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });

const isValidAspectRatio = (width, height) => {
  const ratio = width / height;
  return Math.abs(ratio - LIMITS.aspectRatio) < 0.03;
};

// ==========================================
// 🧠 BUSINESS LOGIC (CUSTOM HOOK)
// ==========================================
export const useCharacterForm = (initialCharacter = null) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  const [form, setForm] = useState(
    initialCharacter || {
      name: "",
      shortDescription: "",
      longDescription: "",
      primaryTags: [],
      secondaryTags: [],
      personality: "",
      scenario: "",
      firstDialogues: [""],
      images: [],
      previewImages: [],
      isPublic: false,
      hideDescription: false,
    },
  );

  // Models load karna
  useEffect(() => {
    loadModels()
      .then(() => setModelsReady(true))
      .catch(() => toast.error("Failed to load AI models ❌"));
  }, []);

  // Memory leaks rokne ke liye cleanup
  useEffect(() => {
    return () => {
      form.previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.previewImages]);

  // Helpers
  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const handleChange = (e) => updateField(e.target.name, e.target.value);
  const addListItem = (field, value = "") =>
    updateField(field, [...form[field], value]);
  const updateListItem = (field, index, value) => {
    const next = [...form[field]];
    next[index] = value;
    updateField(field, next);
  };
  const removeListItem = (field, index) =>
    updateField(
      field,
      form[field].filter((_, i) => i !== index),
    );

  const togglePrimaryTag = (tag) => {
    const active = form.primaryTags.includes(tag);
    if (!active && form.primaryTags.length >= LIMITS.maxPrimaryTags) {
      return toast.error(`Choose up to ${LIMITS.maxPrimaryTags} primary tags`);
    }
    updateField(
      "primaryTags",
      active
        ? form.primaryTags.filter((t) => t !== tag)
        : [...form.primaryTags, tag],
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!modelsReady) return toast.error("AI still loading... wait ⏳");
    if (form.images.length + files.length > LIMITS.maxImages)
      return toast.error(`Max ${LIMITS.maxImages} images allowed`);

    setLoading(true);
    const toastId = toast.loading("Checking images...");

    const safeFiles = [];
    const safePreviews = [];
    const errors = []; // 👈 Errors collect karne ke liye array banaya

    await Promise.all(
      files.map(async (file) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          errors.push(`${file.name} ❌ Invalid format`);
          return;
        }
        if (file.size > LIMITS.maxImageMB * 1024 * 1024) {
          errors.push(`${file.name} ❌ Over ${LIMITS.maxImageMB}MB`);
          return;
        }

        try {
          const { width, height } = await getImageDimensions(file);
          if (!isValidAspectRatio(width, height)) {
            errors.push(`${file.name} ❌ Must be 2:3 aspect ratio`);
            return;
          }

          const result = await checkImageSafety(file);
          if (!result.allowed) {
            errors.push(`${file.name} ❌ ${result.reason}`);
            return;
          }

          safeFiles.push(file);
          safePreviews.push(URL.createObjectURL(file));
        } catch {
          errors.push(`${file.name} ❌ Error checking image`);
        }
      }),
    );

    // State reset aur loading dismiss pehle kar lein
    setLoading(false);
    toast.dismiss(toastId);
    e.target.value = "";

    // Agar kuch images safe hain, toh unhe add karein
    if (safeFiles.length > 0) {
      updateField("images", [...form.images, ...safeFiles]);
      updateField("previewImages", [...form.previewImages, ...safePreviews]);
    }

    // Generic message ki jagah, ab direct collected errors dikhayein
    if (errors.length > 0) {
      // Agar aap chahein toh thoda delay de sakte hain, par normally map theek kaam karta hai
      errors.forEach((errorMsg) => toast.error(errorMsg));
    }
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(form.previewImages[idx]);
    updateField(
      "images",
      form.images.filter((_, i) => i !== idx),
    );
    updateField(
      "previewImages",
      form.previewImages.filter((_, i) => i !== idx),
    );
  };

  const handleSubmit = async (status) => {
    if (loading) return;

    const cleanDialogues = form.firstDialogues.filter((d) => d.trim());
    const errors = validateCharacter(form, status);
    if (errors.length > 0) return toast.error(errors[0]);

    setLoading(true);
    try {
      const payload = {
        ...form,
        firstDialogues: cleanDialogues.length
          ? cleanDialogues
          : form.firstDialogues,
        status,
      };

      await toast.promise(createCharacter(payload), {
        loading:
          status === "draft" ? "Saving draft..." : "Publishing character...",
        success:
          status === "draft" ? "Draft saved 📝" : "Character published 🚀",
        error: "Something went wrong ❌",
      });

      navigate("/profile", { state: { refetch: true, timestamp: Date.now() } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong ⚠️");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    updateField,
    handleChange,
    addListItem,
    updateListItem,
    removeListItem,
    togglePrimaryTag,
    handleImageUpload,
    removeImage,
    handleSubmit,
  };
};
