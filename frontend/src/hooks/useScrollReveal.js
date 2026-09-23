import { useEffect } from "react";

// Adds the `.in` class to any `.reveal` element inside `ref` once it scrolls
// into view, powering the fade/slide-up entrance used across the landing page.
export function useScrollReveal(ref, deps = []) {
  useEffect(() => {
    const root = ref?.current || document;
    const targets = root.querySelectorAll(".reveal");
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
