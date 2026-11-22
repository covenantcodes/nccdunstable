import { useLayoutEffect } from "react";
import { animate, inView, type DOMKeyframesDefinition } from "motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]; // expo-out: fast start, long soft landing

/**
 * The library commits its final styles just after `finished` resolves, so wait
 * a moment before clearing them. A timer (not rAF) so it also runs in a
 * background tab.
 */
const afterCommit = (fn: () => void) => setTimeout(fn, 60);

type Variant = "up" | "heading" | "left" | "right" | "image" | "fade";

const VARIANTS: Record<Variant, DOMKeyframesDefinition> = {
  up: { opacity: [0, 1], y: [24, 0] },
  heading: { opacity: [0, 1], y: [28, 0], filter: ["blur(8px)", "blur(0px)"] },
  left: { opacity: [0, 1], x: [-32, 0] },
  right: { opacity: [0, 1], x: [32, 0] },
  image: {
    opacity: [0, 1],
    scale: [1.06, 1],
    clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
  },
  fade: { opacity: [0, 1] },
};

// Inline styles the animation library leaves behind. They are removed once an
// animation finishes so they cannot fight the CSS hover effects.
const LEFTOVERS = ["opacity", "transform", "translate", "scale", "filter", "clip-path", "will-change"];

/**
 * Scroll-triggered entrance animations built on the `motion` library.
 *
 * Mark an element with `data-reveal="up|heading|left|right|image|fade"`
 * (optionally `data-delay="0.2"` in seconds), or put `data-stagger="up"` on a
 * container to reveal its children one after another. Elements added later
 * (for example Firestore results) are picked up automatically.
 */
export function useScrollReveal() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stops = new Set<() => void>();
    const primed = new WeakSet<HTMLElement>();

    const prime = (el: HTMLElement, variant: Variant, delay: number) => {
      if (primed.has(el)) return;
      primed.add(el);
      el.dataset.rv = "hide";
      const keyframes = VARIANTS[variant] ?? VARIANTS.up;
      const stop = inView(
        el,
        () => {
          stop();
          stops.delete(stop);
          const controls = animate(el, keyframes, {
            duration: variant === "image" ? 1.3 : 1.05,
            delay,
            ease: EASE,
          });
          const cleanup = () => {
            delete el.dataset.rv;
            LEFTOVERS.forEach((prop) => el.style.removeProperty(prop));
          };
          controls.finished.then(() => afterCommit(cleanup), () => undefined);
        },
        { amount: 0.15, margin: "0px 0px -7% 0px" },
      );
      stops.add(stop);
    };

    const scanReveals = () => {
      document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((parent) => {
        Array.from(parent.children).forEach((child, i) =>
          prime(child as HTMLElement, (parent.dataset.stagger as Variant) || "up", (i % 4) * 0.09),
        );
      });
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) =>
        prime(el, (el.dataset.reveal as Variant) || "up", Number(el.dataset.delay || 0)),
      );
    };

    const split = (heading: HTMLElement) => {
      if (primed.has(heading)) return;
      primed.add(heading);
      const stop = inView(
        heading,
        () => {
          stop();
          stops.delete(stop);
          // Wait for the web font so line breaks are measured correctly, but
          // never let a slow font request keep a heading hidden.
          Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 1200)),
          ]).then(() => {
            const words = Array.from(heading.querySelectorAll<HTMLElement>(".sw"));
            // Group words into visual lines by their vertical position.
            const tops: number[] = [];
            const delays = words.map((word) => {
              const top = Math.round(word.offsetTop);
              let line = tops.findIndex((t) => Math.abs(t - top) < 6);
              if (line === -1) line = tops.push(top) - 1;
              return line;
            });
            const perLine: number[] = [];
            let finished = 0;
            words.forEach((word, i) => {
              const line = delays[i];
              perLine[line] = (perLine[line] ?? 0) + 1;
              const inner = word.firstElementChild as HTMLElement;
              animate(inner, { transform: ["translateY(118%)", "translateY(0%)"] }, {
                duration: 1.15,
                ease: EASE,
                delay: line * 0.14 + (perLine[line] - 1) * 0.03,
              }).finished.then(() => {
                if (++finished === words.length)
                  afterCommit(() => {
                    heading.dataset.lines = "done";
                    words.forEach((w) => {
                      (w.firstElementChild as HTMLElement).style.removeProperty("transform");
                      (w.firstElementChild as HTMLElement).style.removeProperty("translate");
                    });
                  });
              }, () => undefined);
            });
            if (!words.length) heading.dataset.lines = "done";
          });
        },
        { amount: 0.35, margin: "0px 0px -5% 0px" },
      );
      stops.add(stop);
    };

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-lines]").forEach(split);
      scanReveals();
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      stops.forEach((stop) => stop());
    };
  }, []);
}
