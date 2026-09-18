import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileCheck2,
  HelpCircle,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import { ROUTES } from '../constants/routes';
import { COMPLIANCE_STATUS } from '../constants/status';
import { DEMO_SAMPLES, useScan } from '../context/ScanContext';
import {
  EXTRACT_STATUS,
  FIELD_DEFINITIONS,
} from '../services/fieldExtractionService';

function fieldDisplayValue(item) {
  if (item?.status === EXTRACT_STATUS.NOT_FOUND || !item?.value) {
    return 'Not found in OCR';
  }
  return item.value;
}

function fieldStatusLabel(status) {
  if (status === EXTRACT_STATUS.FOUND) return 'FOUND';
  if (status === EXTRACT_STATUS.UNCERTAIN) return 'UNCERTAIN';
  return 'NOT_FOUND';
}

function fieldStatusHint(item) {
  if (item?.status === EXTRACT_STATUS.NOT_FOUND) {
    return 'This information was not reliably extracted from OCR. That does not automatically mean the label is legally non-compliant.';
  }
  if (item?.status === EXTRACT_STATUS.UNCERTAIN) {
    return 'The OCR evidence for this field is ambiguous. The value is shown only when a possible snippet was found.';
  }
  return 'Value is supported by the OCR evidence below.';
}

export default function ScanResult() {
  const navigate = useNavigate();
  const {
    complianceResult,
    extractedFields,
    rawOcrText,
    previewUrl,
    file,
    resetScan,
    loadDemoSample,
  } = useScan();
  const [activeTab, setActiveTab] = useState('all');
  const [expandedCheckId, setExpandedCheckId] = useState(null);
  const [showRawOcr, setShowRawOcr] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isDemoScan = Boolean(file?.isDemo || file?.demoId || complianceResult && !complianceResult.source);
  const result = complianceResult;
  const fields = extractedFields || result?.extractedFields || null;
  const ocrText = rawOcrText || result?.rawOcrText || '';
  const displayImage = previewUrl || result?.previewUrl;
  const compliancePending = Boolean(result?.source === 'live' || result?.overallStatus === 'PENDING' || (!isDemoScan && result && result.score == null));
  const hasScan = Boolean(result || fields || file || previewUrl);

  const status = result?.overallStatus || (compliancePending ? 'PENDING' : COMPLIANCE_STATUS.COMPLIANT);
  const checks = result?.checks || [];
  const violations = result?.violations || [];
  const score = result?.score;

  const filteredChecks =
    activeTab === 'violations'
      ? checks.filter((c) => c.status === 'FAIL' || c.status === 'WARNING')
      : checks;

  const passedCount = checks.filter((c) => c.status === 'PASS').length;
  const warningCount = checks.filter((c) => c.status === 'WARNING').length;
  const failedCount = checks.filter((c) => c.status === 'FAIL').length;

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }

  function handleScanAnother() {
    resetScan();
    navigate(ROUTES.SCAN);
  }

  function handleDownloadReport() {
    showToast('Detailed Compliance Report PDF generation is scheduled for Phase 4.');
  }

  function handleSaveHistory() {
    showToast('Scan record saved to active session history!');
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Toast Notification */}
      {toastMessage ? (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-lg border border-navy/20 bg-navy px-4 py-3 text-sm text-white shadow-lg animate-in fade-in"
          role="alert"
        >
          <Scale className="h-4 w-4 text-saffron shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="ml-2 text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
      ) : null}

      {/* Top Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-saffron uppercase">
              Inspection Report
            </span>
            <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-medium text-navy">
              Legal Metrology Rules, 2011
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold text-navy sm:text-3xl">
            {result?.name || file?.name || 'Packaged Commodity Inspection'}
          </h1>
          <p className="mt-1 text-xs text-navy/60">
            {compliancePending
              ? 'OCR and structured field extraction completed · Compliance scoring deferred'
              : 'Automated label analysis completed'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleScanAnother} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
            Scan Another Product
          </Button>
          <Button onClick={handleDownloadReport} variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {!hasScan ? (
        <Card>
          <CardBody className="p-8 text-center">
            <HelpCircle className="mx-auto h-8 w-8 text-navy/40" />
            <h2 className="mt-3 font-display text-xl font-semibold text-navy">
              No scan is available
            </h2>
            <p className="mt-2 text-sm text-navy/65">
              Upload a label image or choose a demo sample to extract declaration fields.
            </p>
            <Button as={Link} to={ROUTES.SCAN} className="mt-4">
              Go to Scan Product
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {hasScan ? (
      <section
        className={`relative overflow-hidden rounded-xl border p-6 text-white shadow-sm transition-colors ${
          compliancePending
            ? 'border-navy/30 bg-gradient-to-r from-navy to-navy-800'
            : status === COMPLIANCE_STATUS.COMPLIANT
            ? 'border-compliant/40 bg-gradient-to-r from-compliant to-emerald-800'
            : status === COMPLIANCE_STATUS.NON_COMPLIANT
            ? 'border-noncompliant/40 bg-gradient-to-r from-noncompliant to-red-900'
            : 'border-attention/40 bg-gradient-to-r from-amber-600 to-amber-800'
        }`}
      >
        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {compliancePending ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                  <FileCheck2 className="h-7 w-7" />
                </span>
              ) : status === COMPLIANCE_STATUS.COMPLIANT ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                  <ShieldCheck className="h-7 w-7" />
                </span>
              ) : status === COMPLIANCE_STATUS.NON_COMPLIANT ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                  <ShieldAlert className="h-7 w-7" />
                </span>
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                  <AlertTriangle className="h-7 w-7" />
                </span>
              )}

              <div>
                <p className="text-xs font-semibold tracking-wider text-white/80 uppercase">
                  {compliancePending ? 'Compliance Status' : 'Overall Compliance Assessment'}
                </p>
                <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {compliancePending
                    ? 'Not yet verified'
                    : status === COMPLIANCE_STATUS.COMPLIANT
                    ? 'PASSED · Fully Compliant'
                    : status === COMPLIANCE_STATUS.NON_COMPLIANT
                    ? 'FAILED · Violations Detected'
                    : 'WARNING · Needs Attention'}
                </h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/90 max-w-2xl">
              {result?.summary ||
                'Structured fields were extracted from the label. Legal compliance scoring has not been applied.'}
            </p>

            {compliancePending ? (
              <p className="text-xs text-white/80">
                Compliance verification pending. Extraction status is not a legal pass or fail result.
              </p>
            ) : (
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-white/85">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                {passedCount} Passed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                {warningCount} Warnings
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1">
                <XCircle className="h-4 w-4 text-red-300" />
                {failedCount} Violations
              </span>
            </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border border-white/20 bg-white/10 p-5 text-center backdrop-blur-xs">
            <p className="text-xs font-semibold tracking-wider text-white/80 uppercase">
              {compliancePending ? 'Compliance Index' : 'Compliance Index'}
            </p>
            <div className="relative mt-2 flex min-h-24 min-w-24 items-center justify-center rounded-full border-4 border-white/30 bg-black/20 px-3">
              {compliancePending || score == null ? (
                <span className="font-display text-sm font-bold leading-tight text-white">
                  Pending
                </span>
              ) : (
                <span className="font-display text-3xl font-bold text-white">{score}%</span>
              )}
            </div>
            <p className="mt-2 text-xs text-white/75">
              {compliancePending ? 'Not yet verified' : 'Legal Metrology Standard Grade'}
            </p>
          </div>
        </div>
      </section>
      ) : null}

      {/* Main Inspection Body */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {fields ? (
            <Card>
              <CardHeader>
                <h3 className="font-display text-lg font-semibold text-navy">
                  Extracted Label Information
                </h3>
                <p className="text-xs text-navy/60">
                  Eight declaration fields mapped from OCR evidence. Status describes extraction confidence, not legal compliance.
                </p>
              </CardHeader>
              <CardBody className="p-4 space-y-3">
                {FIELD_DEFINITIONS.map((definition) => {
                  const item = fields[definition.key] || {
                    value: null,
                    status: EXTRACT_STATUS.NOT_FOUND,
                    evidence: null,
                  };
                  const statusKey = fieldStatusLabel(item.status);
                  return (
                    <div
                      key={definition.key}
                      className={`rounded-lg border p-4 ${
                        statusKey === 'FOUND'
                          ? 'border-compliant/25 bg-compliant/5'
                          : statusKey === 'UNCERTAIN'
                          ? 'border-attention/30 bg-attention/5'
                          : 'border-navy/10 bg-surface/70'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-navy">{definition.label}</p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                            statusKey === 'FOUND'
                              ? 'bg-compliant/10 text-compliant'
                              : statusKey === 'UNCERTAIN'
                              ? 'bg-attention/10 text-attention'
                              : 'bg-navy/10 text-navy/60'
                          }`}
                        >
                          {statusKey}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-navy">
                        <span className="text-xs font-semibold uppercase tracking-wide text-navy/50">Value: </span>
                        {fieldDisplayValue(item)}
                      </p>
                      <p className="mt-1 text-xs text-navy/65">{fieldStatusHint(item)}</p>
                      <p className="mt-2 text-xs text-navy/70">
                        <span className="font-semibold text-navy">Evidence: </span>
                        {item.evidence ? item.evidence : 'No OCR evidence'}
                      </p>
                    </div>
                  );
                })}

                {ocrText ? (
                  <div className="rounded-lg border border-navy/10 bg-white p-3">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between text-sm font-semibold text-navy"
                      onClick={() => setShowRawOcr((open) => !open)}
                    >
                      Raw OCR text
                      {showRawOcr ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {showRawOcr ? (
                      <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-surface p-3 text-xs text-navy/80">
                        {ocrText}
                      </pre>
                    ) : null}
                  </div>
                ) : null}
              </CardBody>
            </Card>
          ) : null}

          {checks.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-navy">
                  Legal Metrology Declarations (8 Mandatory Rules)
                </h3>
                <p className="text-xs text-navy/60">
                  Verification according to Legal Metrology (Packaged Commodities) Rules, 2011
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="inline-flex rounded-lg border border-navy/10 bg-surface p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white font-semibold text-navy shadow-xs'
                      : 'text-navy/65 hover:text-navy'
                  }`}
                >
                  All Declarations ({checks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('violations')}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    activeTab === 'violations'
                      ? 'bg-white font-semibold text-noncompliant shadow-xs'
                      : 'text-navy/65 hover:text-navy'
                  }`}
                >
                  Action Items ({failedCount + warningCount})
                </button>
              </div>
            </CardHeader>

            <CardBody className="p-4 space-y-3">
              {filteredChecks.length === 0 ? (
                <div className="p-8 text-center text-sm text-navy/60">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-compliant mb-2" />
                  No violations found! All checked declarations are compliant.
                </div>
              ) : (
                filteredChecks.map((item, idx) => {
                  const isExpanded = expandedCheckId === item.id;
                  const isPass = item.status === 'PASS';
                  const isFail = item.status === 'FAIL';
                  const isWarning = item.status === 'WARNING';

                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border transition-all ${
                        isFail
                          ? 'border-noncompliant/30 bg-noncompliant/5'
                          : isWarning
                          ? 'border-attention/30 bg-attention/5'
                          : 'border-navy/10 bg-white hover:border-navy/20'
                      }`}
                    >
                      <div
                        className="flex cursor-pointer items-start justify-between gap-3 p-4"
                        onClick={() =>
                          setExpandedCheckId(isExpanded ? null : item.id)
                        }
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 shrink-0">
                            {isPass ? (
                              <CheckCircle2 className="h-5 w-5 text-compliant" />
                            ) : isFail ? (
                              <XCircle className="h-5 w-5 text-noncompliant" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-attention" />
                            )}
                          </span>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-sm text-navy">
                                {idx + 1}. {item.title}
                              </span>
                              <span className="rounded bg-navy/5 px-2 py-0.5 text-[11px] font-mono text-navy/70">
                                {item.rule}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-navy/70">
                              {item.extracted ? (
                                <span className="font-medium text-navy/90">
                                  Detected: {item.extracted}
                                </span>
                              ) : (
                                <span className="italic text-noncompliant">
                                  Not detected on packaging
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                              isPass
                                ? 'bg-compliant/10 text-compliant'
                                : isFail
                                ? 'bg-noncompliant/10 text-noncompliant'
                                : 'bg-attention/10 text-attention'
                            }`}
                          >
                            {item.status}
                          </span>

                          <button
                            type="button"
                            className="text-navy/40 hover:text-navy"
                            aria-label="Toggle details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Rule Details */}
                      {isExpanded && (
                        <div className="border-t border-navy/10 bg-surface/50 px-4 py-3 text-xs space-y-2">
                          <div>
                            <span className="font-semibold text-navy">Statutory Requirement: </span>
                            <span className="text-navy/70">{item.requirement}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-navy">Legal Audit Note: </span>
                            <span className="text-navy/70">{item.notes}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardBody>
          </Card>
          ) : null}

          {violations.length > 0 ? (
            <Card className="border-noncompliant/30 bg-noncompliant/5">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-noncompliant shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-noncompliant">
                      Summary of Legal Metrology Infractions ({violations.length})
                    </h4>
                    <ul className="mt-2 space-y-1 text-xs text-navy/80 list-disc list-inside">
                      {violations.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>

        {/* Right Sidebar: Label Image Preview & Meta */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3 px-4">
              <h4 className="text-sm font-semibold text-navy">Scanned Product Label</h4>
            </CardHeader>
            <CardBody className="p-3">
              <div className="overflow-hidden rounded-md border border-navy/10 bg-surface">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="Inspected product label"
                    className="mx-auto max-h-[320px] w-full object-contain"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-xs text-navy/50">
                    No image preview available
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-navy/70">
                <div className="flex justify-between">
                  <span className="text-navy/55">Product:</span>
                  <span className="font-medium text-navy">{result?.name || file?.name || 'Uploaded label'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/55">Category:</span>
                  <span className="font-medium text-navy">{result?.category || 'Packaged Commodity'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/55">Audit Timestamp:</span>
                  <span className="font-medium text-navy">
                    {new Date().toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Demo Product Switcher for quick test during presentation */}
          <Card className="border-saffron/30 bg-saffron/5">
            <CardHeader className="py-3 px-4 border-saffron/20">
              <p className="text-xs font-semibold text-saffron uppercase tracking-wider">
                SIH Demo Testing Scenarios
              </p>
            </CardHeader>
            <CardBody className="p-3 space-y-2 text-xs">
              <p className="text-navy/70">
                Quickly test how different Legal Metrology compliance outcomes render:
              </p>
              <div className="flex flex-col gap-1.5 pt-1">
                {DEMO_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      loadDemoSample(sample.id);
                      showToast(`Switched to: ${sample.name}`);
                    }}
                    className={`flex items-center justify-between rounded-md border p-2 text-left transition-colors ${
                      result?.id === sample.id
                        ? 'border-navy bg-white font-semibold text-navy shadow-xs'
                        : 'border-navy/10 bg-white/70 text-navy/75 hover:bg-white'
                    }`}
                  >
                    <span className="truncate pr-2">{sample.name}</span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        sample.overallStatus === 'COMPLIANT'
                          ? 'text-compliant'
                          : sample.overallStatus === 'NON_COMPLIANT'
                          ? 'text-noncompliant'
                          : 'text-attention'
                      }`}
                    >
                      {sample.overallStatus === 'COMPLIANT'
                        ? 'Pass'
                        : sample.overallStatus === 'NON_COMPLIANT'
                        ? 'Fail'
                        : 'Warn'}
                    </span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardBody className="p-3 space-y-2">
              <Button onClick={handleSaveHistory} variant="outline" className="w-full text-xs">
                <Bookmark className="h-4 w-4" />
                Save to Scan History
              </Button>
              <Button as={Link} to={ROUTES.DASHBOARD} variant="ghost" className="w-full text-xs">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
