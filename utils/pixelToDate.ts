export const pixelToDate = (
   {dateList, range, pixel, containerWidth, fieldName}: {dateList: Date[], range: string, pixel: number, containerWidth: number, fieldName?: string}
  ) => {
    if (!dateList.length) return new Date();
    const firstDate = dateList[0];
    const totalDays = dateList.length;

    if (range === "Year") {
      const totalMonths = 12;
      const clampedPixel = Math.max(0, Math.min(pixel, containerWidth));
      const monthFraction = clampedPixel / containerWidth;
      const monthIndex = Math.round(monthFraction * totalMonths);
      const year = firstDate.getFullYear();

      if (fieldName === "endDate") {
        return new Date(year, Math.min(11, monthIndex), 0);
      }
      return new Date(year, Math.min(11, monthIndex), 1);
    }

    const dayIndex = Math.min(
      totalDays,
      Math.max(0, Math.round((pixel / containerWidth) * totalDays))
    );

    const calculatedDate = fieldName === "endDate" ? dateList[dayIndex-1] : dateList[dayIndex];
    return calculatedDate;
  };
