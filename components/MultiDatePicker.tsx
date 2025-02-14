import React, { useState } from "react";
import Image from "next/image";
import left from "../public/left.svg";
import right from "../public/right.svg";

const MultiDatePicker: React.FC = () => {
	const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

	// Generate months dynamically based on offset
	const getMonthData = (offset: number) => {
		const today = new Date();
		const baseDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
		const year = baseDate.getFullYear();
		const month = baseDate.getMonth();
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		return {
			name: baseDate.toLocaleString("default", { month: "long", year: "numeric" }),
			days: daysInMonth,
			startDay: firstDay === 0 ? 6 : firstDay - 1, // Adjust for Monday start
			monthIndex: month,
			year,
		};
	};

	// State for month offset (default: current & next month)
	const [monthOffset, setMonthOffset] = useState(0);

	// Generate the two months based on offset
	const months = [getMonthData(monthOffset), getMonthData(monthOffset + 1)];

	// State for selected dates
	const [selectedDates, setSelectedDates] = useState<{ from: { day: number; month: number } | null; to: { day: number; month: number } | null }>({
		from: null,
		to: null,
	});

	// Handle Date Selection
	const handleDateClick = (day: number, monthIndex: number) => {
		const newDate = { day, month: monthIndex };

		if (!selectedDates.from || (selectedDates.from && selectedDates.to)) {
			setSelectedDates({ from: newDate, to: null });
		} else if (
			selectedDates.from &&
			(newDate.month > selectedDates.from.month || (newDate.month === selectedDates.from.month && newDate.day > selectedDates.from.day))
		) {
			setSelectedDates((prev) => ({ ...prev, to: newDate }));
		} else {
			setSelectedDates({ from: newDate, to: null });
		}
	};

	// Reset Dates
	const resetDates = () => setSelectedDates({ from: null, to: null });

	return (
		<div className="flex flex-col items-start p-[21.62px] gap-[21.62px] w-[791.89px] bg-white border border-[rgba(23,22,25,0.1)] rounded-[10.81px] mt-[32px]">
			{/* Navigation */}
			<div className="flex justify-between w-full">
				<button className="flex items-center gap-3" onClick={() => setMonthOffset(monthOffset - 1)}>
					<Image src={left} alt="left" />
					<h6 className="font-[600] text-[16.22px] leading-[22px] text-[#061237]">{months[0].name}</h6>
				</button>
				<button className="flex items-center gap-3" onClick={() => setMonthOffset(monthOffset + 1)}>
					<h6 className="font-[600] text-[16.22px] leading-[22px] text-[#061237]">{months[1].name}</h6>
					<Image src={right} alt="right" />
				</button>
			</div>

			{/* Calendar */}
			<div className="flex w-full">
				{months.map((month, monthIndex) => (
					<div
						key={monthIndex}
						className={`w-full md:w-1/2 p-2 ${monthIndex === 1 ? "md:border-l border-[rgba(23,22,25,0.1)]" : ""}`}
					>
						{/* Weekdays */}
						<div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-700">
							{weekdays.map((day, i) => (
								<div key={i} className="w-[27.03px] h-[22px] font-[500] text-[16.22px] leading-[22px] text-center text-[rgba(23,22,25,0.4)] mb-[20px]"
								>{day}</div>
							))}
						</div>

						{/* Days Grid */}
						<div className="grid grid-cols-7 gap-2 text-center mt-2">
							{/* Empty spaces for the starting day */}
							{Array.from({ length: month.startDay }).map((_, i) => (
								<div key={i}></div>
							))}

							{/* Render Days */}
							{Array.from({ length: month.days }).map((_, i) => {
								const day = i + 1;
								const isSelected =
									(selectedDates.from?.day === day && selectedDates.from?.month === month.monthIndex) ||
									(selectedDates.to?.day === day && selectedDates.to?.month === month.monthIndex);

								const isInRange =
									selectedDates.from &&
									selectedDates.to &&
									(month.monthIndex > selectedDates.from.month ||
										(month.monthIndex === selectedDates.from.month && day > selectedDates.from.day)) &&
									(month.monthIndex < selectedDates.to.month ||
										(month.monthIndex === selectedDates.to.month && day < selectedDates.to.day));

								return (
									<div
										key={day}
										className={`className=" font-[500] text-[16px] leading-[22px] text-center text-[#171619]"
w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all
                      ${isSelected ? "bg-blue-500 text-white" : ""}
                      ${isInRange ? "bg-blue-200" : ""}
                      hover:bg-blue-100`}
										onClick={() => handleDateClick(day, month.monthIndex)}
									>
										{day}
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>

			{/* Date Selection & Reset */}
			<div className="selection_reset flex flex-row items-end py-[21.62px] w-full h-[108.27px] justify-between 
			border-t-[1.35px] border-[rgba(23, 22, 25, 0.04)]">
				<div className="flex items-center gap-[20px] ">
					<div>
						<h6 className="w-[34px] h-[18px] font-semibold text-[13.51px] leading-[18px] text-[#061237]">From</h6>
						<button className="reset_dates_move">
							{selectedDates.from ? `${months.find(m => m.monthIndex === selectedDates.from?.month)?.name} ${selectedDates.from.day}` : "Select date"}
						</button>
					</div>
					<div>
						<h6 className="w-[34px] h-[18px] font-semibold text-[13.51px] leading-[18px] text-[#061237]">To</h6>
						<button className="reset_dates_move">
							{selectedDates.to ? `${months.find(m => m.monthIndex === selectedDates.to?.month)?.name} ${selectedDates.to.day}` : "Select date"}
						</button>
					</div>
				</div>
				<button type="button" className="reset_dates" onClick={resetDates}>
					Reset dates
				</button>
			</div>
		</div>
	);
};

export default MultiDatePicker;



