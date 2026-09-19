import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
  id?: string;
}

const PULL_THRESHOLD = 65; // Distance in px to trigger refresh
const MAX_PULL = 110;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className = '',
  id = 'pull_to_refresh_container',
}) => {
  const { themeConfig } = useApp();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const container = containerRef.current;
    // Only allow pull-down if we are at the top of the scroll container
    if (container && container.scrollTop <= 2 && !isRefreshing) {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startYRef.current = clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current || startYRef.current === null || isRefreshing) return;

    const container = containerRef.current;
    if (container && container.scrollTop > 2) {
      isDraggingRef.current = false;
      setPullDistance(0);
      return;
    }

    const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      // Apply elastic friction formula
      const damping = 0.45;
      const distance = Math.min(MAX_PULL, diff * damping);
      setPullDistance(distance);

      // Prevent default pull navigation on mobile touch devices
      if ('touches' in e && diff > 10) {
        if (e.cancelable) {
          // allow passive or cancel if needed
        }
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(52); // Keep pinned at spinner height while refreshing

      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20);
        }
      } catch {}

      try {
        await onRefresh();
      } catch (err) {
        console.error('Refresh error:', err);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 400);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min(1, pullDistance / PULL_THRESHOLD);
  const rotation = isRefreshing ? 0 : progress * 240;

  return (
    <div
      id={id}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className={`relative overflow-y-auto flex flex-col flex-1 h-full select-none ${className}`}
      style={{
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Pull-to-Refresh Indicator Bubble (YouTube / Instagram style) */}
      <div
        id="pull_refresh_indicator"
        className="absolute left-1/2 -translate-x-1/2 z-40 flex items-center justify-center transition-all duration-150 pointer-events-none"
        style={{
          top: `${Math.max(8, pullDistance - 44)}px`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0,
          transform: `translateX(-50%) scale(${Math.min(1, 0.4 + progress * 0.6)})`,
        }}
      >
        <div
          className="w-10 h-10 rounded-full shadow-lg border flex items-center justify-center transition-transform"
          style={{
            backgroundColor: themeConfig.surfaceBase,
            borderColor: themeConfig.borderBase,
            color: themeConfig.accentColor,
          }}
        >
          {isRefreshing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : pullDistance >= PULL_THRESHOLD ? (
            <ArrowDown
              className="w-5 h-5 text-emerald-500 animate-bounce"
            />
          ) : (
            <ArrowDown
              className="w-4 h-4 transition-transform"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          )}
        </div>
      </div>

      {/* Children Content shifted slightly downwards when pulled */}
      <div
        className="flex-1 flex flex-col h-full transition-transform"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.45}px)` : 'none',
          transition: isDraggingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
