// src/components/AddressInput.js
'use client';

import { Label } from "@/components/ui/label";

const ADDRESS_OPTIONS = {
  'Address 1': [
    '123 Main St, New York, NY',
    '789 Market St, San Francisco, CA',
  ],
  'Address 2': [
    '456 Broadway, Brooklyn, NY',
    '1 Infinite Loop, Cupertino, CA',
  ],
};

const AddressInput = ({ label, value, onChange }) => {
  const options = ADDRESS_OPTIONS[label] || ADDRESS_OPTIONS['Address 1'];

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <select
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
      >
        <option value="" disabled>Select an address...</option>
        {options.map((addr) => (
          <option key={addr} value={addr}>{addr}</option>
        ))}
      </select>
    </div>
  );
};

export default AddressInput;
