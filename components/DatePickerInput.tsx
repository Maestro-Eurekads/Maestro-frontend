import React, { ChangeEvent } from "react";

interface DatePickerInputProps {
	value: string;
	handleOnChange: (event: ChangeEvent<HTMLInputElement>) => void;
	label: string;
	placeholder: string;
	type: string;
	required?: boolean;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
	value,
	handleOnChange,
	label,
	placeholder,
	type,
	...props
}) => {
	return (
		<div className="w-full">
			<div className="label_container">
				<label htmlFor="date-input" className="font-medium text-[15px] leading-5 text-gray-600">
					{label}
				</label>
			</div>
			<input
				id="date-input"
				className="flex items-center px-4 py-2 w-full h-[40px] bg-white border border-[#EFEFEF] rounded-[10px] cursor-pointer mt-[8px] outline-none transition-all duration-300 
				focus:border-[#3176ff62]   focus:bg-[#f8fbff6d]"
				type="date"
				placeholder={placeholder}
				value={value}
				onChange={handleOnChange}
				{...props}
			/>
		</div>
	);
};

export default DatePickerInput;
