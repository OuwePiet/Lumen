import { fetchDeSo } from "../deso-api"

type AccessGroup = {
  OwnerPublicKeyBase58Check?: string
  AccessGroupPublicKeyBase58Check?: string
  AccessGroupKeyName?: string
}

function complete(group: AccessGroup): group is Required<AccessGroup> {
  return Boolean(group.OwnerPublicKeyBase58Check && group.AccessGroupPublicKeyBase58Check && group.AccessGroupKeyName)
}

export async function constructViaDMTransaction(sender: AccessGroup, recipient: AccessGroup, encryptedMessage: string) {
  if (!complete(sender) || !complete(recipient) || !encryptedMessage) throw new Error("Incomplete DeSo DM transaction data.")

  const response = await fetchDeSo("send-dm-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      SenderAccessGroupOwnerPublicKeyBase58Check: sender.OwnerPublicKeyBase58Check,
      SenderAccessGroupPublicKeyBase58Check: sender.AccessGroupPublicKeyBase58Check,
      SenderAccessGroupKeyName: sender.AccessGroupKeyName,
      RecipientAccessGroupOwnerPublicKeyBase58Check: recipient.OwnerPublicKeyBase58Check,
      RecipientAccessGroupPublicKeyBase58Check: recipient.AccessGroupPublicKeyBase58Check,
      RecipientAccessGroupKeyName: recipient.AccessGroupKeyName,
      EncryptedMessageText: encryptedMessage,
      TimestampNanosString: "",
      MinFeeRateNanosPerKB: 1500,
      TransactionFees: [],
      ExtraData: {},
    }),
    cache: "no-store",
  })
  if (!response.ok) throw new Error("DeSo could not construct the DM transaction.")
  const data = await response.json() as { TransactionHex?: unknown }
  if (typeof data.TransactionHex !== "string" || !data.TransactionHex) throw new Error("DeSo did not return a DM transaction.")
  return data.TransactionHex
}

export async function submitViaSignedTransaction(signedTransactionHex: string) {
  if (!/^[0-9a-fA-F]+$/.test(signedTransactionHex) || signedTransactionHex.length % 2 !== 0) throw new Error("Invalid signed DeSo transaction.")

  const response = await fetchDeSo("submit-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ TransactionHex: signedTransactionHex }),
    cache: "no-store",
  })
  if (!response.ok) throw new Error("DeSo could not submit the signed transaction.")
  return await response.json() as Record<string, unknown>
}
