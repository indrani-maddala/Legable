import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ROUTES } from '../constants/routes';

export default function ComingSoon({ title, description }) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-navy/10 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-semibold tracking-[0.16em] text-saffron uppercase">
        Next build step
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-navy">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-navy/70">{description}</p>
      <Button as={Link} to={ROUTES.DASHBOARD} variant="outline" className="mt-6">
        Back to Dashboard
      </Button>
    </div>
  );
}
