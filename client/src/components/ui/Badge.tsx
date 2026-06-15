import { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'purple' | 'cyan';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-500/15 text-green-400 border border-green-500/20',
  warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  error: 'bg-red-500/15 text-red-400 border border-red-500/20',
  neutral: 'bg-white/5 text-text-secondary border border-border',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  purple: 'bg-accent-purple-dim text-accent-purple-light border border-accent-purple/20',
  cyan: 'bg-accent-cyan-dim text-accent-cyan-light border border-accent-cyan/20',
};

export function Badge({ variant = 'neutral', children, className = '', ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={[
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
