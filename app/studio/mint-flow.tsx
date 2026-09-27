"use client"

import MintMediaStep from "./mint-media-step"
import MintPreflight from "./mint-preflight"
import MintPreflightLocalizer from "./mint-preflight-localizer"

export default function MintFlow() {
  return (
    <>
      <MintPreflightLocalizer />
      <MintMediaStep />
      <MintPreflight />
    </>
  )
}
