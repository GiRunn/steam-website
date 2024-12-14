import { useEffect } from 'react';

/**
 * 检测点击元素外部的自定义 Hook
 * @param {React.RefObject} ref - 目标元素的 ref
 * @param {Function} handler - 点击外部时的回调函数
 * @param {Array} excludeRefs - 需要排除的其他元素的 ref 数组
 */
const useClickOutside = (ref, handler, excludeRefs = []) => {
  useEffect(() => {
    const listener = (event) => {
      // 检查是否点击了目标元素内部
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      // 检查是否点击了需要排除的元素
      const clickedOnExcluded = excludeRefs.some(
        (excludeRef) => excludeRef.current && excludeRef.current.contains(event.target)
      );

      if (clickedOnExcluded) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, excludeRefs]);
};

export default useClickOutside;