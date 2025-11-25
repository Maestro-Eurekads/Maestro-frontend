import React, { ChangeEvent } from "react";

interface InputProps {
	value: string;
	handleOnChange: (event: ChangeEvent<HTMLInputElement>) => void;
	label: string;
	type: string;
	placeholder: string;
	disabled?: boolean;
	required?: boolean;
}

const Input: React.FC<InputProps> = ({
	value,
	handleOnChange,
	label,
	type,
	placeholder,
	disabled,
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
				className="flex items-center px-4 py-2 w-full h-[40px] bg-white border border-[#EFEFEF] rounded-[10px] mt-[8px] outline-none transition-all duration-300"
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
