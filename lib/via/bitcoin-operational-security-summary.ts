export const VIA_BITCOIN_OPERATIONAL_SECURITY_SUMMARY = {
  dependencies:
    "Bitcoin requires a configured public mainnet receiver, trusted rate provider, trusted transaction observer and passing integration tests.",
  stable:
    "All dependencies must remain continuously ready for a configured stability window before Bitcoin becomes publicly available.",
  public:
    "Public checkout receives only available/unavailable state; internal dependency diagnostics remain owner/admin-only.",
  fresh:
    "Immediately before each Bitcoin payment request, VIA re-evaluates full-gate + stable readiness server-side.",
  noClientAuthority:
    "Browser state, old readiness snapshots and previously rendered buttons never authorize Bitcoin request creation.",
  binding:
    "Each created Bitcoin request carries immutable creation-time metadata that both readiness gates were true, for audit/diagnostics only.",
  audit:
    "Readiness transitions are privately audited with dependency categories and trusted time, never secrets.",
  failClosed:
    "Unknown, inconsistent or invalid readiness state keeps Bitcoin unavailable.",
} as const

export const VIA_BITCOIN_OPERATIONAL_SECURITY_REVIEW = {
  status: "boundary-complete",
  outstanding:
    "Live Bitcoin remains disabled until the real receiver address, rate provider, observer and integration tests are actually configured/passing in deployment.",
} as const
