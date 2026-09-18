/**
 * Phase 2C — Rule-based Indian Packaged Commodity Compliance Engine
 * Evaluates Phase 2B structured fields against the Legal Metrology (Packaged Commodities) Rules, 2011.
 *
 * Deterministic and evidence-based.
 * Distinguishes between verified compliance (PASS), established violation (FAIL),
 * conditional/ambiguous evidence (WARNING), and unverified OCR absence (NOT_VERIFIED).
 */

export const COMPLIANCE_CHECK_STATUS = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  WARNING: 'WARNING',
  NOT_VERIFIED: 'NOT_VERIFIED',
};

export const STATUTORY_SOURCES = {
  MANUFACTURER: {
    rule: 'Rule 6(1)(a)',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    description: 'Name and complete address of the manufacturer, packer, or importer.',
  },
  GENERIC_NAME: {
    rule: 'Rule 6(1)(b)',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    description: 'Common or generic name of the commodity contained in the package.',
  },
  NET_QUANTITY: {
    rule: 'Rule 6(1)(c) & Rule 12',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    description: 'Net quantity in standard metric units of weight, measure, or number conforming to Rule 12.',
  },
  MFG_DATE: {
    rule: 'Rule 6(1)(d)',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    description: 'Month and year of manufacture, packing, or import clearly declared.',
  },
  MRP: {
    rule: 'Rule 6(1)(e)',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    description: 'Maximum Retail Price (MRP) in Indian Rupees inclusive of all taxes.',
  },
  EXPIRY: {
    rule: 'Rule 6(1)(f)',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011 & FSSAI',
    description: 'Best before or expiry date for commodities that may become unfit for consumption.',
  },
  CONSUMER_CARE: {
    rule: 'Rule 6(1)(g)',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    description: 'Name, address, telephone number, and email address of person/officer for consumer grievances.',
  },
  COUNTRY_ORIGIN: {
    rule: 'Rule 6(1)(m)',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    description: 'Mandatory declaration of country of origin or manufacture for imported commodities.',
  },
};

/**
 * Evaluates the 8 mandatory declaration fields extracted in Phase 2B.
 *
 * @param {Object} extractedFields - Structured fields from fieldExtractionService.js
 * @param {Object} [options] - Optional context (rawOcrText, category, etc.)
 * @returns {Object} Structured compliance assessment result
 */
export function evaluateCompliance(extractedFields = {}, options = {}) {
  const fields = extractedFields || {};

  const checks = [
    evaluateManufacturer(fields.manufacturer),
    evaluateProductName(fields.productName),
    evaluateNetQuantity(fields.netQuantity),
    evaluateMfgDate(fields.mfgDate),
    evaluateMrp(fields.mrp),
    evaluateExpiry(fields.expiry),
    evaluateConsumerCare(fields.consumerCare),
    evaluateCountryOfOrigin(fields.countryOfOrigin),
  ];

  const scoreData = calculateComplianceScore(checks);
  const actionItems = generateActionItems(checks);

  const summary = generateSummary(scoreData, checks);

  return {
    overallStatus: scoreData.overallStatus,
    score: scoreData.score,
    scoreStatus: scoreData.scoreStatus,
    scoreExplanation: scoreData.scoreExplanation,
    checks,
    verifiedCount: scoreData.verifiedCount,
    failedCount: scoreData.failedCount,
    warningCount: scoreData.warningCount,
    unverifiedCount: scoreData.unverifiedCount,
    summary,
    actionItems,
    evaluatedAt: new Date().toISOString(),
    extractedFields,
    rawOcrText: options.rawOcrText || '',
  };
}

/**
 * 1. Manufacturer / Packer Details (Rule 6(1)(a))
 */
export function evaluateManufacturer(field) {
  const stat = STATUTORY_SOURCES.MANUFACTURER;
  if (!field || field.status === 'NOT_FOUND' || !field.value) {
    return {
      id: 'manufacturer',
      field: 'manufacturer',
      title: 'Manufacturer / Packer / Importer Details',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.NOT_VERIFIED,
      extracted: null,
      requirement: stat.description,
      message: 'Manufacturer or packer details were not detected in the visible label text.',
      notes: 'Ensure the panel displaying manufacturer, packer, or importer details is in clear view and focus.',
      severity: 'CRITICAL',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field?.evidence || null,
    };
  }

  const text = String(field.value).trim();
  const hasIdentity = /\b(ltd|pvt|limited|industries|foods|corporation|co\.|enterprises|company|llp|beverages|pharmaceuticals|products|india)\b/i.test(text);
  const hasAddressCue = /\b(plot|street|road|sector|estate|floor|lane|nagar|cross|phase|block|industrial|gidc|midc|delhi|mumbai|kolkata|chennai|bengaluru|bangalore|hyderabad|ahmedabad|pune|gurgaon|noida|pin|pincode|\d{6})\b/i.test(text) || /\d+[\w\s,/-]+/.test(text);

  if (hasIdentity && hasAddressCue) {
    return {
      id: 'manufacturer',
      field: 'manufacturer',
      title: 'Manufacturer / Packer / Importer Details',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.PASS,
      extracted: text,
      requirement: stat.description,
      message: 'Manufacturer identity and location address details are declared.',
      notes: 'Registered firm name and postal/location cues detected.',
      severity: 'INFO',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field.evidence || text,
    };
  }

  if (hasIdentity || text.length >= 8) {
    return {
      id: 'manufacturer',
      field: 'manufacturer',
      title: 'Manufacturer / Packer / Importer Details',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.WARNING,
      extracted: text,
      requirement: stat.description,
      message: 'Manufacturer name is present, but complete address could not be fully verified from OCR.',
      notes: 'Rule 6(1)(a) requires the complete registered postal address with PIN code.',
      severity: 'MODERATE',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field.evidence || text,
    };
  }

  return {
    id: 'manufacturer',
    field: 'manufacturer',
    title: 'Manufacturer / Packer / Importer Details',
    rule: stat.rule,
    status: COMPLIANCE_CHECK_STATUS.WARNING,
    extracted: text,
    requirement: stat.description,
    message: 'Manufacturer declaration detected, but text snippet is brief or ambiguous.',
    notes: 'Verify full address on physical packaging.',
    severity: 'MODERATE',
    source: `${stat.rule}, ${stat.title}`,
    evidence: field.evidence || text,
  };
}

/**
 * 2. Generic or Common Name (Rule 6(1)(b))
 */
export function evaluateProductName(field) {
  const stat = STATUTORY_SOURCES.GENERIC_NAME;
  if (!field || field.status === 'NOT_FOUND' || !field.value) {
    return {
      id: 'generic_name',
      field: 'productName',
      title: 'Generic or Common Name',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.NOT_VERIFIED,
      extracted: null,
      requirement: stat.description,
      message: 'Generic or common commodity name was not detected from label declarations.',
      notes: 'Rule 6(1)(b) requires the common name on the principal display panel.',
      severity: 'CRITICAL',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field?.evidence || null,
    };
  }

  const text = String(field.value).trim();
  if (text.length >= 3 && /[a-zA-Z]/.test(text)) {
    return {
      id: 'generic_name',
      field: 'productName',
      title: 'Generic or Common Name',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.PASS,
      extracted: text,
      requirement: stat.description,
      message: 'Generic or common commodity description is prominently declared.',
      notes: 'Identity of commodity is verified from label text.',
      severity: 'INFO',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field.evidence || text,
    };
  }

  return {
    id: 'generic_name',
    field: 'productName',
    title: 'Generic or Common Name',
    rule: stat.rule,
    status: COMPLIANCE_CHECK_STATUS.WARNING,
    extracted: text,
    requirement: stat.description,
    message: 'Commodity name was partially detected but text appears fragmented.',
    notes: 'Verify commodity description on principal display panel.',
    severity: 'MODERATE',
    source: `${stat.rule}, ${stat.title}`,
    evidence: field.evidence || text,
  };
}

/**
 * 3. Net Quantity & Standard Metric Units (Rule 6(1)(c) & Rule 12)
 */
export function evaluateNetQuantity(field) {
  const stat = STATUTORY_SOURCES.NET_QUANTITY;
  if (!field || field.status === 'NOT_FOUND' || !field.value) {
    return {
      id: 'net_quantity',
      field: 'netQuantity',
      title: 'Net Quantity & Units',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.NOT_VERIFIED,
      extracted: null,
      requirement: stat.description,
      message: 'Net quantity declaration was not detected in visible label text.',
      notes: 'Rule 6(1)(c) mandates net weight, volume, or count in standard metric units.',
      severity: 'CRITICAL',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field?.evidence || null,
    };
  }

  const text = String(field.value).trim();
  const metricRegex = /\b(\d+(?:[.,]\d+)?)\s*(kg|g|gm|gms|gram|grams|mg|ml|l|ltr|litre|liter|liters|litres|unit|units|n|pcs|pieces)\b/i;
  const nonMetricRegex = /\b(\d+(?:[.,]\d+)?)\s*(lbs?|pounds?|oz|ounces?|fluid\s*oz)\b/i;

  const metricMatch = text.match(metricRegex);
  const nonMetricMatch = text.match(nonMetricRegex);

  // If only non-metric units exist without metric declaration, that violates Rule 12
  if (nonMetricMatch && !metricMatch) {
    return {
      id: 'net_quantity',
      field: 'netQuantity',
      title: 'Net Quantity & Units',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.FAIL,
      extracted: text,
      requirement: stat.description,
      message: `Non-standard unit (${nonMetricMatch[0]}) declared without mandatory metric units.`,
      notes: 'Rule 12 requires declarations in standard metric units (kg, g, mg, L, ml). Non-metric units alone are prohibited.',
      severity: 'CRITICAL',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field.evidence || text,
    };
  }

  if (metricMatch) {
    const num = parseFloat(metricMatch[1].replace(',', '.'));
    if (num > 0) {
      return {
        id: 'net_quantity',
        field: 'netQuantity',
        title: 'Net Quantity & Units',
        rule: stat.rule,
        status: COMPLIANCE_CHECK_STATUS.PASS,
        extracted: text,
        requirement: stat.description,
        message: `Standard metric net quantity declared: ${text}.`,
        notes: 'Complies with Rule 12 metric unit specifications.',
        severity: 'INFO',
        source: `${stat.rule}, ${stat.title}`,
        evidence: field.evidence || text,
      };
    }
  }

  return {
    id: 'net_quantity',
    field: 'netQuantity',
    title: 'Net Quantity & Units',
    rule: stat.rule,
    status: COMPLIANCE_CHECK_STATUS.WARNING,
    extracted: text,
    requirement: stat.description,
    message: 'Quantity reference detected, but standard metric unit could not be confirmed.',
    notes: 'Confirm metric unit declaration on physical label.',
    severity: 'MODERATE',
    source: `${stat.rule}, ${stat.title}`,
    evidence: field.evidence || text,
  };
}

/**
 * 4. Month & Year of Manufacture / Packing (Rule 6(1)(d))
 */
export function evaluateMfgDate(field) {
  const stat = STATUTORY_SOURCES.MFG_DATE;
  if (!field || field.status === 'NOT_FOUND' || !field.value) {
    return {
      id: 'mfg_date',
      field: 'mfgDate',
      title: 'Month & Year of Manufacture / Packing',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.NOT_VERIFIED,
      extracted: null,
      requirement: stat.description,
      message: 'Manufacturing, packing, or import date was not detected from label text.',
      notes: 'Rule 6(1)(d) requires the month and year of manufacture or packaging.',
      severity: 'CRITICAL',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field?.evidence || null,
    };
  }

  const text = String(field.value).trim();
  const validDatePattern = /\b\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,./-]*(?:\d{1,2}[\s,./-]*)?(?:19|20)\d{2}\b|\b(?:19|20)\d{2}\b/i;

  if (validDatePattern.test(text)) {
    return {
      id: 'mfg_date',
      field: 'mfgDate',
      title: 'Month & Year of Manufacture / Packing',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.PASS,
      extracted: text,
      requirement: stat.description,
      message: `Manufacturing/packing date clearly stated: ${text}.`,
      notes: 'Satisfies Rule 6(1)(d) month and year declaration standard.',
      severity: 'INFO',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field.evidence || text,
    };
  }

  return {
    id: 'mfg_date',
    field: 'mfgDate',
    title: 'Month & Year of Manufacture / Packing',
    rule: stat.rule,
    status: COMPLIANCE_CHECK_STATUS.WARNING,
    extracted: text,
    requirement: stat.description,
    message: 'Manufacturing date indicator detected, but date format is ambiguous.',
    notes: 'Verify date stamping on container or seal.',
    severity: 'MODERATE',
    source: `${stat.rule}, ${stat.title}`,
    evidence: field.evidence || text,
  };
}

/**
 * 5. Maximum Retail Price (MRP) (Rule 6(1)(e))
 */
export function evaluateMrp(field) {
  const stat = STATUTORY_SOURCES.MRP;
  if (!field || field.status === 'NOT_FOUND' || !field.value) {
    return {
      id: 'mrp_usp',
      field: 'mrp',
      title: 'Maximum Retail Price (MRP)',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.NOT_VERIFIED,
      extracted: null,
      requirement: stat.description,
      message: 'Maximum Retail Price (MRP) declaration was not detected in visible label text.',
      notes: 'Rule 6(1)(e) requires retail sale price clearly stated in the format "MRP Rs. / ₹ ... incl. of all taxes".',
      severity: 'CRITICAL',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field?.evidence || null,
    };
  }

  const text = String(field.value).trim();
  const priceNumberMatch = text.match(/(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  const hasCurrencyOrLabel = /(?:m\.?r\.?p\.?|₹|rs\.?|inr|maximum retail price|retail sale price)/i.test(text) ||
    /(?:m\.?r\.?p\.?|₹|rs\.?)/i.test(field.evidence || '');

  if (priceNumberMatch) {
    const rawNum = priceNumberMatch[1].replace(/,/g, '');
    const num = parseFloat(rawNum);

    if (num > 0 && hasCurrencyOrLabel) {
      return {
        id: 'mrp_usp',
        field: 'mrp',
        title: 'Maximum Retail Price (MRP)',
        rule: stat.rule,
        status: COMPLIANCE_CHECK_STATUS.PASS,
        extracted: text,
        requirement: stat.description,
        message: `Maximum Retail Price declared: ${text}.`,
        notes: 'Price declaration contains valid currency and retail price designation.',
        severity: 'INFO',
        source: `${stat.rule}, ${stat.title}`,
        evidence: field.evidence || text,
      };
    }

    if (num > 0 && !hasCurrencyOrLabel) {
      return {
        id: 'mrp_usp',
        field: 'mrp',
        title: 'Maximum Retail Price (MRP)',
        rule: stat.rule,
        status: COMPLIANCE_CHECK_STATUS.WARNING,
        extracted: text,
        requirement: stat.description,
        message: `Numeric price detected (${text}), but explicit "MRP" label or currency symbol was not clearly recognized.`,
        notes: 'Rule 6(1)(e) requires explicit MRP designation and inclusive of all taxes indication.',
        severity: 'MODERATE',
        source: `${stat.rule}, ${stat.title}`,
        evidence: field.evidence || text,
      };
    }

    if (num <= 0) {
      return {
        id: 'mrp_usp',
        field: 'mrp',
        title: 'Maximum Retail Price (MRP)',
        rule: stat.rule,
        status: COMPLIANCE_CHECK_STATUS.FAIL,
        extracted: text,
        requirement: stat.description,
        message: 'Invalid non-positive retail price value detected.',
        notes: 'Commodity retail price must be greater than zero.',
        severity: 'CRITICAL',
        source: `${stat.rule}, ${stat.title}`,
        evidence: field.evidence || text,
      };
    }
  }

  return {
    id: 'mrp_usp',
    field: 'mrp',
    title: 'Maximum Retail Price (MRP)',
    rule: stat.rule,
    status: COMPLIANCE_CHECK_STATUS.WARNING,
    extracted: text,
    requirement: stat.description,
    message: 'Price text snippet detected but numeric price format could not be verified.',
    notes: 'Verify printed price on package display panel.',
    severity: 'MODERATE',
    source: `${stat.rule}, ${stat.title}`,
    evidence: field.evidence || text,
  };
}

/**
 * 6. Expiry / Best Before Date (Rule 6(1)(f) & FSSAI)
 */
export function evaluateExpiry(field) {
  const stat = STATUTORY_SOURCES.EXPIRY;
  if (!field || field.status === 'NOT_FOUND' || !field.value) {
    return {
      id: 'expiry',
      field: 'expiry',
      title: 'Expiry / Best Before Date',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.NOT_VERIFIED,
      extracted: null,
      requirement: stat.description,
      message: 'Best before or expiry date was not detected from the visible label.',
      notes: 'Mandatory for food, beverages, and perishable commodities under Rule 6(1)(f) and FSSAI. Non-perishable articles may be exempt.',
      severity: 'MODERATE',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field?.evidence || null,
    };
  }

  const text = String(field.value).trim();
  const hasExpiryCue = /\b(best before|use by|exp|expiry|expires|expiration)\b/i.test(text) ||
    /\b(best before|use by|exp|expiry)\b/i.test(field.evidence || '');
  const hasDateOrDuration = /\b\d+\s*(?:month|months|year|years|days)\b/i.test(text) ||
    /\b\d{1,2}[/-]\d{2,4}\b|\b(?:19|20)\d{2}\b/i.test(text);

  if (hasExpiryCue || hasDateOrDuration) {
    return {
      id: 'expiry',
      field: 'expiry',
      title: 'Expiry / Best Before Date',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.PASS,
      extracted: text,
      requirement: stat.description,
      message: `Shelf-life or expiration declaration verified: ${text}.`,
      notes: 'Satisfies shelf-life clarity requirements.',
      severity: 'INFO',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field.evidence || text,
    };
  }

  return {
    id: 'expiry',
    field: 'expiry',
    title: 'Expiry / Best Before Date',
    rule: stat.rule,
    status: COMPLIANCE_CHECK_STATUS.WARNING,
    extracted: text,
    requirement: stat.description,
    message: 'Potential expiration statement detected, but date or duration is ambiguous.',
    notes: 'Examine expiry / best before stamp on packaging.',
    severity: 'MODERATE',
    source: `${stat.rule}, ${stat.title}`,
    evidence: field.evidence || text,
  };
}

/**
 * 7. Consumer Care Helpline & Grievance (Rule 6(1)(g))
 */
export function evaluateConsumerCare(field) {
  const stat = STATUTORY_SOURCES.CONSUMER_CARE;
  if (!field || field.status === 'NOT_FOUND' || !field.value) {
    return {
      id: 'consumer_care',
      field: 'consumerCare',
      title: 'Consumer Care Helpline & Grievance',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.NOT_VERIFIED,
      extracted: null,
      requirement: stat.description,
      message: 'Consumer care grievance contact details were not detected on the label.',
      notes: 'Rule 6(1)(g) mandates contact details (telephone, email, or address) for consumer complaints.',
      severity: 'CRITICAL',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field?.evidence || null,
    };
  }

  const text = String(field.value).trim();
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
  const hasPhone = /\b(?:\+91[\s-]?)?[6-9]\d{9}\b|\b(?:1800|1860)[\s-]?\d{3,4}[\s-]?\d{3,4}\b|\b\d{3,4}[-\s]?\d{6,8}\b/.test(text);
  const hasCareCue = /\b(care|customer|consumer|helpline|toll[- ]free|grievance|feedback|contact)\b/i.test(text) ||
    /\b(care|customer|consumer|helpline|toll[- ]free|grievance|feedback|contact)\b/i.test(field.evidence || '');

  if ((hasEmail || hasPhone) && (hasCareCue || text.length >= 10)) {
    return {
      id: 'consumer_care',
      field: 'consumerCare',
      title: 'Consumer Care Helpline & Grievance',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.PASS,
      extracted: text,
      requirement: stat.description,
      message: `Consumer complaint channel verified: ${text}.`,
      notes: 'Contact channel (phone or email) satisfies Rule 6(1)(g) requirements.',
      severity: 'INFO',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field.evidence || text,
    };
  }

  if (hasCareCue) {
    return {
      id: 'consumer_care',
      field: 'consumerCare',
      title: 'Consumer Care Helpline & Grievance',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.WARNING,
      extracted: text,
      requirement: stat.description,
      message: 'Consumer care reference detected, but specific phone number or email could not be confirmed.',
      notes: 'Rule 6(1)(g) requires complete contact information including telephone or email.',
      severity: 'MODERATE',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field.evidence || text,
    };
  }

  return {
    id: 'consumer_care',
    field: 'consumerCare',
    title: 'Consumer Care Helpline & Grievance',
    rule: stat.rule,
    status: COMPLIANCE_CHECK_STATUS.WARNING,
    extracted: text,
    requirement: stat.description,
    message: 'Consumer contact line is partially legible and requires manual confirmation.',
    notes: 'Verify consumer grievance cell on physical packaging.',
    severity: 'MODERATE',
    source: `${stat.rule}, ${stat.title}`,
    evidence: field.evidence || text,
  };
}

/**
 * 8. Country of Origin (Rule 6(1)(m))
 */
export function evaluateCountryOfOrigin(field) {
  const stat = STATUTORY_SOURCES.COUNTRY_ORIGIN;
  if (!field || field.status === 'NOT_FOUND' || !field.value) {
    return {
      id: 'country_origin',
      field: 'countryOfOrigin',
      title: 'Country of Origin',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.NOT_VERIFIED,
      extracted: null,
      requirement: stat.description,
      message: 'Country of origin was not explicitly detected on the visible package label.',
      notes: 'Mandatory for imported commodities under Rule 6(1)(m); for domestic goods, the manufacturer address in India often indicates origin.',
      severity: 'INFO',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field?.evidence || null,
    };
  }

  const text = String(field.value).trim();
  const knownOrigin = /\b(india|china|thailand|vietnam|indonesia|malaysia|singapore|usa|uk|uae|germany|italy|france|japan|korea|taiwan|australia|made in|product of)\b/i.test(text);

  if (knownOrigin) {
    return {
      id: 'country_origin',
      field: 'countryOfOrigin',
      title: 'Country of Origin',
      rule: stat.rule,
      status: COMPLIANCE_CHECK_STATUS.PASS,
      extracted: text,
      requirement: stat.description,
      message: `Country of origin explicitly declared: ${text}.`,
      notes: 'Explicit country of origin declaration conforms to Rule 6(1)(m).',
      severity: 'INFO',
      source: `${stat.rule}, ${stat.title}`,
      evidence: field.evidence || text,
    };
  }

  return {
    id: 'country_origin',
    field: 'countryOfOrigin',
    title: 'Country of Origin',
    rule: stat.rule,
    status: COMPLIANCE_CHECK_STATUS.WARNING,
    extracted: text,
    requirement: stat.description,
    message: 'Country reference detected, but exact origin country requires visual verification.',
    notes: 'Confirm country of manufacture on packaging.',
    severity: 'INFO',
    source: `${stat.rule}, ${stat.title}`,
    evidence: field.evidence || text,
  };
}

/**
 * Calculates a transparent compliance index and overall status.
 *
 * Strictly avoids fake scores:
 * - If OCR produced insufficient evidence (< 2 verifiable declarations, or 0 PASS),
 *   score is null and scoreStatus is INSUFFICIENT_EVIDENCE.
 * - Score is calculated ONLY over verifiable fields. Unverified fields are excluded
 *   from denominator rather than falsely counted as pass or fail.
 */
export function calculateComplianceScore(checks = []) {
  const verifiedCount = checks.filter((c) => c.status === COMPLIANCE_CHECK_STATUS.PASS).length;
  const failedCount = checks.filter((c) => c.status === COMPLIANCE_CHECK_STATUS.FAIL).length;
  const warningCount = checks.filter((c) => c.status === COMPLIANCE_CHECK_STATUS.WARNING).length;
  const unverifiedCount = checks.filter((c) => c.status === COMPLIANCE_CHECK_STATUS.NOT_VERIFIED).length;

  const evaluableCount = verifiedCount + failedCount + warningCount;

  // If zero fields passed or fewer than 2 fields have verifiable evidence:
  if (evaluableCount < 2 || verifiedCount === 0) {
    const overallStatus = failedCount > 0 ? 'NON_COMPLIANT' : 'NOT_VERIFIED';
    return {
      overallStatus,
      score: null,
      scoreStatus: 'INSUFFICIENT_EVIDENCE',
      verifiedCount,
      failedCount,
      warningCount,
      unverifiedCount,
      scoreExplanation: 'Insufficient OCR evidence was detected from the uploaded image to generate a reliable compliance score. Review individual declaration checks below.',
    };
  }

  // Weight: PASS = 1.0, WARNING = 0.5, FAIL = 0.0
  const scoreNumerator = (verifiedCount * 1.0) + (warningCount * 0.5);
  const score = Math.round((scoreNumerator / evaluableCount) * 100);

  let overallStatus = 'COMPLIANT';
  if (failedCount > 0) {
    overallStatus = 'NON_COMPLIANT';
  } else if (warningCount > 0 || unverifiedCount > 4) {
    overallStatus = 'ATTENTION';
  }

  return {
    overallStatus,
    score,
    scoreStatus: 'CALCULATED',
    verifiedCount,
    failedCount,
    warningCount,
    unverifiedCount,
    scoreExplanation: `Compliance score of ${score}% calculated across ${evaluableCount} verifiable declarations (${verifiedCount} verified, ${warningCount} warnings, ${failedCount} violations). ${unverifiedCount} declarations could not be verified from the image.`,
  };
}

/**
 * Generates dynamic action items based on actual check findings.
 */
export function generateActionItems(checks = []) {
  const items = [];

  checks.forEach((check) => {
    if (check.status === COMPLIANCE_CHECK_STATUS.FAIL) {
      items.push({
        id: `action-fail-${check.id}`,
        type: 'VIOLATION',
        severity: 'CRITICAL',
        title: `Rectify Violation: ${check.title}`,
        description: check.message,
        rule: check.rule,
        recommendation: `Update packaging artwork to conform strictly with ${check.rule}.`,
      });
    } else if (check.status === COMPLIANCE_CHECK_STATUS.WARNING) {
      items.push({
        id: `action-warn-${check.id}`,
        type: 'WARNING',
        severity: 'MODERATE',
        title: `Review Declaration: ${check.title}`,
        description: check.message,
        rule: check.rule,
        recommendation: `Verify that ${check.title} is prominently printed and conforms to minimum height and contrast standards.`,
      });
    } else if (check.status === COMPLIANCE_CHECK_STATUS.NOT_VERIFIED && check.severity === 'CRITICAL') {
      items.push({
        id: `action-unverified-${check.id}`,
        type: 'UNVERIFIED',
        severity: 'INFO',
        title: `Verify on Physical Pack: ${check.title}`,
        description: `${check.title} was not detected in this image.`,
        rule: check.rule,
        recommendation: `Confirm this declaration is printed on another panel of the physical packaging. If missing, print before commercial retail distribution.`,
      });
    }
  });

  return items;
}

function generateSummary(scoreData, checks = []) {
  if (scoreData.scoreStatus === 'INSUFFICIENT_EVIDENCE') {
    return 'Insufficient text declarations were detected from the image to establish regulatory compliance. Ensure the packaging display panel is well-lit, fully visible, and in focus.';
  }

  if (scoreData.overallStatus === 'COMPLIANT') {
    return `All ${scoreData.verifiedCount} visible mandatory declarations conform to Legal Metrology (Packaged Commodities) Rules, 2011 standards.`;
  }

  if (scoreData.overallStatus === 'NON_COMPLIANT') {
    const failedNames = checks
      .filter((c) => c.status === COMPLIANCE_STATUS.FAIL)
      .map((c) => c.title)
      .join(', ');
    return `Critical violations detected (${failedNames || 'visible declarations'}) under Legal Metrology Rules, 2011. Remediation is required prior to commercial retail sale.`;
  }

  return `Inspection completed with ${scoreData.warningCount} declaration(s) requiring attention or manual verification under Legal Metrology (Packaged Commodities) Rules, 2011.`;
}
