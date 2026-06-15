import { HTMLAttributes, ReactNode } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  hoverable?: boolean;
  children: ReactNode;
}

const paddingClasses: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ padding = 'md', hoverable = false, children, className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={[
        'bg-surface border border-border rounded-lg shadow-surface',
        paddingClasses[padding],
        hoverable && 'transition-colors duration-150 hover:border-border-strong cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
