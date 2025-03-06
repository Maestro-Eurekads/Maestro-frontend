import React, { useState } from 'react';

interface CheckboxProps {
	id: string;
	isEditing?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, isEditing }) => {
	const [isChecked, setIsChecked] = useState(false);

	const handleChange = () => {
		setIsChecked(!isChecked);
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
