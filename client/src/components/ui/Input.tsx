import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            {...props}
            className={[
              'w-full h-9 rounded-md border bg-raised text-text-primary text-sm',
              'placeholder:text-text-muted',
              'transition-colors duration-150',
              'focus:outline-none focus:border-border-strong focus:shadow-glow',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              error ? 'border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.4)]' : 'border-border',
              icon ? 'pl-9 pr-3' : 'px-3',
              className,
            ].join(' ')}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
