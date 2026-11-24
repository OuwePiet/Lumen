"use client"
import { Pencil, X } from "lucide-react"
import { useRef } from "react"
import PostComposer from "./post-composer"
export default function PostComposeShortcut() {
  const dialog = useRef<HTMLDialogElement>(null)
  return <>
    <button type="button" onClick={() => dialog.current?.showModal()} aria-label="Write a post" title="Write a post" className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/40 bg-[#0b3324] text-emerald-100 shadow-xl sm:bottom-6 sm:right-6"><Pencil size={25} aria-hidden="true" /></button>
    <dialog ref={dialog} aria-label="Write a post" className="m-auto max-h-[90dvh] w-[calc(100%-1rem)] max-w-2xl overflow-y-auto rounded-xl border border-zinc-700 bg-[#080b09] p-4 text-white backdrop:bg-black/80">
      <div className="mb-3 flex items-center justify-between"><h2>Write a post</h2><button type="button" aria-label="Close" onClick={() => dialog.current?.close()} className="grid h-11 w-11 place-items-center"><X /></button></div>
      <PostComposer onDone={() => dialog.current?.close()} onCancel={() => dialog.current?.close()} />
    </dialog>
  </>
}