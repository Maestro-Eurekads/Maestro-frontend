import { useState, useRef, useCallback } from 'react';

/**
 * useChannelTimeline
 * ------------------------------------------------------------
 * A grid-cell based timeline helper for a single channel bar.
 * All geometry is stored as integer cell indices, shielding the
 * UI from browser zoom / layout rounding errors.
 *
 * Props:
 *   totalCells   – number of columns visible (dateList.length or 12 for Year)
 *   containerLeft – pixel offset of the timeline grid from the viewport
 *   containerWidth – pixel width of the timeline grid
 *   initialStartIdx / initialEndIdx – starting cell indices
 *   onChange(startIdx, endIdx) – called continuously during drag / resize
 *   onCommit(startIdx, endIdx) – called once when gesture ends
 */
export function useChannelTimeline({
  totalCells,
  containerLeft,
  containerWidth,
  initialStartIdx,
  initialEndIdx,
  onChange,
  onCommit,
}: {
  totalCells: number;
  containerLeft: number;
  containerWidth: number;
  initialStartIdx: number;
  initialEndIdx: number;
  onChange?: (s: number, e: number) => void;
  onCommit?: (s: number, e: number) => void;
}) {
  const [startIdx, setStartIdx] = useState(initialStartIdx);
  const [endIdx, setEndIdx] = useState(initialEndIdx);

  const gestureRef = useRef<{
    mode: 'drag' | 'resize-left' | 'resize-right';
    startMouseX: number;
    startStartIdx: number;
    startEndIdx: number;
  } | null>(null);

  const cellWidth = containerWidth / totalCells;

  const indexToPixel = (idx: number) => containerLeft + idx * cellWidth;

  const pixelToIndex = (px: number) => {
    const rel = px - containerLeft;
    return Math.min(totalCells - 1, Math.max(0, Math.round(rel / cellWidth)));
  };

  /* ----------------------------------------------------------------------
   * Event bindings
   * --------------------------------------------------------------------*/
  const beginDrag = useCallback((clientX: number) => {
    gestureRef.current = {
      mode: 'drag',
      startMouseX: clientX,
      startStartIdx: startIdx,
      startEndIdx: endIdx,
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [startIdx, endIdx]);

  const beginResize = useCallback((edge: 'left' | 'right', clientX: number) => {
    gestureRef.current = {
      mode: edge === 'left' ? 'resize-left' : 'resize-right',
      startMouseX: clientX,
      startStartIdx: startIdx,
      startEndIdx: endIdx,
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [startIdx, endIdx]);

  const handleMove = useCallback((e: MouseEvent) => {
    if (!gestureRef.current) return;
    const { mode, startMouseX, startStartIdx, startEndIdx } = gestureRef.current;
    const deltaPx = e.clientX - startMouseX;
    const deltaIdx = Math.round(deltaPx / cellWidth);

    let nextStart = startStartIdx;
    let nextEnd = startEndIdx;

    if (mode === 'drag') {
      nextStart = Math.max(0, Math.min(totalCells - 1, startStartIdx + deltaIdx));
      nextEnd = Math.max(nextStart + 1, Math.min(totalCells, startEndIdx + deltaIdx));
    } else if (mode === 'resize-left') {
      nextStart = Math.max(0, Math.min(startEndIdx - 1, startStartIdx + deltaIdx));
    } else if (mode === 'resize-right') {
      nextEnd = Math.max(startStartIdx + 1, Math.min(totalCells, startEndIdx + deltaIdx));
    }

    setStartIdx(nextStart);
    setEndIdx(nextEnd);
    onChange?.(nextStart, nextEnd);
  }, [cellWidth, totalCells, onChange]);

  const handleUp = useCallback(() => {
    if (!gestureRef.current) return;
    onCommit?.(startIdx, endIdx);
    gestureRef.current = null;
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleUp);
  }, [startIdx, endIdx, onCommit]);

  /* ---------------------------------------------------------------------- */
  return {
    startIdx,
    endIdx,
    cellWidth,
    indexToPixel,
    beginDrag,
    beginResize,
  } as const;
} 