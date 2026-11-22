import Lenis from "lenis";

let instance: Lenis | null = null;

export function startSmoothScroll() {
  if (instance || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  instance = new Lenis({
    autoRaf: true,
    duration: 1.15,
    // expo-out: quick response to input, long soft deceleration
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
}

export function stopSmoothScroll() {
  instance?.destroy();
  instance = null;
}

/** Scroll to a vertical position, smoothly unless `immediate` is set. */
export function scrollToY(y: number, immediate = false) {
  if (instance) instance.scrollTo(y, { immediate });
  else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}
