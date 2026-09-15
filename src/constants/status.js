export const COMPLIANCE_STATUS = {
  COMPLIANT: 'COMPLIANT',
  NEEDS_ATTENTION: 'NEEDS_ATTENTION',
  NON_COMPLIANT: 'NON_COMPLIANT',
};

export const STATUS_META = {
  COMPLIANT: {
    label: 'Compliant',
    color: 'green',
    className: 'bg-compliant/10 text-compliant border-compliant/30',
  },
  NEEDS_ATTENTION: {
    label: 'Needs Attention',
    color: 'yellow',
    className: 'bg-attention/10 text-attention border-attention/30',
  },
  NON_COMPLIANT: {
    label: 'Non-Compliant',
    color: 'red',
    className: 'bg-noncompliant/10 text-noncompliant border-noncompliant/30',
  },
};
