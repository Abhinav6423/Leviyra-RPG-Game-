import api from "../lib/axios";

export const createCharacter = async (characterData) => {
    // FormData isliye use kar rahe hain kyunki humein Text ke saath-saath Files (Images) bhi bhejni hain.
    const formData = new FormData();

    // 1. Basic Text Fields
    // Ye simple strings hain, toh inhe direct append kar sakte hain
    formData.append("name", characterData.name);
    formData.append("shortDescription", characterData.shortDescription);
    formData.append("longDescription", characterData.longDescription);
    formData.append("personality", characterData.personality);
    formData.append("scenario", characterData.scenario);
    formData.append("status", characterData.status); // "draft" ya "published"

    // 2. Boolean Fields
    // FormData booleans ko sahi se handle nahi karta (kabhi-kabhi ignore kar deta hai), 
    // isliye hum inko explicitly string mein convert kar rahe hain (e.g. "true" ya "false").
    formData.append("isPublic", String(characterData.isPublic));
    formData.append("hideDescription", String(characterData.hideDescription));

    // 3. Arrays (Lists)
    // FormData sirf strings ya files allow karta hai. Isliye arrays (tags, dialogues) 
    // ko backend par bhejne se pehle JSON.stringify karna padta hai.
    // Backend (Node/Express) mein ise wapas JSON.parse() karke array banana padega.
    formData.append("primaryTags", JSON.stringify(characterData.primaryTags));
    formData.append("secondaryTags", JSON.stringify(characterData.secondaryTags));
    formData.append("firstDialogues", JSON.stringify(characterData.firstDialogues));

    // 4. Images (Files)
    // Array of files ko bhejne ke liye hume loop chala kar har file ko same key ("images") 
    // ke andar append karna hota hai. Backend (jaise Multer) isko array of files samajh lega.
    if (characterData.images && characterData.images.length > 0) {
        characterData.images.forEach((file) => {
            formData.append("images", file);
        });
    }

    // API Request Bhejna
    // Headers mein "multipart/form-data" dena zaroori hai taaki server samajh sake ki files aa rahi hain.
    const res = await api.post("/characters/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    
    return res.data;
};