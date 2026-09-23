import { API_BASE_URL } from "../blockchain/config.js";

// Thin fetch wrapper for the off-chain Express API (election metadata, voter
// registration, audit log persistence). All calls fail soft — if the backend
// isn't running, the UI keeps working entirely off the in-browser Demo Mode
// chain, it just won't have a durable off-chain audit trail.
async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call to ${path} failed (continuing in Demo Mode):`, err.message);
    return null;
  }
}

export const api = {
  health: () => request("/health"),
  listElections: () => request("/elections"),
  getElection: (id) => request(`/elections/${id}`),
  registerVoter: (payload) => request("/voters/register", { method: "POST", body: JSON.stringify(payload) }),
  recordVerification: (electionId, payload) =>
    request(`/audit/${electionId}/verify`, { method: "POST", body: JSON.stringify(payload) }),
};
