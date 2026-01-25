import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    relative overflow-hidden
    font-medium tracking-wide
    transition-all duration-300 ease-out
    flex items-center justify-center gap-2.5
    disabled:opacity-40 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-arch-gold/50 focus:ring-offset-2 focus:ring-offset-arch-dark
    group
  `;

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3.5 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-arch-gold via-arch-copper to-arch-gold
      bg-[length:200%_100%]
      text-arch-dark font-semibold
      border border-arch-gold/20
      hover:bg-[position:100%_0]
      hover:shadow-[0_0_30px_rgba(201,169,98,0.3)]
      active:scale-[0.98]
    `,
    secondary: `
      bg-arch-steel/50
      text-arch-cream
      border border-arch-steel
      hover:bg-arch-steel
      hover:border-arch-gold/30
      active:scale-[0.98]
    `,
    ghost: `
      bg-transparent
      text-arch-mist/70
      border border-transparent
      hover:text-arch-gold
      hover:bg-arch-gold/5
    `,
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {/* Shimmer effect on hover */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />

      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
