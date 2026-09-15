import { Menu, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Button from '../ui/Button';

export default function Navbar({ onMenuToggle, menuOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-navy/10 bg-navy text-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
            onClick={onMenuToggle}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to={ROUTES.DASHBOARD} className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-saffron text-navy">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold tracking-wide leading-tight sm:text-lg">
                LEGABLE
              </span>
              <span className="hidden text-xs text-white/65 sm:block">
                Mandatory declaration check for packaged goods
              </span>
            </span>
          </Link>
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <span className="hidden rounded-full border border-white/20 px-3 py-1 text-xs whitespace-nowrap text-white/80 xl:inline">
            Consumer · Retailer · Inspector
          </span>
          <Button as={Link} to={ROUTES.SCAN} size="sm">
            Scan Product
          </Button>
        </div>
      </div>
    </header>
  );
}
