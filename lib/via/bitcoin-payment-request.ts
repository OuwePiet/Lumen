export type ViaBitcoinPaymentRequest = {
  address: string
  amountBtc: string
  uri: string
}

function validBtcAmount(value: string) {
  if (!/^(0|[1-9]\d*)(\.\d{1,8})?$/.test(value)) return false
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0
}

export function buildBitcoinPaymentRequest(input: {
  address: string
  amountBtc: string
}): ViaBitcoinPaymentRequest | null {
  const address = input.address.trim()
  const amountBtc = input.amountBtc.trim()

  if (!address || !validBtcAmount(amountBtc)) return null

  return {
    address,
    amountBtc,
    uri: `bitcoin:${address}?amount=${encodeURIComponent(amountBtc)}`,
  }
}

export const VIA_BITCOIN_PAYMENT_REQUEST_RULES = {
  exactAmount:
    "The Bitcoin payment request displays the configured public receiving address and the exact BTC amount for the order.",
  qrReady:
    "The generated standard bitcoin: URI may later be rendered as a QR code without changing custody or signing boundaries.",
  confirmation:
    "Displaying an address, amount or QR request never marks payment confirmed; trusted transaction confirmation remains required.",
  addressSource:
    "The payment request must use the validated configured VIA Bitcoin receiver and must not accept a payer-supplied destination.",
} as const
