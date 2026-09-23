import React from "react";

export default function StatsCard({ value, label }) {
  return (
    <div className="stat">
      <div className="k">{value}</div>
      <div className="l">{label}</div>
    </div>
  );
}
