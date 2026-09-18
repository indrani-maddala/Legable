import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  FileSearch,
  Loader2,
  RotateCcw,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import { ROUTES } from '../constants/routes';
import { PROCESSING_STEPS, useScan } from '../context/ScanContext';

const STEP_ICONS = [
  FileSearch,
  FileCheck2,
  Scale,
  Sparkles,
];

export default function ScanProcessing() {
  const navigate = useNavigate();
  const {
    file,
    previewUrl,
    progress,
    currentStepIndex,
    status,
    runProcessing,
    resetScan,
    error,
  } = useScan();

  const startedRef = useRef(false);

  useEffect(() => {
    if (!file && !previewUrl) {
      navigate(ROUTES.SCAN, { replace: true });
    }
  }, [file, previewUrl, navigate]);

  useEffect(() => {
    if (!file && !previewUrl) return;
    if (startedRef.current) return;
    startedRef.current = true;
    runProcessing();
  }, [file, previewUrl, runProcessing]);

  // Reactive transition: Automatically navigate to /scan/result when completed
  useEffect(() => {
    if (status === 'completed' && progress >= 100) {
      const timer = setTimeout(() => {
        navigate(ROUTES.RESULT, { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, progress, navigate]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-semibold tracking-wide text-saffron uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron"></span>
            </span>
            Automated Inspection in Progress
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Analyzing Packaged Product
          </h1>
          <p className="mt-2 text-sm text-navy/70">
            Running OCR, then structured extraction of the 8 mandatory declaration fields.
          </p>
        </div>

        <Button
          as={Link}
          to={ROUTES.SCAN}
          variant="outline"
          size="sm"
          className="shrink-0 self-start"
          onClick={resetScan}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Cancel Scan
        </Button>
      </div>

      {/* Error state if an unexpected failure occurs */}
      {status === 'error' || error ? (
        <Card className="border-noncompliant/40 bg-noncompliant/5 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-noncompliant shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="font-display text-lg font-semibold text-noncompliant">
                Analysis Encountered an Issue
              </h2>
              <p className="text-sm text-navy/80">
                {error || 'Unable to complete the automated scan. Please re-check the image or try a sample product.'}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={() => runProcessing()} size="sm">
                  <RotateCcw className="h-4 w-4" />
                  Retry Inspection
                </Button>
                <Button as={Link} to={ROUTES.SCAN} variant="outline" size="sm" onClick={resetScan}>
                  Back to Scan
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Main Inspection Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        {/* Left: Image with Scanning Laser Animation */}
        <Card className="overflow-hidden border-navy/15">
          <div className="relative flex min-h-[340px] items-center justify-center bg-navy/95 p-4 sm:min-h-[400px]">
            {previewUrl ? (
              <div className="relative max-h-[380px] w-full overflow-hidden rounded-md border border-white/10 bg-black/30">
                <img
                  src={previewUrl}
                  alt="Product label under scan"
                  className="mx-auto max-h-[380px] w-full object-contain filter contrast-105"
                />

                {/* Animated Laser Scanning Beam */}
                <div
                  className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-saffron to-transparent shadow-[0_0_15px_3px_rgba(255,153,51,0.8)]"
                  style={{
                    animation: 'scanLaser 2.2s ease-in-out infinite alternate',
                  }}
                />

                {/* Grid Overlay for Inspection Effect */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Target Corners */}
                <div className="pointer-events-none absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-saffron" />
                <div className="pointer-events-none absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-saffron" />
                <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-saffron" />
                <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-saffron" />

                {/* Active HUD badge */}
                <div className="absolute right-3 bottom-3 rounded bg-navy/80 px-2.5 py-1 text-[11px] font-mono text-saffron backdrop-blur-sm">
                  {status === 'completed' ? 'COMPLETE · 100%' : `SCANNING · ${progress}%`}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-white/60">
                <AlertCircle className="h-8 w-8 text-saffron mb-2" />
                <p className="text-sm">Preparing label image...</p>
              </div>
            )}
          </div>

          <div className="border-t border-navy/10 bg-surface px-5 py-3 text-xs text-navy/65 flex items-center justify-between">
            <span className="truncate max-w-[240px] font-medium text-navy">
              {file?.name || 'Packaged_Commodity_Label.jpg'}
            </span>
            <span className="font-mono text-saffron font-semibold">
              Status: {status.toUpperCase()}
            </span>
          </div>
        </Card>

        {/* Right: Progress Meter & Pipeline Steps */}
        <div className="space-y-4">
          {/* Progress Bar Card */}
          <Card>
            <CardBody className="p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-navy">Inspection Progress</span>
                <span className="font-mono text-base font-bold text-saffron">{progress}%</span>
              </div>

              {/* Bar */}
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-navy/10">
                <div
                  className="h-full rounded-full bg-saffron transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-navy/60">
                Live scans run OCR and structured field extraction. Legal compliance scoring is deferred.
              </p>
            </CardBody>
          </Card>

          {/* 4 Pipeline Stages Checklist */}
          <Card>
            <CardBody className="p-5 space-y-3">
              <p className="text-xs font-semibold tracking-wider text-navy/60 uppercase">
                Inspection Pipeline Stages
              </p>

              <div className="space-y-2.5">
                {PROCESSING_STEPS.map((step, index) => {
                  const Icon = STEP_ICONS[index] || FileSearch;
                  const isDone = progress === 100 || currentStepIndex > index;
                  const isActive = currentStepIndex === index && progress < 100;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                        isActive
                          ? 'border-saffron/40 bg-saffron/5 shadow-xs'
                          : isDone
                          ? 'border-compliant/30 bg-compliant/5 text-navy'
                          : 'border-navy/10 bg-white/50 text-navy/50 opacity-60'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-compliant" aria-hidden="true" />
                        ) : isActive ? (
                          <Loader2 className="h-5 w-5 animate-spin text-saffron" aria-hidden="true" />
                        ) : (
                          <Icon className="h-5 w-5 text-navy/40" aria-hidden="true" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-semibold ${isActive ? 'text-navy' : isDone ? 'text-compliant' : 'text-navy/70'}`}>
                            {step.title}
                          </p>
                          {isDone ? (
                            <span className="text-[11px] font-bold text-compliant uppercase">
                              Done
                            </span>
                          ) : isActive ? (
                            <span className="text-[11px] font-bold text-saffron uppercase animate-pulse">
                              Active
                            </span>
                          ) : (
                            <span className="text-[11px] text-navy/40 uppercase">Pending</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-navy/60 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes scanLaser {
          0% { top: 0%; }
          100% { top: 98%; }
        }
      `}</style>
    </div>
  );
}
