import React from "react";
import Image from "next/image";
import left from "../public/left.svg";
import right from "../public/right.svg";

interface MultiDatePickerProps {
	setState: React.Dispatch<React.SetStateAction<boolean>>;
	state: boolean;
}

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({ setState, state }) => {
	const months: { name: string; days: number; startDay: number }[] = [
		{ name: "June 2024", days: 30, startDay: 6 }, // June starts on Saturday
		{ name: "July 2024", days: 31, startDay: 1 }, // July starts on Monday
	];

	const weekdays: string[] = ["M", "T", "W", "T", "F", "S", "S"];

	return (
		<div className="flex flex-col items-start p-[21.62px] gap-[21.62px] w-[791.89px] bg-white border border-[rgba(23,22,25,0.1)] rounded-[10.81px] mt-[32px]">
			<div className="flex flex-col items-center bg-white p-6 rounded-lg w-[700px]">
				<div className="flex justify-between w-full mb-[20px]">
					<div className="flex w-full justify-between">
						<button className="flex items-center gap-3">
							<Image src={left} alt="left" />
							<h6 className="font-[600] text-[16.22px] leading-[22px] text-[#061237]">June 2024</h6>
						</button>
						<button className="flex items-center gap-3">
							<h6 className="font-[600] text-[16.22px] leading-[22px] text-[#061237]">July 2024</h6>
							<Image src={right} alt="right" />
						</button>
					</div>
				</div>

				<div className="flex w-full">
					{months.map((month, index) => (
						<div key={index} className="w-1/2 p-2">
							<div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-700">
								{weekdays.map((day, i) => (
									<div key={i} className="text-gray-500">{day}</div>
								))}
							</div>

							<div className="grid grid-cols-7 gap-2 text-center mt-2">
								{/* Empty spaces for the starting day */}
								{Array.from({ length: month.startDay }).map((_, i) => (
									<div key={i}></div>
								))}

								{/* Render Days */}
								{Array.from({ length: month.days }).map((_, i) => (
									<div
										key={i}
										className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 cursor-pointer"
									>
										{i + 1}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="flex flex-row items-end py-[21.62px] w-full h-[108.27px] justify-between">
				<div className="flex items-center gap-[20px]">
					<div>
						<h6 className="w-[34px] h-[18px] font-semibold text-[13.51px] leading-[18px] text-[#061237]">From</h6>
						<button className="reset_dates_move">Select date</button>
					</div>
					<div>
						<h6 className="w-[34px] h-[18px] font-semibold text-[13.51px] leading-[18px] text-[#061237]">To</h6>
						<button className="reset_dates_move">Select date</button>
					</div>
				</div>
				<button type="button" className="reset_dates" onClick={() => setState(!state)}>Reset dates</button>
			</div>
		</div>
	);
};

export default MultiDatePicker;
