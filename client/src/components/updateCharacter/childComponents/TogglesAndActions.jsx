import React from "react";

const TogglesAndActions = ({ formData, handleChange, handleSubmit, isUnchanged, isSaving }) => {
    return (
        <>
            {/* TOGGLES */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/5 shadow-lg flex justify-between items-center transition-all hover:border-white/10">
                    <div className="pr-4">
                        <p className="text-sm text-zinc-100 font-semibold mb-0.5">Public Discovery</p>
                        <p className="text-xs text-zinc-500">Allow users to find and interact with this character.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="sr-only peer" />
                        <div className="w-12 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>

                <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/5 shadow-lg flex justify-between items-center transition-all hover:border-white/10">
                    <div className="pr-4">
                        <p className="text-sm text-zinc-100 font-semibold mb-0.5">Private Definitions</p>
                        <p className="text-xs text-zinc-500">Hide backend narrative (personality, scenario) from public view.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" name="hideDescription" checked={formData.hideDescription} onChange={handleChange} className="sr-only peer" />
                        <div className="w-12 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 pb-12">
                <button 
                    onClick={(e) => e.preventDefault()} 
                    className="w-full sm:w-1/3 bg-transparent border border-white/10 text-zinc-300 py-4 rounded-xl font-medium hover:bg-white/5 hover:text-white transition-all active:scale-95"
                >
                    Discard Changes
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={isUnchanged || isSaving}
                    className={`w-full sm:w-2/3 py-4 rounded-xl font-semibold shadow-xl transition-all ${isUnchanged
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                            : "bg-zinc-100 text-zinc-900 hover:bg-white hover:scale-[1.01] active:scale-95"
                        }`}
                    title={isUnchanged ? "No changes to save" : "Save character updates"}
                >
                    {isSaving ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Updating Profile...
                        </span>
                    ) : (
                        "Save & Update Character"
                    )}
                </button>
            </div>
        </>
    );
};

export default TogglesAndActions;