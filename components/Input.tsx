import React, { ChangeEvent } from 'react';

interface InputProps {
	value: string;
	handleOnChange: (event: ChangeEvent<HTMLInputElement>) => void;
	label: string;
	type: string;
	placeholder: string;
	required?: boolean
	disabled?: boolean
}

const Input: React.FC<InputProps> = ({ value, handleOnChange, label, type, disabled, placeholder, ...Props }) => {
	return (
		<div className="login-form-group">
			<div className='label_container'>
				<label htmlFor="firstName" className="label">{label}</label>
			</div>
			<input
				// id='settings-form-input'
				// className="login-form-input mt-2"
				className="flex items-center px-4 py-2 w-full h-[40px] bg-white border border-[#EFEFEF] rounded-[10px] cursor-pointer"
				type={type}
				disabled={disabled}
				placeholder={placeholder}
				value={value}
				onChange={handleOnChange}
				{...Props}
			/>
		</div>
	);
};

export default Input;
