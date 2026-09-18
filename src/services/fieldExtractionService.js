/**
 * Phase 2B — Structured field extraction from raw OCR text.
 * Deterministic and evidence-based. Does not score legal compliance.
 */

export const EXTRACT_STATUS = {
  FOUND: 'FOUND',
  NOT_FOUND: 'NOT_FOUND',
  UNCERTAIN: 'UNCERTAIN',
};

export const FIELD_DEFINITIONS = [
  { key: 'manufacturer', label: 'Manufacturer details' },
  { key: 'productName', label: 'Generic / Product name' },
  { key: 'netQuantity', label: 'Net quantity' },
  { key: 'mfgDate', label: 'Manufacturing / Packing date' },
  { key: 'mrp', label: 'MRP / Retail sale price' },
  { key: 'expiry', label: 'Expiry / Best Before' },
  { key: 'consumerCare', label: 'Consumer care / Contact details' },
  { key: 'countryOfOrigin', label: 'Country of origin' },
];

const DEMO_CHECK_TO_FIELD = {
  manufacturer: 'manufacturer',
  generic_name: 'productName',
  net_quantity: 'netQuantity',
  mfg_date: 'mfgDate',
  mrp_usp: 'mrp',
  expiry: 'expiry',
  consumer_care: 'consumerCare',
  country_origin: 'countryOfOrigin',
};

const MANUFACTURER_LABELS = [
  'manufactured and marketed by',
  'manufactured & marketed by',
  'packed and marketed by',
  'packed & marketed by',
  'manufactured by',
  'marketed by',
  'packed by',
  'packer',
  'manufacturer',
  'mfd by',
  'mfg by',
];

const PRODUCT_LABELS = [
  'name of product',
  'generic name',
  'product name',
  'item name',
  'commodity',
];

const QUANTITY_LABELS = [
  'net quantity',
  'net qty',
  'net weight',
  'net wt',
  'net vol',
  'net volume',
  'quantity',
  'volume',
];

const MRP_LABELS = [
  'maximum retail price',
  'max retail price',
  'retail sale price',
  'm.r.p',
  'mrp',
];

const MFG_DATE_LABELS = [
  'manufacturing date',
  'date of manufacture',
  'date of packing',
  'packing date',
  'packed on',
  'mfg date',
  'mfd date',
  'pkd date',
  'pkg date',
  'manufactured',
  'packed',
  'mfg',
  'mfd',
  'pkd',
  'pkg',
];

const EXPIRY_LABELS = [
  'expiry date',
  'expiration date',
  'best before',
  'use by',
  'exp date',
  'expiry',
  'expires',
  'exp',
];

const CARE_LABELS = [
  'consumer care',
  'customer care',
  'customer service',
  'toll free',
  'helpline',
  'careline',
  'grievance',
  'contact us',
  'contact',
  'email',
  'phone',
  'tel',
];

const COUNTRY_LABELS = [
  'country of manufacture',
  'country of origin',
  'origin',
];

const ALL_STOP_LABELS = uniqueByLength([
  ...MANUFACTURER_LABELS,
  ...PRODUCT_LABELS,
  ...QUANTITY_LABELS,
  ...MRP_LABELS,
  ...MFG_DATE_LABELS,
  ...EXPIRY_LABELS,
  ...CARE_LABELS,
  ...COUNTRY_LABELS,
  'ingredients',
  'nutrition',
  'batch',
  'lot no',
  'b.no',
  'fssai',
  'license',
  'lic no',
]);

const COUNTRY_NAMES = [
  'india',
  'china',
  'thailand',
  'vietnam',
  'indonesia',
  'malaysia',
  'singapore',
  'bangladesh',
  'sri lanka',
  'nepal',
  'united states',
  'usa',
  'u.s.a',
  'united kingdom',
  'uk',
  'u.k',
  'uae',
  'u.a.e',
  'germany',
  'italy',
  'france',
  'spain',
  'japan',
  'south korea',
  'korea',
  'taiwan',
  'brazil',
  'mexico',
  'turkey',
  'australia',
  'canada',
  'netherlands',
  'switzerland',
  'belgium',
  'poland',
  'philippines',
];

function uniqueByLength(labels) {
  return [...new Set(labels)].sort((a, b) => b.length - a.length);
}

function emptyField() {
  return { value: null, status: EXTRACT_STATUS.NOT_FOUND, evidence: null };
}

function field(value, status, evidence) {
  const trimmed = typeof value === 'string' ? cleanValue(value) : value;
  if (!trimmed) {
    return {
      value: null,
      status: status === EXTRACT_STATUS.FOUND ? EXTRACT_STATUS.UNCERTAIN : status,
      evidence: evidence || null,
    };
  }
  return { value: trimmed, status, evidence: evidence ? String(evidence).trim() : trimmed };
}

export function emptyExtraction() {
  return Object.fromEntries(FIELD_DEFINITIONS.map((item) => [item.key, emptyField()]));
}

export function extractedFieldsFromDemoChecks(checks = []) {
  const result = emptyExtraction();
  checks.forEach((check) => {
    const key = DEMO_CHECK_TO_FIELD[check.id];
    if (!key) return;
    const text = typeof check.extracted === 'string' ? check.extracted.trim() : '';
    if (!text) {
      result[key] = emptyField();
      return;
    }
    const impliedMissing = /not explicitly|implied|not detected|not found/i.test(text);
    result[key] = impliedMissing
      ? field(text, EXTRACT_STATUS.UNCERTAIN, text)
      : field(text, EXTRACT_STATUS.FOUND, text);
  });
  return result;
}

export function extractFields(rawOcrText) {
  const source = typeof rawOcrText === 'string' ? rawOcrText : '';
  const text = normalizeOcr(source);
  const result = emptyExtraction();

  if (!text) return result;

  result.manufacturer = extractManufacturer(text);
  result.productName = extractProductName(text);
  result.netQuantity = extractNetQuantity(text);
  result.mfgDate = extractMfgDate(text);
  result.mrp = extractMrp(text);
  result.expiry = extractExpiry(text);
  result.consumerCare = extractConsumerCare(text);
  result.countryOfOrigin = extractCountry(text);

  return result;
}

function normalizeOcr(raw) {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[|]+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}

function cleanValue(value) {
  return value
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, ', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/^[:.\-–—\s]+/, '')
    .replace(/[:.\-–—\s]+$/, '')
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function labelPattern(label) {
  return label
    .split(/\s+/)
    .map((token) => {
      if (token === '&') return '(?:&|and)';
      return escapeRegExp(token).replace(/\\\./g, '\\.?');
    })
    .join('\\s+');
}

function stopPattern(excludeLabels = []) {
  const exclude = new Set(excludeLabels.map((item) => item.toLowerCase()));
  const labels = ALL_STOP_LABELS.filter((item) => !exclude.has(item));
  return labels.map((item) => labelPattern(item)).join('|');
}

function findLabeledBlocks(text, labels, options = {}) {
  const { maxChars = 180, maxLines = 4, excludeStops = labels } = options;
  const blocks = [];

  labels.forEach((label) => {
    const pattern = new RegExp(
      `(?:^|[\\n;,])\\s*(${labelPattern(label)})\\s*[:.\\-–—]?\\s*`,
      'gi',
    );
    let match = pattern.exec(text);
    while (match) {
      const valueStart = match.index + match[0].length;
      const rest = text.slice(valueStart);
      const stop = new RegExp(`(?:\\n+|\\s{2,}|[;])\\s*(?:${stopPattern(excludeStops)})\\b`, 'i');
      const stopMatch = rest.search(stop);
      let chunk = stopMatch === -1 ? rest : rest.slice(0, stopMatch);
      chunk = chunk
        .split('\n')
        .slice(0, maxLines)
        .join('\n')
        .slice(0, maxChars);
      const value = cleanValue(chunk);
      const evidence = text.slice(match.index, valueStart + chunk.length).trim().slice(0, 280);
      if (value || match[1]) {
        blocks.push({
          label: match[1],
          value,
          evidence,
          index: match.index,
          labelLength: match[1].length,
        });
      }
      const nextIndex = match.index + Math.max(match[0].length, 1);
      if (nextIndex <= pattern.lastIndex && pattern.lastIndex === match.index) {
        pattern.lastIndex += 1;
      } else if (pattern.lastIndex < nextIndex) {
        pattern.lastIndex = nextIndex;
      }
      match = pattern.exec(text);
      if (blocks.length > 20) break;
    }
  });

  return dedupeBlocks(blocks);
}

function dedupeBlocks(blocks) {
  const sorted = [...blocks].sort((a, b) => a.index - b.index || b.labelLength - a.labelLength);
  const kept = [];
  sorted.forEach((block) => {
    const overlaps = kept.some(
      (existing) => Math.abs(existing.index - block.index) < 8 && existing.labelLength >= block.labelLength,
    );
    if (!overlaps) kept.push(block);
  });
  return kept;
}

function looksThin(value) {
  return !value || value.replace(/[^a-z0-9]/gi, '').length < 3;
}

function looksLikeDate(value) {
  if (!value) return false;
  return (
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i.test(value) ||
    /\b\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4}\b/.test(value) ||
    /\b\d{1,2}[\/\-.\s]\d{4}\b/.test(value) ||
    /\b(?:19|20)\d{2}\b/.test(value) ||
    /\b\d+\s*(?:month|months|year|years|days)\b/i.test(value)
  );
}

function looksLikeQuantity(value) {
  return /\d+(?:[.,]\d+)?\s*(?:kg|g|gm|gms|gram|grams|ml|l|ltr|litre|liter|liters|oz)\b/i.test(
    value,
  );
}

function looksLikePrice(value) {
  return /(?:₹|rs\.?|inr|mrp)\s*[\d,]+(?:\.\d{1,2})?|\b[\d,]+\.\d{2}\b/i.test(value);
}

function extractManufacturer(text) {
  const blocks = findLabeledBlocks(text, MANUFACTURER_LABELS, {
    maxChars: 260,
    maxLines: 5,
    excludeStops: MANUFACTURER_LABELS,
  }).filter((block) => {
    const label = block.label.toLowerCase();
    if (/^(manufactured|packed)$/i.test(label) && looksLikeDate(block.value) && !/[a-z]{4,}/i.test(block.value.replace(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/gi, ''))) {
      return false;
    }
    return true;
  });

  if (!blocks.length) return emptyField();

  const usable = blocks.filter((block) => !looksThin(block.value) && !looksLikeDate(block.value));
  if (!usable.length) {
    const first = blocks[0];
    return field(first.value, EXTRACT_STATUS.UNCERTAIN, first.evidence);
  }

  const merged = usable.map((block) => block.value).join(' | ');
  return field(merged, EXTRACT_STATUS.FOUND, usable.map((block) => block.evidence).join(' | '));
}

function extractProductName(text) {
  const blocks = findLabeledBlocks(text, PRODUCT_LABELS, { maxChars: 120, maxLines: 2 });
  if (!blocks.length) return emptyField();
  const best = blocks.find((block) => !looksThin(block.value)) || blocks[0];
  if (looksThin(best.value)) {
    return field(best.value, EXTRACT_STATUS.UNCERTAIN, best.evidence);
  }
  return field(best.value, EXTRACT_STATUS.FOUND, best.evidence);
}

function extractNetQuantity(text) {
  const blocks = findLabeledBlocks(text, QUANTITY_LABELS, { maxChars: 80, maxLines: 2 });
  const labeled = blocks.find((block) => looksLikeQuantity(block.value));
  if (labeled) {
    const qtyMatch = labeled.value.match(
      /\d+(?:[.,]\d+)?\s*(?:kg|g|gm|gms|gram|grams|ml|l|ltr|litre|liter|liters)(?:\s*\([^)]{0,40}\))?/i,
    );
    const value = qtyMatch ? qtyMatch[0] : labeled.value;
    return field(value, EXTRACT_STATUS.FOUND, labeled.evidence);
  }
  if (blocks.length) {
    return field(blocks[0].value, EXTRACT_STATUS.UNCERTAIN, blocks[0].evidence);
  }

  const nearby = text.match(
    /(?:net(?:\s+(?:quantity|qty|weight|wt|vol(?:ume)?))?|when packed)[^\n]{0,40}?(\d+(?:[.,]\d+)?\s*(?:kg|g|gm|ml|l|ltr))\b/i,
  );
  if (nearby) {
    return field(nearby[1], EXTRACT_STATUS.FOUND, nearby[0]);
  }

  return emptyField();
}

function extractMrp(text) {
  const blocks = findLabeledBlocks(text, MRP_LABELS, { maxChars: 100, maxLines: 2 });
  const labeled = blocks.find((block) => looksLikePrice(block.value) || /\d/.test(block.value));
  if (labeled) {
    const status = looksLikePrice(labeled.value) || /\d{1,7}/.test(labeled.value)
      ? EXTRACT_STATUS.FOUND
      : EXTRACT_STATUS.UNCERTAIN;
    return field(labeled.value, status, labeled.evidence);
  }

  const rupee = text.match(
    /(?:mrp|maximum retail price|retail sale price)[^\n]{0,30}((?:₹|rs\.?|inr)?\s*[\d,]+(?:\.\d{1,2})?)/i,
  );
  if (rupee) {
    return field(rupee[0], EXTRACT_STATUS.FOUND, rupee[0]);
  }

  return emptyField();
}

function extractMfgDate(text) {
  const blocks = findLabeledBlocks(text, MFG_DATE_LABELS, {
    maxChars: 80,
    maxLines: 2,
    excludeStops: MFG_DATE_LABELS,
  }).filter((block) => {
    const label = block.label.toLowerCase();
    if (/\bby\b/.test(label)) return false;
    if (/^(manufactured|packed)$/i.test(label) && !looksLikeDate(block.value)) return false;
    return true;
  });

  const dated = blocks.find((block) => looksLikeDate(block.value));
  if (dated) {
    return field(dated.value, EXTRACT_STATUS.FOUND, dated.evidence);
  }
  if (blocks.length) {
    return field(blocks[0].value, EXTRACT_STATUS.UNCERTAIN, blocks[0].evidence);
  }
  return emptyField();
}

function extractExpiry(text) {
  const blocks = findLabeledBlocks(text, EXPIRY_LABELS, { maxChars: 90, maxLines: 2 });
  const dated = blocks.find(
    (block) => looksLikeDate(block.value) || /best before|use by/i.test(block.evidence),
  );
  if (dated) {
    return field(dated.value || dated.evidence, EXTRACT_STATUS.FOUND, dated.evidence);
  }
  if (blocks.length) {
    return field(blocks[0].value, EXTRACT_STATUS.UNCERTAIN, blocks[0].evidence);
  }
  return emptyField();
}

function extractConsumerCare(text) {
  const emails = [...text.matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)].map(
    (match) => match[0],
  );
  const phones = [
    ...text.matchAll(/\b(?:\+91[\s-]?)?[6-9]\d(?:[\s-]?\d){8}\b/g),
    ...text.matchAll(/\b(?:1800|1860)[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g),
  ].map((match) => match[0]);

  const blocks = findLabeledBlocks(text, CARE_LABELS, { maxChars: 140, maxLines: 3 });
  const labeledValues = blocks.map((block) => block.value).filter(Boolean);

  const parts = [...new Set([...labeledValues, ...emails, ...phones])]
    .map(cleanValue)
    .filter(Boolean);

  if (!parts.length && !blocks.length) return emptyField();

  const evidence = [...blocks.map((block) => block.evidence), ...emails, ...phones]
    .filter(Boolean)
    .join(' | ')
    .slice(0, 300);

  const hasConcrete = emails.length > 0 || phones.length > 0;
  const labeledButThin = blocks.length > 0 && !hasConcrete && parts.every(looksThin);

  if (hasConcrete || (parts.length && !labeledButThin)) {
    const status = hasConcrete || parts.some((part) => part.length >= 6)
      ? EXTRACT_STATUS.FOUND
      : EXTRACT_STATUS.UNCERTAIN;
    return field(parts.join(' | '), status, evidence);
  }

  return field(blocks[0]?.value, EXTRACT_STATUS.UNCERTAIN, evidence || blocks[0]?.evidence);
}

function extractCountry(text) {
  const blocks = findLabeledBlocks(text, COUNTRY_LABELS, { maxChars: 60, maxLines: 2 });
  const labeledCountry = blocks
    .map((block) => ({ block, country: matchKnownCountry(block.value) }))
    .find((item) => item.country);

  if (labeledCountry) {
    return field(labeledCountry.block.value, EXTRACT_STATUS.FOUND, labeledCountry.block.evidence);
  }
  if (blocks.length && blocks[0].value) {
    return field(blocks[0].value, EXTRACT_STATUS.UNCERTAIN, blocks[0].evidence);
  }

  const madeIn = text.match(/\bmade\s+(?:in|ln)\s+([A-Za-z][A-Za-z .]{1,30})/i);
  if (madeIn) {
    const country = matchKnownCountry(madeIn[1]) || cleanValue(madeIn[1]);
    const known = Boolean(matchKnownCountry(madeIn[1]));
    return field(
      `Made in ${country}`,
      known ? EXTRACT_STATUS.FOUND : EXTRACT_STATUS.UNCERTAIN,
      madeIn[0],
    );
  }

  const productOf = text.match(/\bproduct of\s+([A-Za-z][A-Za-z .]{1,30})/i);
  if (productOf) {
    const known = Boolean(matchKnownCountry(productOf[1]));
    return field(
      productOf[0],
      known ? EXTRACT_STATUS.FOUND : EXTRACT_STATUS.UNCERTAIN,
      productOf[0],
    );
  }

  return emptyField();
}

function matchKnownCountry(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  return COUNTRY_NAMES.find((name) => lower.includes(name)) || null;
}
