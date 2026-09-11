export const VIA_CHECKOUT_ORDER_TEST_CASES = [
  { name: "valid EUR order", currency: "EUR", amountMinor: 100, expected: true },
  { name: "valid USD order", currency: "USD", amountMinor: 100, expected: true },
  { name: "valid BTC order", currency: "BTC", amountMinor: 100, expected: true },
  { name: "valid DESO order", currency: "DESO", amountMinor: 100, expected: true },
  { name: "zero amount", currency: "EUR", amountMinor: 0, expected: false },
  { name: "negative amount", currency: "EUR", amountMinor: -1, expected: false },
  { name: "missing NFT", currency: "EUR", amountMinor: 100, expected: false },
  { name: "missing seller", currency: "EUR", amountMinor: 100, expected: false },
  { name: "empty supplied buyer", currency: "EUR", amountMinor: 100, expected: false },
] as const
