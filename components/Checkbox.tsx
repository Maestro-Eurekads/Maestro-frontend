import React, { useState } from 'react';
import { useCampaigns } from '../app/utils/CampaignsContext';

interface CheckboxProps {
	id: string;
	isEditing?: boolean;
	selectedOption: string;
	setSelectedOption: (option: string) => void;
	formId: string
}


const Checkbox: React.FC<CheckboxProps> = ({ id, isEditing, selectedOption, setSelectedOption, formId }) => {
	const isChecked = selectedOption === id;

	const { campaignFormData, setCampaignFormData } = useCampaigns();

	const handleChange = () => {
		if (isEditing) {
			setSelectedOption(id);
			setCampaignFormData((prev)=>({
				...prev,
				[formId]: id
			}))
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
