import { COMPLIANCE_STATUS } from '../constants/status';

export const dashboardStats = {
  totalScans: 128,
  compliant: 86,
  needsAttention: 27,
  nonCompliant: 15,
  complianceRate: 67,
};

export const recentScans = [
  {
    id: 'SCN-1028',
    productName: 'Annapurna Atta 5 kg',
    scannedAt: '15 Sep 2026, 6:12 PM',
    netQuantity: '5 kg',
    mrp: '₹278.00',
    status: COMPLIANCE_STATUS.COMPLIANT,
    score: 96,
  },
  {
    id: 'SCN-1027',
    productName: 'Sunrise Mustard Oil 1 L',
    scannedAt: '15 Sep 2026, 4:48 PM',
    netQuantity: '1 L',
    mrp: '₹168.00',
    status: COMPLIANCE_STATUS.NEEDS_ATTENTION,
    score: 74,
  },
  {
    id: 'SCN-1026',
    productName: 'Daily Fresh Milk 500 ml',
    scannedAt: '14 Sep 2026, 11:20 AM',
    netQuantity: '500 ml',
    mrp: '₹32.00',
    status: COMPLIANCE_STATUS.NON_COMPLIANT,
    score: 41,
  },
  {
    id: 'SCN-1025',
    productName: 'Hilltop Green Tea 100 g',
    scannedAt: '14 Sep 2026, 9:05 AM',
    netQuantity: '100 g',
    mrp: '₹210.00',
    status: COMPLIANCE_STATUS.COMPLIANT,
    score: 91,
  },
];
