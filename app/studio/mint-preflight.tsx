const mintReference = [
  "Choose Single or Multiple editions",
  "Choose sale mode: auction, Buy Now, or prepare without sale",
  "Set minimum bid / price and royalties",
  "Add optional unlockable content",
] as const

const preflight = [
  "Prepare the DeSo NFT transaction without broadcasting it",
  "Read the actual network fee from the prepared transaction",
  "Check a fresh DESO rate when a fiat equivalent or DESO payment conversion is shown",
  "Add any applicable VIA storage/service customer price",
  "Check the creator has enough spendable DESO",
  "Show the complete cost boundary and require explicit creator approval",
  "Sign only after approval, then broadcast and verify the on-chain result",
] as const

export default function MintPreflight() {
  return (
    <section className="mb-4 rounded-[14px] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6" aria-labelledby="mint-preflight-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fd4a9]">NFT mint foundation</p>
          <h2 id="mint-preflight-heading" className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">Prepare first. Approve costs. Sign last.</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">VIA is building the mint flow from the recovered NFTz feature set, the current DiamondApp flow and DeSo's transaction model. This panel is preparation only: it does not sign, charge or broadcast anything.</p>
        </div>
        <span className="rounded-[9px] border border-[#8fd4a9]/30 bg-[#0c1711]/40 px-3 py-2 text-xs font-semibold text-[#8fd4a9]">No blockchain write</span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[12px] border border-zinc-800/80 bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-zinc-100">Creator choices</h3>
          <ol className="mt-3 grid gap-2 text-sm leading-6 text-zinc-400">
            {mintReference.map((item, index) => <li key={item}><span className="mr-2 text-[#8fd4a9]">{index + 1}.</span>{item}</li>)}
          </ol>
        </article>

        <article className="rounded-[12px] border border-zinc-800/80 bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-zinc-100">Mandatory VIA cost preflight</h3>
          <ol className="mt-3 grid gap-2 text-sm leading-6 text-zinc-400">
            {preflight.map((item, index) => <li key={item}><span className="mr-2 text-[#8fd4a9]">{index + 1}.</span>{item}</li>)}
          </ol>
        </article>
      </div>

      <div className="mt-4 rounded-[11px] border border-amber-900/50 bg-amber-950/15 px-4 py-3 text-sm leading-6 text-amber-100/80">
        Network fees are never assumed from an old fixed DESO amount. If fee, balance or exchange-rate data is unavailable or stale, VIA must stop and recalculate before the creator can approve the mint.
      </div>

      <button type="button" disabled aria-disabled="true" title="Minting stays disabled until transaction preparation, cost preflight and signing are connected and verified." className="mt-4 min-h-11 rounded-[11px] border border-zinc-800 bg-transparent px-4 py-2 text-sm text-zinc-600">Create NFT — preflight not connected</button>
    </section>
  )
}
