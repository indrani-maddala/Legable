import { cn } from '../../utils/cn';
import Card from './Card';

export default function StatCard({ icon: Icon, label, value, hint, tone = 'navy' }) {
  const tones = {
    navy: 'bg-navy/10 text-navy',
    green: 'bg-compliant/10 text-compliant',
    yellow: 'bg-attention/10 text-attention',
    red: 'bg-noncompliant/10 text-noncompliant',
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-navy/70">{label}</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-navy/55">{hint}</p> : null}
        </div>
      </div>
    </Card>
  );
}
