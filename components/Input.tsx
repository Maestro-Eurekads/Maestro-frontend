import React, { ChangeEvent } from "react";

interface InputProps {
	value: string;
	handleOnChange: (event: ChangeEvent<HTMLInputElement>) => void;
	label: string;
	type: string;
	placeholder: string;
	required?: boolean;
	disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
	value,
	handleOnChange,
	label,
	type,
	disabled,
	placeholder,
	...props
}) => {
	return (
		<div className="w-full">
			<div className="label_container">
				<label htmlFor="input-field" className="font-medium text-[15px] leading-5 text-gray-600">
					{label}
				</label>
			</div>
			<input
				id="input-field"
				className="flex items-center px-4 py-2 w-full h-[40px] bg-white border border-[#EFEFEF] rounded-[10px] cursor-pointer mt-[8px] outline-none transition-all duration-300 
				focus:border-[#3176ff62]   focus:bg-[#f8fbff6d]"
				type={type}
				disabled={disabled}
				placeholder={placeholder}
				value={value}
				onChange={handleOnChange}
				{...props}
			/>
		</div>
	);
};

export default Input;
