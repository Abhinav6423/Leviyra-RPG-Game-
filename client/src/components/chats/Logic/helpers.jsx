import React from 'react';
import { FIRST_DIALOGUE_KEYS } from './constants.js';

export function getFirstDialogues(character) {
    if (!character) return [];
    for (const key of FIRST_DIALOGUE_KEYS) {
        if (Array.isArray(character[key]) && character[key].length > 0) return character[key];
    }
    return [];
}

export function unwrapEnvelope(raw) {
    let value = raw;
    let guard = 0;
    while (value && typeof value === 'object' && guard < 5) {
        if ('name' in value || 'characterName' in value || 'firstDialogues' in value) break;
        if ('data' in value && value.data) {
            value = value.data;
            guard += 1;
        } else break;
    }
    return value;
}

/* ============================================================
   NAYI CHEEZ: content ab hamesha ek ARRAY hai (backend se), kyunki
   har message ke multiple "versions" ho sakte hain (replay/regenerate
   se). Yeh do functions hi is baat ko samajhte hain — baaki poora
   frontend sirf inhe call karega, kabhi seedha msg.content nahi padhega.
============================================================ */

// Saare versions ka array — agar kabhi purana/galat data mile
// (bare string) to bhi safely array bana deta hai.
export function getMessageVersions(msg) {
    if (Array.isArray(msg?.content)) return msg.content;
    if (msg?.content) return [String(msg.content)];
    return [''];
}

// Jo version ABHI dikhana hai — selectedAlternateIndex ke hisaab se,
// warna sabse latest (last) version default hota hai.
export function getActiveContent(msg) {
    const versions = getMessageVersions(msg);
    const idx =
        typeof msg?.selectedAlternateIndex === 'number' &&
        msg.selectedAlternateIndex >= 0 &&
        msg.selectedAlternateIndex < versions.length
            ? msg.selectedAlternateIndex
            : versions.length - 1;
    return versions[idx] ?? '';
}

export function renderMessageContent(content) {
    if (!content) return null;
    const text = String(content).replace(/\\n/g, '\n');
    const parts = text.split(/(\*[^*]+\*)/g);

    return parts.map((part, index) =>
        part.startsWith('*') && part.endsWith('*')
            ? <span key={index} className="italic text-[0.94em] text-stone-300">{part}</span>
            : <span key={index} className="text-white font-medium">{part}</span>
    );
}

export function resolveAvatarSrc(character) {
    const first = character?.images?.[0];
    if (!first) return null;
    return typeof first === 'string' ? first : first.url || first.imageUrl || null;
}

export function resolveCharacterName(character) {
    return character?.name || character?.characterName || "this character";
}

export function getBubbleGlowStyle(moodLightOn, glowColor) {
    if (moodLightOn && glowColor) {
        return {
            boxShadow: `0 0 30px -10px ${glowColor}50, inset 0 0 10px -5px ${glowColor}30`,
            borderColor: `${glowColor}60`,
        };
    }
    return { borderColor: 'rgba(255, 255, 255, 0.08)' };
}