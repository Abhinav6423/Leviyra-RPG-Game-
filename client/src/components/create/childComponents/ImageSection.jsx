// create/components/ImageSection.jsx
import React from 'react';
import { SectionContainer } from './SharedUI.jsx';
import { LIMITS } from '../constantValues.js';

const ImageSection = ({ form, loading, handleImageUpload, removeImage }) => {
    return (
        <SectionContainer title="Character Art">
            <label className="block border border-dashed border-zinc-700/60 rounded-[1.5rem] p-12 text-center cursor-pointer hover:border-zinc-400/50 hover:bg-zinc-800/20 transition-all bg-zinc-900/20">
                <p className="text-sm text-zinc-400 font-medium">Drop cover art here ({form.images.length}/{LIMITS.maxImages})</p>
                <p className="text-[10px] text-zinc-600 mt-2">JPEG, PNG, or WEBP · max {LIMITS.maxImageMB}MB · 2:3 ratio</p>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" disabled={loading} />
            </label>

            {form.previewImages.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-6">
                    {form.previewImages.map((img, i) => (
                        <div key={i} className="relative w-24 h-32 rounded-xl overflow-hidden border border-zinc-800 group shadow-md">
                            <img src={img} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all" />
                            <button type="button" onClick={() => removeImage(i)}
                                className="absolute inset-0 m-auto w-8 h-8 bg-zinc-900/90 text-white hover:text-red-400 border border-zinc-700 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">✕</button>
                        </div>
                    ))}
                </div>
            )}
        </SectionContainer>
    );
};

export default ImageSection;