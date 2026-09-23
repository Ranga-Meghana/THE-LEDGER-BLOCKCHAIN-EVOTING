import React, { useEffect, useRef } from "react";

// Lightweight animated network of nodes used behind the hero section.
// Respects prefers-reduced-motion by rendering a single static frame.
export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w, h, nodes, raf;

    function resize() {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    function makeNodes() {
      const count = Math.min(70, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 16000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        r: Math.random() * 1.6 + 0.6,
      }));
    }
    resize();
    makeNodes();
    const onResize = () => {
      resize();
      makeNodes();
    };
    window.addEventListener("resize", onResize);

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130 * devicePixelRatio) {
            ctx.strokeStyle = `rgba(139,92,246,${0.14 * (1 - d / (130 * devicePixelRatio))})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(196,178,255,0.55)";
        ctx.fill();
      }
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas id="hero-canvas" ref={canvasRef}></canvas>;
}
