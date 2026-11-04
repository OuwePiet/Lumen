// Isolated production-server fixture. Never preload this for a user/production server.
// Only documented public reads are simulated; every other DeSo request fails closed.
const originalFetch = globalThis.fetch
const A = 'BC1'+'A'.repeat(48), B = 'BC1'+'B'.repeat(48), HASH = 'a'.repeat(64)
const post = { PostHashHex: HASH, PublicKeyBase58Check: A, Body: 'Synthetic VIA NFT browser fixture — not a real asset', ImageURLs: ['https://media.example.test/book.pdf'], VideoURLs: [], IsNFT: true, IsHidden: false, HasUnlockable: false, NumNFTCopies: 2, NumNFTCopiesForSale: 1, NFTRoyaltyToCreatorBasisPoints: 100, NFTRoyaltyToCoinBasisPoints: 50, ProfileEntryResponse: { Username: 'VIA-Test-A', PublicKeyBase58Check: A }, TimestampNanos: 1700000000000000000 }
const entries = [{ SerialNumber: 1, OwnerPublicKeyBase58Check: A, IsPending: false, IsForSale: false, MinBidAmountNanos: 0, IsBuyNow: false }, { SerialNumber: 2, OwnerPublicKeyBase58Check: B, IsPending: false, IsForSale: true, MinBidAmountNanos: 10000, IsBuyNow: true, BuyNowPriceNanos: 20000 }]
const safe = new Set(['get-single-profile','get-nfts-for-user','get-posts-for-public-key','get-single-post','get-posts-stateless','get-notifications','get-user-dm-threads-ordered-by-timestamp','get-follows-stateless','get-hot-feed','get-users-stateless','get-nft-entries-for-nft-post','get-nft-bids-for-nft-post','get-nft-bids-for-user','get-app-state','get-exchange-rate','get-unread-notifications-count','get-txn','post-associations/query'])
globalThis.fetch = async function(input, init = {}) {
  const url = new URL(typeof input === 'string' ? input : input.url || String(input))
  if (!['node.deso.org','deso.org'].includes(url.hostname)) return originalFetch(input, init)
  const endpoint = url.pathname.replace(/^\/api\/v0\//, '')
  if (!safe.has(endpoint)) throw new Error('VIA_TEST_FORBIDS_DESO_WRITE:'+endpoint)
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : {}
  let data = {}
  if (endpoint === 'get-single-profile') { const publicKey = body.PublicKeyBase58Check || A; data = { Profile: { PublicKeyBase58Check: publicKey, Username: publicKey === B ? 'VIA-Test-B' : 'VIA-Test-A' } } }
  if (endpoint === 'get-single-post') data = { PostFound: post }
  if (endpoint === 'get-nft-entries-for-nft-post') data = { NFTEntryResponses: entries }
  if (endpoint === 'get-nft-bids-for-nft-post') data = { BidEntryResponses: [{ PublicKeyBase58Check: A, SerialNumber: 2, BidAmountNanos: 10000 }, { PublicKeyBase58Check: B, SerialNumber: 1, BidAmountNanos: 5000 }] }
  if (endpoint === 'get-nft-bids-for-user') data = { NFTBidEntries: [{ PostHashHex: HASH, SerialNumber: 2, BidAmountNanos: 10000 }], PostHashHexToPostEntryResponse: { [HASH]: post } }
  if (endpoint === 'get-nfts-for-user') data = { NFTsMap: { [HASH]: { PostEntryResponse: post, NFTEntryResponses: entries.filter(entry => entry.OwnerPublicKeyBase58Check === body.UserPublicKeyBase58Check) } } }
  if (endpoint === 'get-posts-for-public-key') data = { Posts: [post], LastPostHashHex: HASH }
  if (endpoint === 'get-users-stateless') data = { UserList: (body.PublicKeysBase58Check ?? [A]).map(publicKey => ({ PublicKeyBase58Check: publicKey, BalanceNanos: 100000000 })) }
  if (endpoint === 'get-txn') data = { TxnFound: false }
  return new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } })
}
