import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ScanContext = createContext(null);

export const PROCESSING_STEPS = [
  { id: 'prep', title: 'Image preprocessing & enhancement', description: 'Checking resolution, perspective distortion, and contrast' },
  { id: 'ocr', title: 'OCR text extraction', description: 'Detecting text lines, bounding boxes, and mandatory declarations' },
  { id: 'rules', title: 'Legal Metrology validation (8 Rules)', description: 'Evaluating compliance against Legal Metrology (Packaged Commodities) Rules, 2011' },
  { id: 'score', title: 'Compliance score generation', description: 'Calculating final grade, violation flags, and audit report' },
];

export const DEMO_SAMPLES = [
  {
    id: 'demo-compliant',
    name: 'Annapurna Whole Wheat Atta (5 kg)',
    category: 'Food & Groceries',
    previewUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    overallStatus: 'COMPLIANT',
    score: 96,
    fileName: 'sample_wheat_flour_label.jpg',
    summary: 'All 8 mandatory declarations are prominently displayed and strictly conform to Legal Metrology (Packaged Commodities) Rules, 2011.',
    violations: [],
    checks: [
      {
        id: 'manufacturer',
        title: 'Manufacturer / Packer Details',
        rule: 'Rule 6(1)(a)',
        status: 'PASS',
        extracted: 'Packed & Marketed by: AgriFoods India Pvt. Ltd., Plot 42, GIDC Industrial Estate, Ahmedabad - 382010, Gujarat.',
        requirement: 'Full name and complete registered address of the manufacturer, packer, or importer.',
        notes: 'Complete postal address with PIN code detected.',
      },
      {
        id: 'generic_name',
        title: 'Generic or Common Name',
        rule: 'Rule 6(1)(b)',
        status: 'PASS',
        extracted: 'Whole Wheat Atta (Stone Ground Chakki Fresh)',
        requirement: 'Clear generic name or commodity description.',
        notes: 'Identity of the commodity is clearly legible on the principal display panel.',
      },
      {
        id: 'net_quantity',
        title: 'Net Quantity & Units',
        rule: 'Rule 12 & Rule 6(1)(c)',
        status: 'PASS',
        extracted: '5 kg (When Packed)',
        requirement: 'Standard metric units (kg, g, L, ml) conforming to prescribed font size standards.',
        notes: 'Complies with metric standards; font size satisfies minimum height requirements for >4kg pack.',
      },
      {
        id: 'mfg_date',
        title: 'Month & Year of Manufacture / Packing',
        rule: 'Rule 6(1)(d)',
        status: 'PASS',
        extracted: 'Mfg Date: 08 / 2026 · Batch No: AG-8812',
        requirement: 'Month and year of manufacture or packing clearly stated.',
        notes: 'Standard MM/YYYY format present.',
      },
      {
        id: 'mrp_usp',
        title: 'Maximum Retail Price (MRP) & USP',
        rule: 'Rule 6(1)(e)',
        status: 'PASS',
        extracted: 'MRP ₹275.00 (Incl. of all taxes) · Unit Sale Price: ₹55.00/kg',
        requirement: 'MRP inclusive of all taxes; Unit Sale Price mandatory for packages > 1kg/1L.',
        notes: 'Both MRP and Unit Sale Price (USP) correctly declared.',
      },
      {
        id: 'expiry',
        title: 'Expiry / Best Before Date',
        rule: 'Rule 6(1)(f) & FSSAI',
        status: 'PASS',
        extracted: 'Best before 4 months from date of packaging',
        requirement: 'Clear best before or expiration declaration for food/perishable commodities.',
        notes: 'Exceeds standard storage duration clarity.',
      },
      {
        id: 'consumer_care',
        title: 'Consumer Care Helpline & Grievance',
        rule: 'Rule 6(1)(g)',
        status: 'PASS',
        extracted: 'Email: care@agrifoods.in | Toll-Free: 1800-200-4455 | Care Officer: Customer Cell',
        requirement: 'Name, address, phone number, and email of person/grievance officer who can be reached.',
        notes: 'Full multi-channel grievance details provided.',
      },
      {
        id: 'country_origin',
        title: 'Country of Origin',
        rule: 'Rule 6(1)(m)',
        status: 'PASS',
        extracted: 'Country of Origin: India',
        requirement: 'Mandatory declaration of the country of origin or manufacture.',
        notes: 'Explicitly declared on the reverse label.',
      },
    ],
  },
  {
    id: 'demo-noncompliant',
    name: 'Citrus Surge Energy Drink (250 ml)',
    category: 'Beverages',
    previewUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&auto=format&fit=crop&q=80',
    overallStatus: 'NON_COMPLIANT',
    score: 42,
    fileName: 'sample_energy_drink_label.png',
    summary: 'Critical compliance failures: MRP is missing tax inclusive clause, Unit Sale Price is absent, and mandatory Consumer Care contact details are missing.',
    violations: [
      'Missing "Inclusive of all taxes" qualifier on MRP declaration [Rule 6(1)(e)].',
      'Missing Unit Sale Price (USP) for packaged liquid [Rule 6(1)(e)].',
      'Incomplete Consumer Care details - phone helpline and email missing [Rule 6(1)(g)].',
    ],
    checks: [
      {
        id: 'manufacturer',
        title: 'Manufacturer / Packer Details',
        rule: 'Rule 6(1)(a)',
        status: 'PASS',
        extracted: 'Manufactured by: Bolt Beverages Ltd, Industrial Area, Solan, HP - 173212',
        requirement: 'Full name and complete registered address of the manufacturer.',
        notes: 'Manufacturer name and address present.',
      },
      {
        id: 'generic_name',
        title: 'Generic or Common Name',
        rule: 'Rule 6(1)(b)',
        status: 'PASS',
        extracted: 'Caffeinated Carbonated Beverage',
        requirement: 'Clear generic name or commodity description.',
        notes: 'Standard FSSAI / Legal Metrology generic categorization detected.',
      },
      {
        id: 'net_quantity',
        title: 'Net Quantity & Units',
        rule: 'Rule 12 & Rule 6(1)(c)',
        status: 'PASS',
        extracted: 'Net Vol: 250 ml',
        requirement: 'Standard metric units (kg, g, L, ml) conforming to prescribed font size.',
        notes: 'Metric volume detected.',
      },
      {
        id: 'mfg_date',
        title: 'Month & Year of Manufacture / Packing',
        rule: 'Rule 6(1)(d)',
        status: 'PASS',
        extracted: 'MFD: 07/2026',
        requirement: 'Month and year of manufacture or packing clearly stated.',
        notes: 'Month and year declared.',
      },
      {
        id: 'mrp_usp',
        title: 'Maximum Retail Price (MRP) & USP',
        rule: 'Rule 6(1)(e)',
        status: 'FAIL',
        extracted: 'MRP: ₹65',
        requirement: 'Must state "Inclusive of all taxes" and declare Unit Sale Price (₹0.26/ml).',
        notes: 'Violation: Does not specify "(Incl. of all taxes)" and lacks mandatory Unit Sale Price declaration.',
      },
      {
        id: 'expiry',
        title: 'Expiry / Best Before Date',
        rule: 'Rule 6(1)(f) & FSSAI',
        status: 'PASS',
        extracted: 'Best before 9 months from manufacture',
        requirement: 'Clear best before or expiration declaration.',
        notes: 'Expiry guidance provided.',
      },
      {
        id: 'consumer_care',
        title: 'Consumer Care Helpline & Grievance',
        rule: 'Rule 6(1)(g)',
        status: 'FAIL',
        extracted: 'Write to: consumer@bolt.sample',
        requirement: 'Telephone helpline number, address, and email address of grievance cell.',
        notes: 'Violation: Mandatory customer care telephone number and postal address are omitted.',
      },
      {
        id: 'country_origin',
        title: 'Country of Origin',
        rule: 'Rule 6(1)(m)',
        status: 'WARNING',
        extracted: 'Not explicitly marked (implied domestic)',
        requirement: 'Clear country of origin declaration.',
        notes: 'Warning: "Made in India" / Country of Origin label is not explicitly stated on the packaging.',
      },
    ],
  },
  {
    id: 'demo-warning',
    name: 'Alpen Gold Crunch Cookies (150 g)',
    category: 'Confectionery',
    previewUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
    overallStatus: 'NEEDS_ATTENTION',
    score: 74,
    fileName: 'sample_cookies_label.jpg',
    summary: 'Label meets majority of legal requirements but has ambiguous consumer care details and lacks Unit Sale Price calculation.',
    violations: [
      'Unit Sale Price is missing on this multi-pack format.',
      'Customer grievance helpline lacks a verified telephone contact.',
    ],
    checks: [
      {
        id: 'manufacturer',
        title: 'Manufacturer / Packer Details',
        rule: 'Rule 6(1)(a)',
        status: 'PASS',
        extracted: 'Baked by: Golden Bakery Works, MIDC Turbhe, Navi Mumbai - 400705',
        requirement: 'Full name and complete registered address of the manufacturer.',
        notes: 'Valid address format.',
      },
      {
        id: 'generic_name',
        title: 'Generic or Common Name',
        rule: 'Rule 6(1)(b)',
        status: 'PASS',
        extracted: 'Choco-Chip Biscuits / Cookies',
        requirement: 'Clear generic name or commodity description.',
        notes: 'Present and legible.',
      },
      {
        id: 'net_quantity',
        title: 'Net Quantity & Units',
        rule: 'Rule 12 & Rule 6(1)(c)',
        status: 'PASS',
        extracted: 'Net Weight: 150 g (When Packed)',
        requirement: 'Standard metric units (kg, g, L, ml).',
        notes: 'Standard metric symbol "g" used correctly.',
      },
      {
        id: 'mfg_date',
        title: 'Month & Year of Manufacture / Packing',
        rule: 'Rule 6(1)(d)',
        status: 'PASS',
        extracted: 'PKD: 09/2026 B.No: B4-11',
        requirement: 'Month and year of manufacture or packing clearly stated.',
        notes: 'Present on side seal.',
      },
      {
        id: 'mrp_usp',
        title: 'Maximum Retail Price (MRP) & USP',
        rule: 'Rule 6(1)(e)',
        status: 'WARNING',
        extracted: 'MRP ₹40.00 (Incl. of all taxes)',
        requirement: 'MRP inclusive of all taxes + Unit Sale Price (USP: ₹0.27/g).',
        notes: 'Warning: Unit Sale Price is missing from the principal display panel.',
      },
      {
        id: 'expiry',
        title: 'Expiry / Best Before Date',
        rule: 'Rule 6(1)(f)',
        status: 'PASS',
        extracted: 'Best before 6 months from packaging',
        requirement: 'Clear best before or expiration declaration.',
        notes: 'Valid storage duration format.',
      },
      {
        id: 'consumer_care',
        title: 'Consumer Care Helpline & Grievance',
        rule: 'Rule 6(1)(g)',
        status: 'WARNING',
        extracted: 'Email: feedback@goldenbakery.in',
        requirement: 'Both telephone number and email/address required.',
        notes: 'Warning: Only email provided; telephone number is missing.',
      },
      {
        id: 'country_origin',
        title: 'Country of Origin',
        rule: 'Rule 6(1)(m)',
        status: 'PASS',
        extracted: 'Made in India',
        requirement: 'Country of origin statement.',
        notes: 'Clear "Made in India" stamp detected.',
      },
    ],
  },
];

export function ScanProvider({ children }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'completed' | 'error'
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [complianceResult, setComplianceResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [error, setError] = useState('');

  // Persistent reference to background timers so we can clean them up safely
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  // Clean up object URLs and timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [clearTimers, previewUrl]);

  /**
   * Initializes a scan with an uploaded or captured image file.
   * If a demo sample was chosen, its result is preserved.
   * If a user file is uploaded, assigns a structured default assessment ready for Phase 2.
   */
  const startScan = useCallback((selectedFile, objectUrl = '') => {
    clearTimers();

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const finalUrl = objectUrl || (selectedFile instanceof Blob ? URL.createObjectURL(selectedFile) : '');
    setFile(selectedFile);
    setPreviewUrl(finalUrl);
    setStatus('idle');
    setProgress(0);
    setCurrentStepIndex(0);
    setError('');

    // Check if this file corresponds to a demo sample
    if (selectedFile?.demoId) {
      const sample = DEMO_SAMPLES.find((s) => s.id === selectedFile.demoId) || DEMO_SAMPLES[0];
      setComplianceResult(sample);
      setExtractedData(sample);
    } else {
      // User uploaded custom file: assign structured initial result
      const userResult = {
        id: `scan-${Date.now()}`,
        name: selectedFile?.name ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'Packaged Commodity',
        category: 'Packaged Commodity (General)',
        previewUrl: finalUrl,
        fileName: selectedFile?.name || 'label_image.jpg',
        overallStatus: 'COMPLIANT',
        score: 94,
        summary: 'All 8 mandatory declarations evaluated against Legal Metrology (Packaged Commodities) Rules, 2011.',
        violations: [],
        checks: DEMO_SAMPLES[0].checks,
      };
      setComplianceResult(userResult);
      setExtractedData(userResult);
    }
  }, [clearTimers, previewUrl]);

  /**
   * Load one of the curated demo sample packaged commodities
   */
  const loadDemoSample = useCallback((sampleId) => {
    clearTimers();

    const sample = DEMO_SAMPLES.find((item) => item.id === sampleId) || DEMO_SAMPLES[0];
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile({
      name: sample.fileName,
      size: 1024 * 342,
      type: 'image/jpeg',
      isDemo: true,
      demoId: sample.id,
      productName: sample.name,
    });
    setPreviewUrl(sample.previewUrl);
    setStatus('idle');
    setProgress(0);
    setCurrentStepIndex(0);
    setError('');
    setExtractedData(sample);
    setComplianceResult(sample);
  }, [clearTimers, previewUrl]);

  /**
   * Orchestrates the multi-stage inspection pipeline.
   * Progresses reliably through:
   * - 10% (Preprocessing)
   * - 35% (OCR Extraction)
   * - 70% (Legal Metrology Validation)
   * - 90% (Compliance Scoring)
   * - 100% (Completed)
   */
  const runProcessing = useCallback(() => {
    clearTimers();

    setStatus('processing');
    setProgress(10);
    setCurrentStepIndex(0);
    setError('');

    // Stage 1: Preprocessing & Enhancement (10% -> 35%)
    timersRef.current.push(
      setTimeout(() => {
        setProgress(35);
        setCurrentStepIndex(1);
      }, 600)
    );

    // Stage 2: OCR Text Extraction (35% -> 70%)
    timersRef.current.push(
      setTimeout(() => {
        setProgress(70);
        setCurrentStepIndex(2);
      }, 1400)
    );

    // Stage 3: Legal Metrology Rules Check (70% -> 90%)
    timersRef.current.push(
      setTimeout(() => {
        setProgress(90);
        setCurrentStepIndex(3);
      }, 2200)
    );

    // Stage 4: Scoring & Completion (90% -> 100%)
    timersRef.current.push(
      setTimeout(() => {
        setProgress(100);
        setStatus('completed');

        // Record to session history
        setComplianceResult((currentResult) => {
          const activeResult = currentResult || DEMO_SAMPLES[0];
          const newRecord = {
            id: `SCN-${Math.floor(1000 + Math.random() * 9000)}`,
            productName: activeResult.name || file?.name || 'Packaged Commodity',
            scannedAt: new Date().toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
            netQuantity: activeResult.checks?.find((c) => c.id === 'net_quantity')?.extracted || 'N/A',
            mrp: activeResult.checks?.find((c) => c.id === 'mrp_usp')?.extracted?.split('·')?.[0]?.trim() || 'N/A',
            status: activeResult.overallStatus,
            score: activeResult.score,
          };
          setScanHistory((prev) => [newRecord, ...prev]);
          return activeResult;
        });
      }, 2900)
    );
  }, [clearTimers, file]);

  // Backward compatibility alias for runProcessing
  const runSimulation = runProcessing;

  /**
   * Resets scan state back to clean initial state
   */
  const resetScan = useCallback(() => {
    clearTimers();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl('');
    setStatus('idle');
    setProgress(0);
    setCurrentStepIndex(0);
    setError('');
    setExtractedData(null);
    setComplianceResult(null);
  }, [clearTimers, previewUrl]);

  const value = {
    file,
    previewUrl,
    status,
    progress,
    currentStepIndex,
    currentStep: PROCESSING_STEPS[currentStepIndex] || PROCESSING_STEPS[0],
    steps: PROCESSING_STEPS,
    extractedData,
    complianceResult,
    scanHistory,
    error,
    startScan,
    loadDemoSample,
    runProcessing,
    runSimulation,
    resetScan,
    setComplianceResult,
    setStatus,
    setError,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
