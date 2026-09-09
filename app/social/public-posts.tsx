"use client"

import { FormEvent, useState } from "react"

type PublicPost = {
  postHashHex: string
  body: string
  imageURLs: string[]
  videoURLs: string[]
  timestampNanos: number
  likeCount: number
  diamondCount: number
  commentCount: number
  repostCount: number
  quoteRepostCount: number
  isNFT: boolean
}

type PostsResponse = {
  ok?: boolean
  posts?: PublicPost[]
}

export default function PublicPosts() {
  const [identity, setIdentity] = useState("OuwePiet")
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("Public DeSo posts are read-only in VIA.")

  async function loadPosts(event: FormEvent) {
    event.preventDefault()
    const value = identity.trim().replace(/^@/, "")
    if (!value) return

    setLoading(true)
    setMessage("Loading public DeSo posts…")

    try {
      const response = await fetch(`/api/via/posts?identity=${encodeURIComponent(value)}&limit=20`)
      const data = (await response.json()) as PostsResponse
      const nextPosts = response.ok && data.ok && Array.isArray(data.posts) ? data.posts : []
      setPosts(nextPosts)
      setMessage(nextPosts.length ? `${nextPosts.length} public posts loaded.` : "No public posts found.")
    } catch {
      setPosts([])
      setMessage("Public posts are temporarily unavailable.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5" aria-labelledby="public-posts-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">Live public read</p>
      <h2 id="public-posts-heading" className="mt-2 text-2xl font-semibold">Public DeSo posts</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
        Read a creator&apos;s recent public posts without connecting a wallet. VIA does not like, repost, Diamond, follow or publish from this view.
      </p>

      <form onSubmit={loadPosts} className="mt-4 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="social-public-identity">Creator username or public key</label>
        <input
          id="social-public-identity"
          value={identity}
          onChange={(event) => setIdentity(event.target.value)}
          maxLength={128}
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="Creator username or public key"
          className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-green-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-green-800 px-5 py-3 text-sm font-medium text-green-300 hover:border-green-600 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Loading…" : "Read posts"}
        </button>
      </form>

      <p className="mt-3 text-sm text-zinc-500" role="status" aria-live="polite">{message}</p>

      {posts.length > 0 ? (
        <div className="mt-5 space-y-3">
          {posts.map((post) => (
            <article key={post.postHashHex} className="rounded-xl border border-zinc-800 bg-black p-4">
              {post.body ? <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{post.body}</p> : <p className="text-sm text-zinc-500">Media post</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                <span>{post.likeCount} likes</span>
                <span>{post.diamondCount} Diamonds</span>
                <span>{post.commentCount} replies</span>
                <span>{post.repostCount + post.quoteRepostCount} reposts</span>
                {post.isNFT ? <span className="text-green-400">NFT</span> : null}
              </div>
              {post.imageURLs.length || post.videoURLs.length ? (
                <p className="mt-2 text-xs text-zinc-600">Media attached · display support follows after media safety review.</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
