import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

        const variants = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
            outline: 'border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-700',
            ghost: 'hover:bg-slate-100 text-slate-700',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4 py-2 text-sm',
            lg: 'h-12 px-6 text-base',
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
