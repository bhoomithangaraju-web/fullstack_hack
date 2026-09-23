import React from 'react';
import { Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label?: string;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  onChange,
  options,
  label,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {label && <span className="text-xs font-semibold text-slate-500">{label}:</span>}
      <div className="relative flex items-center">
        <Filter className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="clay-input py-2 pl-9 pr-8 text-xs font-semibold text-slate-700 bg-transparent appearance-none cursor-pointer focus:outline-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
