import { createHmac, timingSafeEqual } from "node:crypto"
import type { ViaCheckoutOrder } from "./checkout-order-boundary"

function signingSecret(): string | null {
  const secret = process.env.VIA_CHECKOUT_ORDER_SIGNING_SECRET?.trim()
  if (!secret || secret.length < 32) return null
  return secret
}

function canonicalCheckoutOrder(order: ViaCheckoutOrder): string {
  return JSON.stringify({
    orderId: order.orderId,
    nftId: order.nftId,
    sellerPublicKey: order.sellerPublicKey,
    buyerPublicKey: order.buyerPublicKey ?? null,
    amountMinor: order.amountMinor,
    currency: order.currency,
    status: order.status,
  })
}

export function checkoutOrderSigningReady(): boolean {
  return signingSecret() !== null
}

export function signCheckoutOrder(order: ViaCheckoutOrder): string | null {
  const secret = signingSecret()
  if (!secret) return null
  return createHmac("sha256", secret).update(canonicalCheckoutOrder(order)).digest("hex")
}

export function verifyCheckoutOrderSignature(
  order: ViaCheckoutOrder,
  signature: string,
): boolean {
  const expected = signCheckoutOrder(order)
  if (!expected || typeof signature !== "string") return false

  const actualBuffer = Buffer.from(signature, "hex")
  const expectedBuffer = Buffer.from(expected, "hex")
  if (actualBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(actualBuffer, expectedBuffer)
}

export const VIA_CHECKOUT_ORDER_SIGNING_RULES = {
  serverOnly: "Checkout-order signatures are created and verified only on the server.",
  exactPayload: "Any change to NFT, seller, buyer, amount, currency, order ID or status invalidates the signature.",
  failClosed: "Missing or weak signing configuration disables signed-order issuance and verification.",
  noPayment: "A valid order signature authorizes no charge, payment confirmation, NFT delivery or blockchain write.",
} as const
