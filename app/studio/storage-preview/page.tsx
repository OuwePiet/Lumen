import type { Metadata } from "next"
import StoragePreview from "./storage-preview"

export const metadata: Metadata = { title: "NFT maken · opslagvoorbeeld", robots: { index: false, follow: false } }
export default function Page() { return <StoragePreview /> }
