import {sendDMMessage,identity} from "deso-protocol"
import {viaModernIdentity} from "../deso-identity-modern"
import {ensureNFTPermission} from "../nft-permissions"
import { fetchDeSo } from "../deso-api"

type AccessGroup = {
  OwnerPublicKeyBase58Check?: string
  AccessGroupPublicKeyBase58Check?: string
  AccessGroupKeyName?: string
}

function complete(group: AccessGroup): group is Required<AccessGroup> {
  return Boolean(group.OwnerPublicKeyBase58Check && group.AccessGroupPublicKeyBase58Check && group.AccessGroupKeyName)
}

type PartyAccessGroupsResponse = {
  SenderAccessGroupPublicKeyBase58Check?: string
  SenderAccessGroupKeyName?: string
  RecipientAccessGroupPublicKeyBase58Check?: string
  RecipientAccessGroupKeyName?: string
}

export async function getViaDefaultDMGroups(senderPublicKey: string, recipientPublicKey: string) {
  if (!senderPublicKey || !recipientPublicKey) throw new Error("Incomplete DeSo DM parties.")
  const response = await fetchDeSo("check-party-access-groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      SenderPublicKeyBase58Check: senderPublicKey,
      SenderAccessGroupKeyName: "default-key",
      RecipientPublicKeyBase58Check: recipientPublicKey,
      RecipientAccessGroupKeyName: "default-key",
    }),
    cache: "no-store",
  })
  if (!response.ok) throw new Error("DeSo could not resolve DM access groups.")
  const data = await response.json() as PartyAccessGroupsResponse
  if (!data.SenderAccessGroupPublicKeyBase58Check || !data.SenderAccessGroupKeyName || !data.RecipientAccessGroupPublicKeyBase58Check || !data.RecipientAccessGroupKeyName) {
    throw new Error("DeSo did not return complete DM access groups.")
  }
  return {
    sender: {
      OwnerPublicKeyBase58Check: senderPublicKey,
      AccessGroupPublicKeyBase58Check: data.SenderAccessGroupPublicKeyBase58Check,
      AccessGroupKeyName: data.SenderAccessGroupKeyName,
    },
    recipient: {
      OwnerPublicKeyBase58Check: recipientPublicKey,
      AccessGroupPublicKeyBase58Check: data.RecipientAccessGroupPublicKeyBase58Check,
      AccessGroupKeyName: data.RecipientAccessGroupKeyName,
    },
  }
}

export async function constructViaDMTransaction(sender: AccessGroup, recipient: AccessGroup, encryptedMessage: string) {
  if (!complete(sender) || !complete(recipient) || !encryptedMessage) throw new Error("Incomplete DeSo DM transaction data.")

  const key=sender.OwnerPublicKeyBase58Check
  const assertAccount=async()=>{if((await viaModernIdentity.currentUser())?.publicKey!==key||(await identity.snapshot()).currentUser?.publicKey!==key)throw new Error("ACCOUNT_CHANGED")}
  await assertAccount()
  const {constructedTransactionResponse:tx}=await sendDMMessage({
    SenderAccessGroupOwnerPublicKeyBase58Check:key,
    SenderAccessGroupPublicKeyBase58Check:sender.AccessGroupPublicKeyBase58Check,
    SenderAccessGroupKeyName:sender.AccessGroupKeyName,
    RecipientAccessGroupOwnerPublicKeyBase58Check:recipient.OwnerPublicKeyBase58Check,
    RecipientAccessGroupPublicKeyBase58Check:recipient.AccessGroupPublicKeyBase58Check,
    RecipientAccessGroupKeyName:recipient.AccessGroupKeyName,
    EncryptedMessageText:encryptedMessage,MinFeeRateNanosPerKB:1500,TransactionFees:[],ExtraData:{}
  },{broadcast:false,checkPermissions:false,localConstruction:false})
  if(!tx.TransactionHex||!Number.isSafeInteger(tx.FeeNanos)||tx.FeeNanos<0)throw new Error("INVALID_DM_FEE")
  await ensureNFTPermission({GlobalDESOLimit:tx.FeeNanos,TransactionCountLimitMap:{NEW_MESSAGE:1}},assertAccount)
  await assertAccount()
  return tx.TransactionHex
}

export async function submitViaSignedTransaction(signedTransactionHex:string,key:string){
  if(!/^[0-9a-fA-F]+$/.test(signedTransactionHex)||signedTransactionHex.length%2!==0)throw new Error("INVALID_SIGNED_DM")
  if((await viaModernIdentity.currentUser())?.publicKey!==key||(await identity.snapshot()).currentUser?.publicKey!==key)throw new Error("ACCOUNT_CHANGED")
  return await identity.submitTx(signedTransactionHex)
}
