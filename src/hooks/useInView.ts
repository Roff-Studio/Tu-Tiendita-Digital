import { useState, useEffect, RefObject } from 'react';

/**
 * Custom hook to detect when an element is in the viewport
 * @param ref Reference to the element to observe
 * @param options IntersectionObserver options
 * @returns boolean indicating if the element is in view
 */
export function useInView(
  ref: RefObject<Element>,
  options: IntersectionObserverInit = { threshold: 0.1 }
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isInView;
}