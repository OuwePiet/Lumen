import { getUsersStateless, buildProfilePictureUrl } from "deso-protocol"

export type CreatorCoinHolding = {
  creatorPublicKey: string
  username: string
  profilePic: string | null
  isVerified: boolean
  balanceNanos: number
  balanceCoins: number
  hasPurchased: boolean
}

export type WalletData = {
  publicKey: string
  balanceNanos: number
  balanceDeSo: number
  creatorCoinHoldings: CreatorCoinHolding[]
}

export async function readDeSoWallet(publicKey: string): Promise<WalletData> {
  const response = await getUsersStateless({ PublicKeysBase58Check: [publicKey], SkipForLeaderboard: false, IncludeBalance: true, GetUnminedBalance: false })
  const user = response.UserList?.find(entry => entry.PublicKeyBase58Check === publicKey)
  if (!user || !Number.isFinite(user.BalanceNanos)) throw new Error("WALLET_UNAVAILABLE")
  if (!Array.isArray(user.UsersYouHODL)) throw new Error("HOLDINGS_UNAVAILABLE")
  const creatorCoinHoldings = user.UsersYouHODL.map(entry => {
    if (!entry.CreatorPublicKeyBase58Check || !Number.isFinite(entry.BalanceNanos)) throw new Error("HOLDING_UNAVAILABLE")
    const profile = entry.ProfileEntryResponse
    return { creatorPublicKey: entry.CreatorPublicKeyBase58Check, username: profile?.Username ?? "", profilePic: buildProfilePictureUrl(entry.CreatorPublicKeyBase58Check), isVerified: profile?.IsVerified === true, balanceNanos: entry.BalanceNanos, balanceCoins: entry.BalanceNanos / 1e9, hasPurchased: entry.HasPurchased === true }
  }).filter(entry => entry.balanceNanos > 0)
  return { publicKey, balanceNanos: user.BalanceNanos, balanceDeSo: user.BalanceNanos / 1e9, creatorCoinHoldings }
}