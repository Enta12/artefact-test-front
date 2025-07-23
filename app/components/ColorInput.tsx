import React from 'react';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      aria-label="Couleur de la colonne"
      type="color"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-12 h-8 p-0 cursor-pointer"
    />
    <span className="text-sm text-gray-500">Couleur de la colonne</span>
  </div>
);

export default ColorInput; 