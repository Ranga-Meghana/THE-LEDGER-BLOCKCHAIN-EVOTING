// Real-mode configuration. In Demo Mode (the default) none of this is required —
// the app falls back to a fully client-side simulated chain instead.
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
export const NETWORK_RPC_URL = import.meta.env.VITE_NETWORK_RPC_URL || "http://127.0.0.1:8545";
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 31337);
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// Real Blockchain Mode is only attempted when a contract address has been configured
// AND window.ethereum (MetaMask) is present. Otherwise the app runs in Demo Mode.
export const REAL_MODE_AVAILABLE =
  typeof window !== "undefined" && Boolean(window.ethereum) && Boolean(CONTRACT_ADDRESS);
