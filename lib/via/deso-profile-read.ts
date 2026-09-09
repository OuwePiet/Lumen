import { fetchDeSo } from "../../app/deso-api"

export type ViaPublicProfile = {
  publicKey: string
  username: string
  description: string
  profilePic: string | null
}

type DeSoProfileResponse = {
  Profile?: {
    PublicKeyBase58Check?: unknown
    Username?: unknown
    Description?: unknown
    ProfilePic?: unknown
  } | null
}

function text(value: unknown) {
  return typeof value === "string" ? value : ""
}

/**
 * Read a public DeSo profile without requesting wallet authority.
 * DeSo's get-single-profile endpoint is a POST transport, but this operation
 * only requests public data. No transaction is constructed, signed or sent.
 */
export async function readPublicProfile(
  usernameOrPublicKey: string,
): Promise<ViaPublicProfile | null> {
  const identity = usernameOrPublicKey.trim().replace(/^@/, "")
  if (!identity || identity.length > 128) return null

  const response = await fetchDeSo("get-single-profile", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      PublicKeyBase58Check: identity.startsWith("BC1") ? identity : "",
      Username: identity.startsWith("BC1") ? "" : identity,
    }),
  })

  if (!response.ok) return null

  const data = (await response.json()) as DeSoProfileResponse
  const profile = data.Profile
  if (!profile) return null

  const publicKey = text(profile.PublicKeyBase58Check)
  const username = text(profile.Username)
  if (!publicKey && !username) return null

  const profilePic = text(profile.ProfilePic)

  return {
    publicKey,
    username,
    description: text(profile.Description),
    profilePic: /^https:\/\//i.test(profilePic) ? profilePic : null,
  }
}
