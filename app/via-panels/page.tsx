import ViaRightPanels from "../via-right-panels"

export default function ViaPanelsPreviewPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-h-[60vh] rounded-2xl border border-zinc-900 bg-[#030504] p-5">
          <p className="text-sm text-zinc-500">VIA content area</p>
        </section>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ViaRightPanels />
        </div>
      </div>
    </main>
  )
}
