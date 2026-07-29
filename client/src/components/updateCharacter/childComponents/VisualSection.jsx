import React from "react";

const VisualsSection = ({ images, handleImageUpload, handleRemoveImage }) => {
    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl p-5 sm:p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <h2 className="text-indigo-400 font-semibold text-xs tracking-widest uppercase flex items-center mb-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                Visuals <span className="text-rose-500 ml-1.5 text-lg leading-none">*</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-6 max-w-2xl">
                Add images for the character or world. <strong className="text-zinc-200">Requirements:</strong> Min 1, Max 8 images. Supported formats: JPG, PNG, WEBP (Max 5MB per image). Best viewed in locked 2:3 aspect ratio. <strong className="text-rose-400">Strict Moderation:</strong> Sexually explicit or nude images are prohibited and will be filtered.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {images?.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[2/3] bg-zinc-950 flex items-center justify-center transition-transform hover:scale-[1.02] hover:border-indigo-500/50 hover:shadow-lg">
                        <img
                            src={img.url}
                            alt={`Preview ${idx}`}
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-60"
                        />
                        <button
                            onClick={(e) => { e.preventDefault(); handleRemoveImage(idx); }}
                            className="absolute inset-0 m-auto bg-rose-500/90 hover:bg-rose-500 text-white rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                ))}
            </div>

            <label className={`cursor-pointer group flex items-center justify-center w-full sm:w-auto bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 px-6 py-3 rounded-xl text-sm font-medium transition-all ${images.length >= 8 ? 'opacity-50 pointer-events-none' : 'text-zinc-300'}`}>
                <svg className="w-4 h-4 mr-2 text-zinc-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                {images.length >= 8 ? 'Image Limit Reached' : 'Upload New Image'}
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 8}
                />
            </label>
        </div>
    );
};

export default VisualsSection;