import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Studio",
  description: "Free VIA creator workspace for phone, tablet and desktop.",
}

const tools = [
  { title: "Create a post", text: "Prepare text and media for a future DeSo post workflow." },
  { title: "Prepare an NFT", text: "Organise artwork, title, copies and sale information before signing." },
  { title: "Media workspace", text: "Prepare image, video and audio details with safe previews." },
  { title: "Drafts", text: "Keep non-secret work in progress without storing wallet signing material." },
]

export default function StudioPage() {
  return (
    <main className="via-studio">
      <div className="via-studio-shell">
        <nav className="via-studio-nav" aria-label="Studio navigation">
          <a href="/" className="via-studio-back">← VIA</a>
          <span className="via-studio-free">Free Studio</span>
        </nav>

        <header className="via-studio-hero">
          <p className="via-studio-kicker">VIA Studio</p>
          <h1>Create from any screen.</h1>
          <p>
            A free creator workspace designed for phone, tablet and desktop. This first
            foundation is intentionally non-custodial: VIA Studio never asks for or stores
            your DeSo seed phrase or private signing key.
          </p>
        </header>

        <section className="via-studio-grid" aria-label="Studio tools">
          {tools.map((tool) => (
            <article className="via-studio-card" key={tool.title}>
              <h2>{tool.title}</h2>
              <p>{tool.text}</p>
              <span aria-label={`${tool.title} is being built`}>Foundation ready</span>
            </article>
          ))}
        </section>

        <section className="via-studio-safety" aria-labelledby="studio-safety-heading">
          <h2 id="studio-safety-heading">Safe by design</h2>
          <p>
            Studio separates preparing content from authorising blockchain actions. Future
            on-chain publishing or minting must use an authoritative DeSo wallet-control
            flow and explicit signing confirmation.
          </p>
        </section>
      </div>
    </main>
  )
}
