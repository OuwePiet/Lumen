"use client"

import { useState } from "react"
import MintMediaStep from "./mint-media-step"
import MintPreflight from "./mint-preflight"
import MintPreflightLocalizer from "./mint-preflight-localizer"

export default function MintFlow() {
  const [postHash, setPostHash] = useState("")

  return (
    <>
      <MintPreflightLocalizer />
      <MintMediaStep onPostHash={setPostHash} />
      <MintPreflight initialPostHash={postHash} />
    </>
  )
}
