import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { updateCharacter } from "../../api-calls/updateCharacter.js";
import { openCharDetails } from "../../api-calls/openCharDetails.js";
import { MAX_IMAGE_SIZE_BYTES, getWordCount } from "./utils.js";

// Components
import Header from "./childComponents/Header.jsx";
import VisualsSection from "./childComponents/VisualSection.jsx";
import IdentitySection from "./childComponents/IdentitySection.jsx";
import Categorization from "./childComponents/Categorization.jsx";
import NarrativeSection from "./childComponents/NarrativeSection.jsx";
import TogglesAndActions from "./childComponents/TogglesAndActions.jsx";


const UpdateCharacterContainer = () => {
    const { characterId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [initialData, setInitialData] = useState(null);
    const [formData, setFormData] = useState({
        name: "", shortDescription: "", longDescription: "",
        primaryTags: [], secondaryTags: [],
        personality: "", scenario: "", firstDialogues: [""],
        isPublic: true, status: "draft", hideDescription: false, images: [],
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch details
    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const response = await openCharDetails(characterId);
                const charData = response.data || response;
                const existingImages = charData.images ? charData.images.map(img => ({ ...img, isNew: false })) : [];

                const formattedData = {
                    ...charData,
                    primaryTags: charData.primaryTags || [],
                    secondaryTags: charData.secondaryTags || [],
                    firstDialogues: charData.firstDialogues?.length ? charData.firstDialogues : [""],
                    isPublic: charData.isPublic !== undefined ? charData.isPublic : true,
                    status: charData.status || "draft",
                    images: existingImages,
                };

                setFormData(formattedData);
                setInitialData(formattedData);
            } catch (error) {
                console.error("Failed to fetch character details:", error);
                toast.error("Error loading character data.");
            } finally {
                setIsLoading(false);
            }
        };
        if (characterId) fetchCharacter();
    }, [characterId]);

    // General Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    // Dialogue Handlers
    const handleDialogueChange = (index, value) => {
        const updatedDialogues = [...formData.firstDialogues];
        updatedDialogues[index] = value;
        setFormData(prev => ({ ...prev, firstDialogues: updatedDialogues }));
    };
    const addDialogue = () => setFormData(prev => ({ ...prev, firstDialogues: [...prev.firstDialogues, ""] }));
    const removeDialogue = (index) => {
        const updated = [...formData.firstDialogues];
        updated.splice(index, 1);
        setFormData({ ...formData, firstDialogues: updated });
    };

    // Tag Handlers
    const togglePrimaryTag = (tag) => {
        console.log("Toggling primary tag:", tag);
        setFormData(prev => ({
            ...prev,
            primaryTags: prev.primaryTags.includes(tag) ? prev.primaryTags.filter(t => t !== tag) : [...prev.primaryTags, tag]
        }));
    };
    const handleAddSecondaryTag = (newTag) => {
        if (newTag.trim() && !formData.secondaryTags.includes(newTag.trim())) {
            setFormData(prev => ({ ...prev, secondaryTags: [...prev.secondaryTags, newTag.trim()] }));
        }
    };
    const handleRemoveSecondaryTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, secondaryTags: prev.secondaryTags.filter(tag => tag !== tagToRemove) }));
    };

    // Image Handlers
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        let validFiles = [];
        files.forEach(file => {
            const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
            const isValidSize = file.size <= MAX_IMAGE_SIZE_BYTES;

            if (!isValidType) toast.error(`${file.name} is not a supported format.`);
            else if (!isValidSize) toast.error(`${file.name} exceeds the 5MB limit.`);
            else validFiles.push(file);
        });

        if (formData.images.length + validFiles.length > 8) {
            toast.error("You can only upload a maximum of 8 images.");
            validFiles = validFiles.slice(0, 8 - formData.images.length);
        }

        const newImages = validFiles.map(file => ({ file, url: URL.createObjectURL(file), isNew: true }));
        setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => {
            const updated = [...prev.images];
            updated.splice(index, 1);
            return { ...prev, images: updated };
        });
    };

    const isUnchanged = JSON.stringify(formData) === JSON.stringify(initialData);

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (formData.images.length < 1 || formData.images.length > 8) return toast.error("You must have between 1 and 8 images.");
        if (formData.name?.length > 30) return toast.error("Name cannot exceed 30 letters.");
        if (getWordCount(formData.shortDescription) > 25) return toast.error("Short description cannot exceed 25 words.");
        if (getWordCount(formData.longDescription) > 2000) return toast.error("Long description cannot exceed 2000 words.");
        if (getWordCount(formData.personality) > 3000) return toast.error("Personality cannot exceed 3000 words.");
        if (getWordCount(formData.scenario) > 3000) return toast.error("Scenario cannot exceed 3000 words.");

        for (let i = 0; i < formData.firstDialogues.length; i++) {
            if (getWordCount(formData.firstDialogues[i]) > 1000) return toast.error(`Dialogue #${i + 1} cannot exceed 1000 words.`);
        }

        if (isUnchanged) return toast.error("Needs update: No changes were detected.");

        setIsSaving(true);
        try {
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("shortDescription", formData.shortDescription);
            submitData.append("longDescription", formData.longDescription);
            submitData.append("personality", formData.personality);
            submitData.append("scenario", formData.scenario);
            submitData.append("status", formData.status);
            submitData.append("isPublic", formData.isPublic);
            submitData.append("hideDescription", formData.hideDescription);
            submitData.append("primaryTags", JSON.stringify(formData.primaryTags));
            submitData.append("secondaryTags", JSON.stringify(formData.secondaryTags));
            submitData.append("firstDialogues", JSON.stringify(formData.firstDialogues));

            const existingImages = formData.images.filter(img => !img.isNew).map(img => ({ url: img.url, fileId: img.fileId }));
            submitData.append("existingImages", JSON.stringify(existingImages));

            formData.images.forEach(img => {
                if (img.isNew && img.file) submitData.append("images", img.file);
            });

            await updateCharacter(characterId, submitData);
            toast.success("Character updated successfully!");
            queryClient.invalidateQueries(["my-characters"]);
            navigate("/profile");

        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to update character.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-white text-center p-10">Loading character data...</div>;

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-300 p-4 sm:p-6 md:p-10 flex justify-center font-sans selection:bg-indigo-500/30 mt-15 sm:mt-0 mb-5 sm:mb-0">
            <div className="max-w-4xl w-full space-y-8">

                <Header status={formData.status} handleChange={handleChange} />

                <VisualsSection images={formData.images} handleImageUpload={handleImageUpload} handleRemoveImage={handleRemoveImage} />

                <IdentitySection formData={formData} handleChange={handleChange} />

                <Categorization
                    formData={formData}
                    togglePrimaryTag={togglePrimaryTag}
                    handleAddSecondaryTag={handleAddSecondaryTag}
                    handleRemoveSecondaryTag={handleRemoveSecondaryTag}
                />

                <NarrativeSection
                    formData={formData}
                    handleChange={handleChange}
                    handleDialogueChange={handleDialogueChange}
                    addDialogue={addDialogue}
                    removeDialogue={removeDialogue}
                />

                <TogglesAndActions
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    isUnchanged={isUnchanged}
                    isSaving={isSaving}
                />

            </div>
        </div>
    );
};

export default UpdateCharacterContainer;