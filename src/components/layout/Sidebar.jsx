import {
  CircleHelp,
  History,
  LayoutDashboard,
  ScanLine,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../utils/cn';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.SCAN, label: 'Scan Product', icon: ScanLine },
  { to: ROUTES.HISTORY, label: 'Scan History', icon: History },
  { to: ROUTES.ABOUT, label: 'About / Help', icon: CircleHelp },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full flex-col bg-navy text-white">
      <div className="hidden border-b border-white/10 px-5 py-5 md:block">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-saffron uppercase">
          Label compliance
        </p>
        <p className="mt-2 font-display text-lg leading-snug font-semibold">
          LEGABLE
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/12 text-white'
                    : 'text-white/75 hover:bg-white/8 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 text-xs text-white/60">
        For consumers, retailers, and inspectors. Prototype uses mock data until
        the backend is connected.
      </div>
    </aside>
  );
}
