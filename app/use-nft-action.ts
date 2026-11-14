"use client"

import { useEffect, useRef } from "react"
import { createNFTActionRunner } from "./nft-action"
import { useNFTActionReview } from "./nft-action-review"

export function useNFTAction() {
  const runner = useRef<ReturnType<typeof createNFTActionRunner> | null>(null)
  const review = useNFTActionReview()
  useEffect(() => {
    const active = createNFTActionRunner(review)
    runner.current = active
    return () => { active.dispose(); if (runner.current === active) runner.current = null }
  }, [review])
  return runner
}
