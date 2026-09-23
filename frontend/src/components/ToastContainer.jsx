import React from "react";
import { useVoting } from "../context/VotingContext.jsx";

export default function ToastContainer() {
  const { toasts } = useVoting();
  return (
    <div id="toast-container">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
