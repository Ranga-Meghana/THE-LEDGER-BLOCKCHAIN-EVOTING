// Real SHA-256 hashing via the browser's SubtleCrypto API, with a trivial fallback
// for environments where it is unavailable (e.g. non-secure contexts).
export async function sha256(str) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (e) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(16).padStart(64, "0");
  }
}

export function shortHash(h) {
  return h ? h.slice(0, 6) + "…" + h.slice(-4) : "—";
}
