import { useState, useCallback, useEffect } from 'react';

interface TouchState {
  startX: number;
  startY: number;
  isSwiping: boolean;
}

export const useTouchGestures = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    isSwiping: false
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchState({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      isSwiping: true
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchState.isSwiping) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchState.startX;
    const diffY = currentY - touchState.startY;

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault(); // Prevent scrolling while swiping
    }
  }, [touchState]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchState.isSwiping) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchState.startX;
    const diffY = endY - touchState.startY;

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 50) {
        onSwipeRight();
      } else if (diffX < -50) {
        onSwipeLeft();
      }
    }

    setTouchState(prev => ({ ...prev, isSwiping: false }));
  }, [touchState, onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const element = document.body;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
}; 