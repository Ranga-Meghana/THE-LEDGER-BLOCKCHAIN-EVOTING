import { ethers } from "ethers";
import { REAL_MODE_AVAILABLE, CHAIN_ID } from "./config.js";
import { randomHex } from "../utils/format.js";

// Demo Mode: no MetaMask required. Real Mode: talks to window.ethereum via ethers.js.
// The rest of the app never needs to know which mode produced a wallet address.

export async function connectWallet() {
  if (REAL_MODE_AVAILABLE) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== CHAIN_ID) {
      // Do NOT silently proceed against the wrong network — the configured
      // CONTRACT_ADDRESS almost certainly doesn't point at our contract on
      // whatever chain the wallet is actually connected to. Surface a clear,
      // actionable error instead of pretending this is Real Blockchain Mode.
      throw new Error(
        `Wallet is connected to chain ${network.chainId}, but this app is configured for chain ${CHAIN_ID}. ` +
          "Switch networks in your wallet and try again."
      );
    }
    return { address: accounts[0], mode: "real" };
  }
  // Demo Mode fallback — simulate a connection so the flow is fully demonstrable
  // without MetaMask installed or a local node running.
  await new Promise((r) => setTimeout(r, 400));
  return { address: randomHex(20), mode: "demo" };
}
