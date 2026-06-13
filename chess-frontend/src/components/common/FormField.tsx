import React, { forwardRef } from 'react';

interface FormFieldProps {
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, label, type = 'text', placeholder, value, onChange, onBlur, onKeyDown, error, disabled, icon }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 pl-1">
          {label}
        </label>
        
        <div className="relative group flex items-center">
          {icon && (
            <div className="absolute left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full py-3 rounded-xl border transition-all duration-200 outline-none text-sm font-medium ${
              icon ? 'pl-12 pr-4' : 'px-4'
            } ${
              error 
                ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-200' 
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50'
            }`}
          />
        </div>

        {error && (
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 pl-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
export default FormField;
