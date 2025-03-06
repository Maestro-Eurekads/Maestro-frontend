import React, { useState } from 'react';

interface CheckboxProps {
	id: string;
	isEditing?: boolean;
	selectedOption: string;
	setSelectedOption: (option: string) => void;
}


const Checkbox: React.FC<CheckboxProps> = ({ id, isEditing, selectedOption, setSelectedOption }) => {
	const isChecked = selectedOption === id;

	const handleChange = () => {
		if (isEditing) {
			setSelectedOption(id);
		}
	};

	return (
		<div className="container">
			<div className="round-checkbox">
				<input
					disabled={!isEditing}
					type="checkbox"
					id={id}
					checked={isChecked}
					onChange={handleChange}
				/>
				<label htmlFor={id}></label>
			</div>
		</div>
	);
};

export default Checkbox;
