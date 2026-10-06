"use client"

import { useEffect, useState } from "react"
import { viaModernIdentity, type ViaModernIdentityUser } from "../deso-identity-modern"
import { readPollResponseStatus } from "./poll-response-status"

type Props = {
  postHash: string
  options: string[]
}

type PrepareResponse = {
  ok?: boolean
  transactionHex?: string
  feeNanos?: number | null
  spendAmountNanos?: number | null
  option?: string
  error?: string
}

type SubmitResponse = { ok?: boolean; error?: string }

function safeOptions(options: string[]) {
  return options
    .map((value) => value.trim())
    .filter((value, index, all) => value.length > 0 && value.length <= 160 && all.indexOf(value) === index)
    .slice(0, 5)
}

export default function PollVoteControl({ postHash, options }: Props) {
  const [session, setSession] = useState<ViaModernIdentityUser | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "already-voted" | "blocked" | "preparing" | "approval" | "submitting" | "done" | "error">("loading")
  const [message, setMessage] = useState("Checking this poll against DeSo…")
  const [existingOption, setExistingOption] = useState<string | null>(null)
  const [pendingOption, setPendingOption] = useState<string | null>(null)
  const normalizedOptions = safeOptions(options)

  useEffect(() => {
    void viaModernIdentity.currentUser().then(setSession)
    return viaModernIdentity.subscribe(setSession)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (!session) {
        if (!cancelled) {
          setStatus("ready")
          setMessage("Connect with DeSo to vote. Reading remains public.")
          setExistingOption(null)
        }
        return
      }

      if (normalizedOptions.length < 2) {
        if (!cancelled) {
          setStatus("blocked")
          setMessage("This poll cannot be offered safely because its DeSo options are incomplete.")
        }
        return
      }

      setStatus("loading")
      setMessage("Checking your existing DeSo poll response…")
      try {
        const result = await readPollResponseStatus(postHash, session.publicKey)
        if (cancelled) return
        if (result.truncated || result.multipleResponsesDetected) {
          setStatus("blocked")
          setMessage("VIA found an ambiguous DeSo poll-response history and will not create another vote silently.")
          return
        }
        if (result.existingResponse) {
          setExistingOption(result.existingResponse.option)
          setStatus("already-voted")
          setMessage(`DeSo already contains your response: ${result.existingResponse.option}`)
          return
        }
        setExistingOption(null)
        setStatus("ready")
        setMessage("No existing DeSo response found for this public key.")
      } catch {
        if (!cancelled) {
          setStatus("blocked")
          setMessage("VIA could not verify your current DeSo poll status, so voting stays blocked.")
        }
      }
    }

    void check()
    return () => { cancelled = true }
  }, [postHash, session?.publicKey, normalizedOptions.join("\u0001")])

  async function vote(option: string) {
    if (!session || status !== "ready") return
    setPendingOption(option)
    setStatus("preparing")
    setMessage(`Preparing the DeSo poll response “${option}”…`)

    try {
      const response = await fetch("/api/via/social/poll-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "prepare",
          voterPublicKey: session.publicKey,
          postHash,
          option,
        }),
      })
      const data = await response.json() as PrepareResponse
      if (!response.ok || !data.ok || !data.transactionHex) {
        if (data.error === "POLL_RESPONSE_ALREADY_EXISTS" || data.error === "MULTIPLE_EXISTING_POLL_RESPONSES") {
          setStatus("blocked")
          setMessage("DeSo now reports an existing poll response. VIA stopped before creating another transaction.")
          return
        }
        throw new Error(data.error || "PREPARE_FAILED")
      }

      setStatus("approval")
      const fee = typeof data.feeNanos === "number" ? ` Network fee: ${data.feeNanos.toLocaleString()} nanos.` : ""
      setMessage(`Signing the exact POLL_RESPONSE transaction with DeSo Identity.${fee}`)
      const signedTransactionHex = await viaModernIdentity.signTx(data.transactionHex)

      setStatus("submitting")
      setMessage("Submitting your approved poll response to DeSo…")
      const submitResponse = await fetch("/api/via/social/poll-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "submit", signedTransactionHex }),
      })
      const submitData = await submitResponse.json() as SubmitResponse
      if (!submitResponse.ok || !submitData.ok) throw new Error(submitData.error || "SUBMIT_FAILED")

      const reread = await readPollResponseStatus(postHash, session.publicKey)
      const confirmed = reread.existingResponse?.option ?? option
      setExistingOption(confirmed || null)
      setStatus("done")
      setMessage(confirmed ? `Vote confirmed from DeSo: ${confirmed}` : "Vote submitted to DeSo; refresh the poll to verify its response.")
      setPendingOption(null)
    } catch {
      setStatus("error")
      setMessage("The DeSo poll response could not be prepared. Nothing was submitted.")
      setPendingOption(null)
    }
  }

  const busy = status === "loading" || status === "preparing" || status === "approval" || status === "submitting"
  const canVote = Boolean(session && status === "ready")

  return (
    <div className="mt-4 rounded-xl border border-zinc-800 bg-black/35 p-3" aria-label="DeSo poll">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fd4a9]">DeSo poll</p>
      <div className="mt-3 grid gap-2">
        {normalizedOptions.map((option, index) => {
          const selected = existingOption === option
          if (!session) {
            return (
              <div key={`${index}-${option}`} className="rounded-lg border border-zinc-800 px-3 py-2 text-left text-sm text-zinc-200">
                {option}
              </div>
            )
          }
          return (
            <button
              key={`${index}-${option}`}
              type="button"
              disabled={!canVote}
              onClick={() => void vote(option)}
              className={`rounded-lg border px-3 py-2 text-left text-sm ${selected ? "border-[#8fd4a9]/55 text-[#9adbb2]" : "border-zinc-800 text-zinc-200"} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {selected ? "✓ " : ""}{option}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500" role="status" aria-live="polite">
        {busy ? message : status === "already-voted" || status === "done" ? message : session ? message : "Connect with DeSo to vote. VIA does not keep a separate vote database."}
      </p>
    </div>
  )
}
