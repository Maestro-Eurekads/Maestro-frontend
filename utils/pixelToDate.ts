import {
  eachMonthOfInterval,
  eachWeekOfInterval,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";

export const pixelToDate = ({
  dateList,
  viewType,
  pixel,
  containerWidth,
  fieldName,
  dailyWidth,
}: {
  dateList: Date[];
  viewType: string;
  pixel: number;
  containerWidth: number;
  fieldName?: string;
  dailyWidth?: number;
}) => {
  if (!dateList.length) return new Date();
  const firstDate = dateList[0];
  const lastDate = dateList[dateList.length - 1];
  const totalDays = dateList.length;

  let adjustedPixel = pixel;
  if (fieldName === "endDate") {
    adjustedPixel = Math.max(0, pixel - 1);
  }

  if (viewType === "Year") {
    const monthWidth = dailyWidth || 80;
    const allMonths = eachMonthOfInterval({
      start: startOfMonth(firstDate),
      end: lastDate,
    });

    const monthIndex = Math.min(
      allMonths.length - 1,
      Math.max(0, Math.floor(adjustedPixel / monthWidth))
    );

    if (fieldName === "endDate") {
      const endMonth = allMonths[monthIndex];
      return new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0);
    }
    return startOfMonth(allMonths[monthIndex]);
  }

  if (viewType === "Month") {
    const weekWidth = dailyWidth || 100;
    const allWeeks = eachWeekOfInterval(
      { start: firstDate, end: lastDate },
      { weekStartsOn: 1 }
    );

    const weekIndex = Math.min(
      allWeeks.length - 1,
      Math.max(0, Math.floor(adjustedPixel / weekWidth))
    );

    if (fieldName === "endDate") {
      return endOfWeek(allWeeks[weekIndex], { weekStartsOn: 1 });
    }
    return startOfWeek(allWeeks[weekIndex], { weekStartsOn: 1 });
  }

  const unitWidth = dailyWidth || containerWidth / totalDays;
  const dayIndex = Math.min(
    totalDays - 1,
    Math.max(0, Math.floor(adjustedPixel / unitWidth))
  );

  const calculatedDate = dateList[dayIndex];
  return calculatedDate;
};
