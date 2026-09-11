export const VIA_PROVIDER_SESSION_PREFLIGHT_TEST_CASES = [
  { name: "matching ready EUR order", expectedEligible: true },
  { name: "matching ready USD order", expectedEligible: true },
  { name: "matching ready bitcoin order", expectedEligible: true },
  { name: "DESO remains blocked", expectedEligible: false },
  { name: "amount mismatch is blocked", expectedEligible: false },
  { name: "currency mismatch is blocked", expectedEligible: false },
  { name: "method mismatch is blocked", expectedEligible: false },
  { name: "non-actionable method is blocked", expectedEligible: false },
  { name: "malformed request is blocked", expectedEligible: false },
] as const
