import React, { useState } from "react";
import Image from "next/image";
import left from "../public/left.svg";
import right from "../public/right.svg";
import moveright from "../public/lucide_move-right.svg";
import { useSelectedDates } from "../app/utils/SelectedDatesContext";

interface MultiDatePickerProps {
	isEditing: boolean;
}

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({ isEditing }) => {
	const weekdays = ["M", "T", "W", "T", "F", "S", "S"];
	const { selectedDates, setSelectedDates } = useSelectedDates();

	// Generate months dynamically
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

	const [monthOffset, setMonthOffset] = useState(0);
	const months = [getMonthData(monthOffset), getMonthData(monthOffset + 1)];

	// const [selectedDates, setSelectedDates] = useState<{
	// 	from: { day: number; month: number } | null;
	// 	to: { day: number; month: number } | null;
	// }>({
	// 	from: null,
	// 	to: null,
	// });

	console.log('selectedDates-selectedDates', selectedDates)

	// Handle Date Selection (Only if isEditing is true)
	const handleDateClick = (day: number, monthIndex: number) => {
		if (!isEditing) return;

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

	const resetDates = () => {
		if (isEditing) {
			setSelectedDates({ from: null, to: null });
		}
	};

	return (
		<div className={`flex flex-col items-start p-5 gap-5 w-[792px] bg-white border border-gray-200 rounded-lg mt-8 ${isEditing ? "" : " cursor-not-allowed"}`}>
			{/* Navigation */}
			<div className="flex justify-between w-full">
				<button
					className={`flex items-center gap-3 ${!isEditing ? "cursor-not-allowed " : ""}`}
					onClick={() => isEditing && setMonthOffset(monthOffset - 1)}
					disabled={!isEditing}
				>
					<Image src={left} alt="left" />
					<h6 className="font-semibold text-[16px] text-[#061237]">{months[0].name}</h6>
				</button>
				<button
					className={`flex items-center gap-3 ${!isEditing ? "cursor-not-allowed " : ""}`}
					onClick={() => isEditing && setMonthOffset(monthOffset + 1)}
					disabled={!isEditing}
				>
					<h6 className="font-semibold text-[16px] text-[#061237]">{months[1].name}</h6>
					<Image src={right} alt="right" />
				</button>
			</div>

			{/* Calendar */}
			<div className="flex w-full">
				{months.map((month, monthIndex) => (
					<div key={monthIndex} className={`w-1/2 p-2 ${monthIndex === 1 ? "border-l border-gray-200" : ""}`}>
						{/* Weekdays */}
						<div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-700">
							{weekdays.map((day, i) => (
								<div key={i} className="w-8 h-8 text-[16px] text-gray-400 mb-4">{day}</div>
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
										className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all
                      ${isSelected ? "bg-blue-500 text-white" : ""}
                      ${isInRange ? "bg-blue-200" : ""}
                      hover:bg-blue-100
                      ${!isEditing ? "cursor-not-allowed " : ""}`}
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
			<div className="flex flex-row items-end py-5 w-full h-28 justify-between border-t border-gray-100">
				<div className="flex items-center gap-5">
					<div>
						<h6 className="font-semibold text-[14px] text-[#061237]">From</h6>
						<button className="reset_dates_move">
							{selectedDates.from
								? `${String(selectedDates.from.day).padStart(2, "0")}-${String(selectedDates.from.month + 1).padStart(2, "0")}-${new Date().getFullYear().toString().slice(-2)}`
								: "Select date"}
						</button>
					</div>
					<Image src={moveright} alt="moveright" className="mt-5" />
					<div>
						<h6 className="font-semibold text-[14px] text-[#061237]">To</h6>
						<button className="reset_dates_move">
							{selectedDates.to
								? `${String(selectedDates.to.day).padStart(2, "0")}-${String(selectedDates.to.month + 1).padStart(2, "0")}-${new Date().getFullYear().toString().slice(-2)}`
								: "Select date"}
						</button>
					</div>

				</div>
				<button type="button" className={`reset_dates ${!isEditing ? "cursor-not-allowed " : ""}`} onClick={resetDates} disabled={!isEditing}>
					Reset dates
				</button>
			</div>
		</div>
	);
};

export default MultiDatePicker;
