// create/components/CoreFeatures.jsx
import React from 'react';
import { SectionContainer, LimitedField } from './SharedUI.jsx';
import { LIMITS } from '../constantValues.js';

const CoreFeatures = ({ form, handleChange }) => {
    return (
        <SectionContainer title="Core Features">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <LimitedField label="Name" name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Arthur Leywin" limit={LIMITS.name} unit="chars" />
            </div>
            <div className="mb-6">
                <LimitedField label="Short Description" name="shortDescription" value={form.shortDescription} onChange={handleChange}
                    isTextArea rows={2} placeholder="One-line hook shown on the explore tab" limit={LIMITS.shortDescription} />
            </div>
            <LimitedField label="Long Description" name="longDescription" value={form.longDescription} onChange={handleChange}
                isTextArea rows={8} placeholder="The full story, visible on the character page" limit={LIMITS.longDescription} />
        </SectionContainer>
    );
};

export default CoreFeatures;