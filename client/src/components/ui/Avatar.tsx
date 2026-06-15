type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export function Avatar({ src, name = '', size = 'md', className = '' }: AvatarProps) {
  const base = [
    'inline-flex items-center justify-center rounded-full font-semibold shrink-0 select-none overflow-hidden',
    sizeClasses[size],
    className,
  ].join(' ');

  if (src) {
    return <img src={src} alt={name} className={`${base} object-cover`} />;
  }

  return (
    <span className={`${base} bg-accent-purple-dim text-accent-purple-light`}>
      {name ? getInitials(name) : '?'}
    </span>
  );
}
