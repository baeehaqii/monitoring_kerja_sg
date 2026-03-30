import { cn } from "@/lib/utils";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-white text-foreground placeholder:text-secondary",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "transition-all duration-150",
          error && "border-error focus:border-error focus:ring-error/20",
          props.disabled && "bg-muted cursor-not-allowed opacity-60",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className, id, ...props }: TextAreaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className={cn(
          "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-white text-foreground placeholder:text-secondary resize-none",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "transition-all duration-150",
          error && "border-error focus:border-error focus:ring-error/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  );
}

export function Select({ label, error, hint, options, placeholder, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-white text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "transition-all duration-150 cursor-pointer",
          error && "border-error",
          props.disabled && "bg-muted cursor-not-allowed opacity-60",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  );
}
