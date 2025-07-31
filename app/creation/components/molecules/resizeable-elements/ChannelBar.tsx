import React, { useMemo } from 'react';
import { format, parseISO, isEqual } from 'date-fns';
import Image from 'next/image';
import { MdDragHandle } from 'react-icons/md';
import { useChannelTimeline } from './useChannelTimeline';

interface ChannelBarProps {
  channel: any;
  parentLeft: number;
  containerWidth: number;
  dateList: Date[];
  range: 'Day' | 'Week' | 'Month' | 'Year';
  onCommit: (startDate: string, endDate: string) => void;
}

export const ChannelBar: React.FC<ChannelBarProps> = ({
  channel,
  parentLeft,
  containerWidth,
  dateList,
  range,
  onCommit,
}) => {
  /* ---------------------------------------------------------------------- */
  // Convert saved start / end dates to grid indices
  const totalCells = range === 'Year' ? 12 : dateList.length;

  const initialIndices = useMemo(() => {
    const findIndex = (dateStr?: string) => {
      if (!dateStr) return 0;
      if (range === 'Year') {
        // month index
        const d = parseISO(dateStr);
        return d.getMonth();
      }
      const idx = dateList.findIndex((d) => format(d, 'yyyy-MM-dd') === dateStr);
      return idx === -1 ? 0 : idx;
    };

    const sIdx = findIndex(channel.start_date);
    const eIdx = Math.max(sIdx + 1, findIndex(channel.end_date));
    return { sIdx, eIdx };
  }, [channel.start_date, channel.end_date, dateList, range]);

  /* ---------------------------------------------------------------------- */
  const {
    startIdx,
    endIdx,
    cellWidth,
    indexToPixel,
    beginDrag,
    beginResize,
  } = useChannelTimeline({
    totalCells,
    containerLeft: parentLeft,
    containerWidth,
    initialStartIdx: initialIndices.sIdx,
    initialEndIdx: initialIndices.eIdx,
    onChange: () => {},
    onCommit: (s, e) => {
      const startDate =
        range === 'Year'
          ? format(new Date(new Date().getFullYear(), s, 1), 'yyyy-MM-dd')
          : format(dateList[s], 'yyyy-MM-dd');
      const endDate =
        range === 'Year'
          ? format(new Date(new Date().getFullYear(), e, 0), 'yyyy-MM-dd')
          : format(dateList[e], 'yyyy-MM-dd');
      onCommit(startDate, endDate);
    },
  });

  /* ---------------------------------------------------------------------- */
  const leftPx = indexToPixel(startIdx);
  const widthPx = (endIdx - startIdx + 1) * cellWidth;

  return (
    <div
      className="relative"
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
      onMouseDown={(e) => beginDrag(e.clientX)}
    >
      <div
        className="absolute top-0 left-0 h-full w-2 cursor-ew-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          beginResize('left', e.clientX);
        }}
      >
        <MdDragHandle className="rotate-90" />
      </div>
      <div
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          beginResize('right', e.clientX);
        }}
      >
        <MdDragHandle className="rotate-90" />
      </div>
      <div className="h-full flex items-center justify-center bg-blue-500 text-white rounded-lg">
        {channel.name}
      </div>
    </div>
  );
}; 