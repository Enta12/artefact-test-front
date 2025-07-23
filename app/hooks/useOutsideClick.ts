import { useEffect, RefObject } from 'react';

export const useOutsideClick = (
  ref: RefObject<HTMLElement>,
  callback: () => void,
  excludeRefs: RefObject<HTMLElement>[] = []
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current || !(event.target instanceof Node)) return;

      const isClickInExcludedElement = excludeRefs.some(
        excludeRef => excludeRef.current && excludeRef.current.contains(event.target as Node)
      );

      if (!ref.current.contains(event.target as Node) && !isClickInExcludedElement) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, excludeRefs]);
}; 