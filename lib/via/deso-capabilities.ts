export type ViaCapabilityStatus = "released" | "verified-next" | "research"

export type ViaCapability = {
  id: string
  label: string
  status: ViaCapabilityStatus
  note: string
}

export const VIA_DESO_CAPABILITIES: ViaCapability[] = [
  { id: "post", label: "5,000-character posts", status: "released", note: "Controlled submit-post prepare/Identity approval/submit flow." },
  { id: "images", label: "Up to 4 images", status: "released", note: "DeSo media upload plus HTTPS media references." },
  { id: "video", label: "Video", status: "released", note: "One video URL in controlled submit-post flow." },
  { id: "reply", label: "Replies", status: "released", note: "ParentStakeID submit-post flow." },
  { id: "like", label: "Likes", status: "released", note: "Like/Unlike transaction flow." },
  { id: "follow", label: "Follow / Unfollow", status: "released", note: "Follow status read plus controlled write." },
  { id: "repost", label: "Repost / Quote", status: "released", note: "Repost and Quote Repost through submit-post." },
  { id: "diamond", label: "Diamonds", status: "released", note: "Explicit value confirmation before Identity approval." },
  { id: "saved", label: "Saved posts", status: "released", note: "Local VIA save control; not represented as a DeSo blockchain write." },
  { id: "notifications", label: "Notification filters", status: "released", note: "Read-only DeSo notification views." },
  { id: "edit", label: "Edit own post", status: "released", note: "Ownership inspect, prepare, Identity approval and dedicated submit." },
  { id: "feeds", label: "Hot / Following / Recent feeds", status: "released", note: "Read-only DeSo feed sources." },
  { id: "messages", label: "Access-group messaging", status: "verified-next", note: "Native DeSo DM/group endpoints verified; secure encryption/decryption/session flow still required." },
  { id: "poll-vote", label: "Vote in DeSo polls", status: "released", note: "Released guarded POLL_RESPONSE post-association flow with duplicate-response checks and DeSo Identity approval. Creating a poll remains separate research." },
  { id: "poll-create", label: "Create a poll", status: "research", note: "VIA has not yet verified a canonical DeSo poll-definition write format for creating new polls." },
  { id: "reactions", label: "Emoji reactions", status: "research", note: "DeSo UI has reaction UI, but a native reaction write contract is not yet verified for VIA." },
  { id: "audio", label: "Audio / release posts", status: "research", note: "Audio UI exists in DeSo UI; canonical DeSo metadata/write mapping still needs verification." },
]

export const releasedCapabilities = VIA_DESO_CAPABILITIES.filter((item) => item.status === "released")
export const verifiedNextCapabilities = VIA_DESO_CAPABILITIES.filter((item) => item.status === "verified-next")
export const researchCapabilities = VIA_DESO_CAPABILITIES.filter((item) => item.status === "research")
