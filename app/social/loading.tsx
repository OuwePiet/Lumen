export default function Loading() {
  return (
    <main
      data-via-social-loading
      className="min-h-screen bg-[#030504] px-3 py-4 text-white sm:px-6 sm:py-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-[#8fd4a9]">VIA</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">VIA Post Office</h1>
        <p className="mt-2 text-sm text-zinc-500">Loading Post Office…</p>
      </div>
    </main>
  )
}
