import { STATUS_META } from '../../constants/status';
import { cn } from '../../utils/cn';

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status];

  if (!meta) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase',
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}
