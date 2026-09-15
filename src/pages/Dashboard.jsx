import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  History,
  ScanLine,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { ROUTES } from '../constants/routes';
import { dashboardStats, recentScans } from '../data/mockDashboard';

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-lg border border-navy/10 bg-navy text-white shadow-sm">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-saffron uppercase">
              Packaged commodity compliance
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              LEGABLE
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              Upload or capture a packaged commodity label. The scanner checks
              whether mandatory declarations are present and correctly formatted
              for consumers, retailers, and compliance officers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button as={Link} to={ROUTES.SCAN} size="lg">
                <ScanLine className="h-5 w-5" aria-hidden="true" />
                Scan Product
              </Button>
              <Button as={Link} to={ROUTES.ABOUT} variant="onDark" size="lg">
                How it works
              </Button>
            </div>
          </div>

          <div className="rounded-md border border-white/15 bg-white/5 p-4 sm:p-5">
            <p className="text-sm font-semibold">Declaration snapshot</p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>Net quantity, MRP, and manufacturer details</li>
              <li>Date of manufacture / expiry / best before</li>
              <li>Consumer care information</li>
              <li>Missing fields, warnings, and recommendations</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Compliance statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ClipboardList}
            label="Total scans"
            value={dashboardStats.totalScans}
            hint="Mock data for prototype"
            tone="navy"
          />
          <StatCard
            icon={CheckCircle2}
            label="Compliant"
            value={`${dashboardStats.compliant} · ${dashboardStats.complianceRate}%`}
            hint="GREEN status"
            tone="green"
          />
          <StatCard
            icon={AlertTriangle}
            label="Needs attention"
            value={dashboardStats.needsAttention}
            hint="YELLOW status"
            tone="yellow"
          />
          <StatCard
            icon={ShieldAlert}
            label="Non-compliant"
            value={dashboardStats.nonCompliant}
            hint="RED status"
            tone="red"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Recent scans</h2>
              <p className="text-sm text-navy/60">Latest label checks from mock records</p>
            </div>
            <Button as={Link} to={ROUTES.HISTORY} variant="ghost" size="sm">
              View history
            </Button>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface text-navy/70">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Scanned</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="border-t border-navy/10">
                    <td className="px-5 py-3">
                      <p className="font-semibold">{scan.productName}</p>
                      <p className="text-xs text-navy/55">
                        {scan.id} · {scan.netQuantity} · {scan.mrp}
                      </p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-navy/70">
                      {scan.scannedAt}
                    </td>
                    <td className="px-5 py-3 font-semibold">{scan.score}%</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={scan.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">Quick actions</h2>
            <p className="text-sm text-navy/60">Start a check or review records</p>
          </CardHeader>
          <CardBody className="space-y-3">
            <Button as={Link} to={ROUTES.SCAN} className="w-full" variant="secondary">
              <ScanLine className="h-4 w-4" />
              Scan a new product
            </Button>
            <Button as={Link} to={ROUTES.UPLOAD} className="w-full" variant="outline">
              <Upload className="h-4 w-4" />
              Upload label image
            </Button>
            <Button as={Link} to={ROUTES.HISTORY} className="w-full" variant="outline">
              <History className="h-4 w-4" />
              Open scan history
            </Button>
            <div className="rounded-md bg-surface p-3 text-xs leading-relaxed text-navy/70">
              OCR and backend verification are not connected yet. Navigation
              targets for later screens are in place so the flow can be built
              step by step.
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
