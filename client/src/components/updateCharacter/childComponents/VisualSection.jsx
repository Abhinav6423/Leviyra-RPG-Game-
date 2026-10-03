import React from "react";
import { Section } from "./FormUI.jsx";

const VisualsSection = ({ images, handleImageUpload, handleRemoveImage }) => {
  const full = images.length >= 8;

  return (
    <Section
      title={
        <>
          Visuals <span className="text-red-400">*</span>{" "}
          <span className="text-sm font-medium text-zinc-500">
            {images.length}/8
          </span>
        </>
      }
      hint="Min 1, max 8 images. JPG, PNG or WEBP, max 5MB each, best in 2:3 ratio. Sexually explicit or nude images are prohibited and will be filtered."
    >
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden border border-zinc-800 aspect-[2/3] bg-zinc-900"
            >
              <img
                src={img.url}
                alt={`Preview ${idx}`}
                className="w-full h-full object-cover"
              />
              {img.isNew && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#00e676] text-black text-[10px] font-bold">
                  NEW
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                title="Remove image"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white text-xs hover:bg-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        className={`block border border-dashed border-zinc-700 rounded-2xl p-8 text-center text-sm font-medium cursor-pointer hover:border-[#00e676]/60 hover:bg-zinc-900/40 transition-colors ${full ? "opacity-50 pointer-events-none" : "text-zinc-300"}`}
      >
        {full ? "Image limit reached" : "+ Upload new image"}
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          disabled={full}
        />
      </label>
    </Section>
  );
};

export default VisualsSection;
