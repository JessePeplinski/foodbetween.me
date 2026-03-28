// src/components/PoiInput.js
'use client';

import { Label } from "@/components/ui/label";

const POI_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bar', label: 'Bar' },
  { value: 'park', label: 'Park' },
];

const PoiInput = ({ label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-3">
        {POI_TYPES.map((type) => (
          <label
            key={type.value}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="radio"
              name="poi-type"
              value={type.value}
              checked={value === type.value}
              onChange={(e) => onChange(e.target.value)}
              className="accent-primary h-4 w-4"
            />
            <span className="text-sm">{type.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PoiInput;
