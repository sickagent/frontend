import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export function Card({ hover, glow, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl bg-surface-1 border border-border/60
        ${hover ? 'hover:border-surface-4 hover:bg-surface-2 transition-all duration-300 cursor-pointer' : ''}
        ${glow ? 'hover:shadow-lg hover:shadow-sick-500/5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 border-b border-border/40 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}
