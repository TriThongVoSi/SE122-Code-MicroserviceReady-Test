import { useEffect, useRef, useState, type RefObject } from "react";

export function useInView<T extends HTMLElement>(
  options: { threshold?: number; once?: boolean } = {},
): [RefObject<T>, boolean] {
  const { threshold = 0.15, once = true } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(
    typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, inView];
}
