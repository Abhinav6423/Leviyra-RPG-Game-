// create/CreateChar.jsx
import React from 'react';
import { useCharacterForm } from './hooks.js';

// Child Components Import
import CoreFeatures from './childComponents/CoreFeature.jsx';
import TagsSection from './childComponents/TagSection.jsx';
import NarrativeSection from './childComponents/NarrativeSection.jsx';
import ImageSection from './childComponents/ImageSection.jsx';
import ActionButtons from './childComponents/ActionButton.jsx';

const CreateCharacter = () => {
    // 🧠 Saara logic hook handle kar raha hai
    const {
        form, loading, updateField, handleChange,
        addListItem, updateListItem, removeListItem,
        togglePrimaryTag, handleImageUpload, removeImage, handleSubmit,
    } = useCharacterForm();

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] py-16 px-4 sm:px-6 lg:px-8 font-sans text-zinc-300 mt-10 mb-10 sm:mb-2">
            <div className="relative max-w-[1000px] mx-auto z-10">

                <div className="mb-16 text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 tracking-tight">Create Character</h1>
                    <p className="text-[10px] md:text-xs text-zinc-500 font-semibold tracking-[0.2em] uppercase">Draft your character's world</p>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
                    
                    {/* 1. Basic Details */}
                    <CoreFeatures form={form} handleChange={handleChange} />

                    {/* 2. Tags Logic */}
                    <TagsSection 
                        form={form} 
                        togglePrimaryTag={togglePrimaryTag} 
                        addListItem={addListItem} 
                        removeListItem={removeListItem} 
                    />

                    {/* 3. Story & Personality */}
                    <NarrativeSection 
                        form={form} 
                        handleChange={handleChange} 
                        updateListItem={updateListItem} 
                        removeListItem={removeListItem} 
                        addListItem={addListItem} 
                    />

                    {/* 4. Images Upload */}
                    <ImageSection 
                        form={form} 
                        loading={loading} 
                        handleImageUpload={handleImageUpload} 
                        removeImage={removeImage} 
                    />

                    {/* 5. Toggles & Buttons */}
                    <ActionButtons 
                        form={form} 
                        updateField={updateField} 
                        loading={loading} 
                        handleSubmit={handleSubmit} 
                    />

                </form>
            </div>
        </div>
    );
};

export default CreateCharacter;