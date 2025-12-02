import { eachMonthOfInterval, startOfYear, endOfYear, startOfMonth } from "date-fns";

export const pixelToDate = (
   {dateList, range, pixel, containerWidth, fieldName, dailyWidth}: {dateList: Date[], range: string, pixel: number, containerWidth: number, fieldName?: string, dailyWidth?: number}
  ) => {
    if (!dateList.length) return new Date();
    const firstDate = dateList[0];
    const totalDays = dateList.length;

    if (range === "Year") {
      const monthWidth = dailyWidth || 80;
      const timelineStart = startOfYear(firstDate);
      const timelineEnd = endOfYear(dateList[dateList.length - 1]);
      const allMonths = eachMonthOfInterval({ start: timelineStart, end: timelineEnd });
      
      let adjustedPixel = pixel;
      if (fieldName === "endDate") {
        adjustedPixel = Math.max(0, pixel - 1);
      }
      
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

    const unitWidth = dailyWidth || (containerWidth / totalDays);
    
    let adjustedPixel = pixel;
    if (fieldName === "endDate") {
      adjustedPixel = Math.max(0, pixel - 1);
    }
    
    const dayIndex = Math.min(
      totalDays - 1,
      Math.max(0, Math.floor(adjustedPixel / unitWidth))
    );

    const calculatedDate = dateList[dayIndex];
    return calculatedDate;
  };
