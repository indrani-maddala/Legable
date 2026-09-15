import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import TricolorBar from './TricolorBar';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-svh bg-surface">
      <TricolorBar />
      <Navbar menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />

      <div className="flex min-h-[calc(100svh-3.75rem)]">
        <div className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-[3.75rem] h-[calc(100svh-3.75rem)]">
            <Sidebar />
          </div>
        </div>

        {menuOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-navy/50"
              aria-label="Close menu overlay"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative h-full w-72 max-w-[80vw] shadow-xl">
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
