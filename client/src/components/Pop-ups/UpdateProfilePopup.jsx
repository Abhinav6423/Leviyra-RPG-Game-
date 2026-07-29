import React, { useState, useEffect } from 'react';
import { X, Save, User, FileText, Loader2 } from 'lucide-react';
import { updateProfile } from "../../api-calls/updateProfile.js";
import { toast } from "sonner";

export default function UpdateProfilePopup({ isOpen, onClose, currentData }) {
    const [formData, setFormData] = useState({
        username: currentData?.username || '',
        bio: currentData?.bio || '',
    });

    const [loading, setLoading] = useState(false);
    const MAX_BIO_LENGTH = 1500;

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'bio' && value.length > MAX_BIO_LENGTH) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username && !formData.bio) {
            toast.error("At least one field must be updated");
            return;
        }

        const data = new FormData();
        if (formData.username) data.append("name", formData.username);
        if (formData.bio) data.append("bio", formData.bio);

        setLoading(true);
        const toastId = toast.loading("Updating profile...");

        try {
            await updateProfile(data);

            toast.success("Profile updated successfully!", { id: toastId });

            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 600);

        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Update failed", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative w-full max-w-md bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="text-lg font-semibold text-white tracking-wide">
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">

                    {/* Username Input */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                            <User size={14} /> Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Enter your name..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-zinc-200 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-zinc-700 disabled:opacity-50"
                        />
                    </div>

                    {/* Bio Input */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="bio" className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                            <FileText size={14} /> Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={loading}
                            maxLength={MAX_BIO_LENGTH}
                            placeholder="Write something about yourself..."
                            rows={4}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-zinc-200 text-sm focus:outline-none focus:border-white/30 transition-all resize-none placeholder:text-zinc-700 disabled:opacity-50 leading-relaxed"
                        />

                        {/* Character Limit Counter */}
                        <div className="flex justify-end">
                            <span className={`text-[11px] font-mono ${
                                formData.bio.length >= MAX_BIO_LENGTH 
                                    ? 'text-red-400 font-semibold' 
                                    : 'text-zinc-500'
                            }`}>
                                {formData.bio.length} / {MAX_BIO_LENGTH}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl font-medium text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all shadow-sm disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}