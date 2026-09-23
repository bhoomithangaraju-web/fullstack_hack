import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3.5 text-slate-400 pointer-events-none">{icon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={`clay-input w-full py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-rose-400 focus:border-rose-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs font-medium text-rose-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
