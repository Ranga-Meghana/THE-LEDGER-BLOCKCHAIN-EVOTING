import { useVoting } from "../context/VotingContext.jsx";

// Thin, purpose-named slice of the voting context for components that only
// care about wallet state, so they don't need to import the whole context API.
export function useWallet() {
  const { wallet, connectWallet, disconnectWallet } = useVoting();
  return { wallet, connectWallet, disconnectWallet, isConnected: Boolean(wallet) };
}
