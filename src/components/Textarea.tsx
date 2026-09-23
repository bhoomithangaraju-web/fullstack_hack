import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-slate-700 tracking-wide">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`clay-input w-full py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 ${
            error ? 'border-rose-400 focus:border-rose-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs font-medium text-rose-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
