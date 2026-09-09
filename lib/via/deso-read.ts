const DEFAULT_DESO_NODE = "https://node.deso.org";

function normaliseNode(value?: string) {
  const node = value?.trim() || DEFAULT_DESO_NODE;
  return node.replace(/\/+$/, "");
}

export const DESO_NODE = normaliseNode(process.env.DESO_NODE);

export type DesoReadResult<T> =
  | { ok: true; data: T; node: string }
  | { ok: false; error: string; node: string };

/**
 * VIA public DeSo read boundary.
 *
 * This helper is intentionally GET/read-only. It never signs, broadcasts,
 * stores private keys or seed phrases, and it does not silently fall back to
 * write-capable endpoints. Callers must treat returned blockchain/media data
 * as untrusted remote input.
 */
export async function desoRead<T>(
  path: string,
  init?: { revalidate?: number },
): Promise<DesoReadResult<T>> {
  if (!path.startsWith("/")) {
    return { ok: false, error: "DeSo read path must start with /", node: DESO_NODE };
  }

  try {
    const response = await fetch(`${DESO_NODE}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: init?.revalidate === undefined ? undefined : { revalidate: init.revalidate },
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `DeSo read failed (${response.status})`,
        node: DESO_NODE,
      };
    }

    return { ok: true, data: (await response.json()) as T, node: DESO_NODE };
  } catch {
    return {
      ok: false,
      error: "DeSo read is temporarily unavailable",
      node: DESO_NODE,
    };
  }
}
