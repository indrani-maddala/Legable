import { cn } from '../../utils/cn';

const variants = {
  primary:
    'bg-saffron text-navy hover:bg-saffron/90 shadow-sm font-semibold',
  secondary:
    'bg-navy text-white hover:bg-navy-800 shadow-sm font-semibold',
  outline:
    'border border-navy/20 bg-white text-navy hover:bg-navy/5 font-semibold',
  onDark:
    'border border-white/35 bg-transparent text-white hover:bg-white/10 font-semibold',
  ghost: 'text-navy hover:bg-navy/5 font-medium',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
