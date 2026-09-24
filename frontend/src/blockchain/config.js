// Real-mode configuration. In Demo Mode (the default) none of this is required —
// the app falls back to a fully client-side simulated chain instead.
const rawContractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS || "").trim();
const rawRpcUrl = (import.meta.env.VITE_NETWORK_RPC_URL || "").trim();
const rawChainId = Number(import.meta.env.VITE_CHAIN_ID ?? 11155111);
const rawDeploymentStartBlock = Number(import.meta.env.VITE_DEPLOYMENT_START_BLOCK ?? 0);

export const SEPOLIA_CHAIN_ID = 11155111;
export const CONTRACT_ADDRESS = rawContractAddress;
export const NETWORK_RPC_URL = rawRpcUrl;
export const CHAIN_ID = Number.isFinite(rawChainId) && rawChainId > 0 ? rawChainId : SEPOLIA_CHAIN_ID;
export const DEPLOYMENT_START_BLOCK = Number.isFinite(rawDeploymentStartBlock) && rawDeploymentStartBlock >= 0 ? rawDeploymentStartBlock : 0;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export function getRealModeDiagnostic() {
  if (typeof window === "undefined") {
    return "Real Blockchain Mode is only available in the browser.";
  }

  if (!window.ethereum) {
    return "MetaMask is not installed or not available. Install MetaMask to use Real Blockchain Mode.";
  }

  if (!CONTRACT_ADDRESS) {
    return "Real Blockchain Mode is missing VITE_CONTRACT_ADDRESS. Add the deployed contract address to frontend/.env.";
  }

  if (!NETWORK_RPC_URL) {
    return "Real Blockchain Mode is missing VITE_NETWORK_RPC_URL. Add the Sepolia RPC endpoint to frontend/.env.";
  }

  if (!Number.isFinite(CHAIN_ID) || CHAIN_ID !== SEPOLIA_CHAIN_ID) {
    return `Real Blockchain Mode expects Sepolia (chain ID ${SEPOLIA_CHAIN_ID}), but this app is configured for ${CHAIN_ID || "an unknown chain"}.`;
  }

  return "";
}

// Real Blockchain Mode is only attempted when a configured wallet is present and the
// app has a valid Sepolia contract address and RPC config. If the config is broken,
// the user is shown a precise diagnostic instead of a silent Demo Mode fallback.
export const REAL_MODE_AVAILABLE =
  typeof window !== "undefined" &&
  Boolean(window.ethereum) &&
  Boolean(CONTRACT_ADDRESS) &&
  Boolean(NETWORK_RPC_URL) &&
  Number.isFinite(CHAIN_ID) &&
  CHAIN_ID === SEPOLIA_CHAIN_ID;
