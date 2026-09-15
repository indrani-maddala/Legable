import { cn } from '../../utils/cn';

export default function Card({ className, children, ...props }) {
  return (
    <section
      className={cn(
        'rounded-lg border border-navy/10 bg-white shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div
      className={cn(
        'border-b border-navy/10 px-5 py-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}
