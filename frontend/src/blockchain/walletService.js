import { ethers } from "ethers";
import { CHAIN_ID, getRealModeDiagnostic } from "./config.js";
import { randomHex } from "../utils/format.js";

// Demo Mode: no MetaMask required. Real Mode: talks to window.ethereum via ethers.js.
// The rest of the app never needs to know which mode produced a wallet address.

export async function getConnectedWalletInfo() {
  if (typeof window === "undefined" || !window.ethereum) {
    return { available: false, account: null, chainId: null };
  }

  const diagnostic = getRealModeDiagnostic();

  if (diagnostic) {
    throw new Error(diagnostic);
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_accounts", []);
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  if (!accounts || accounts.length === 0) {
    return { available: true, account: null, chainId };
  }

  if (chainId !== CHAIN_ID) {
    throw new Error(
      `Wallet is connected to chain ${chainId}, but this app is configured for Sepolia (chain ${CHAIN_ID}). ` +
        "Switch MetaMask to Sepolia and try again."
    );
  }

  return { available: true, account: accounts[0], chainId };
}

export async function connectWallet() {
  if (typeof window !== "undefined" && window.ethereum) {
    const info = await getConnectedWalletInfo();

    if (!info.account) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== CHAIN_ID) {
        throw new Error(
          `Wallet is connected to chain ${chainId}, but this app is configured for Sepolia (chain ${CHAIN_ID}). ` +
            "Switch MetaMask to Sepolia and try again."
        );
      }

      return { address: accounts[0], mode: "real" };
    }

    return { address: info.account, mode: "real" };
  }

  // Demo Mode fallback — simulate a connection so the flow is fully demonstrable
  // without MetaMask installed or a local node running.
  await new Promise((r) => setTimeout(r, 400));
  return { address: randomHex(20), mode: "demo" };
}
