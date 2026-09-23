export function formatTimestamp(date) {
  const iso = date.toISOString();
  const day = iso.slice(0, 10).split("-").reverse().join(" ").toUpperCase();
  const time = iso.slice(11, 19);
  return `${day} — ${time}`;
}

export function randomHex(bytes = 20) {
  const chars = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < bytes * 2; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}
