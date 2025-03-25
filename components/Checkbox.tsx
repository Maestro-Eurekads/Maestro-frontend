import React from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";

interface CheckboxProps {
	id: string;
	isEditing?: boolean;
	selectedOption: string;
	setSelectedOption: (option: string) => void;
	formId: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
	id,
	isEditing = true, // Default to true if not provided
	selectedOption,
	setSelectedOption,
	formId,
}) => {
	const isChecked = selectedOption === id;
	const { campaignFormData, setCampaignFormData } = useCampaigns();

	const handleChange = () => {
		if (!isEditing) return; // Ensure editing is allowed

		console.log(`Checkbox clicked: ${id}`);
		setSelectedOption(id); // Update local state
		setCampaignFormData((prev) => ({
			...prev,
			[formId]: id, // Update global form state
		}));
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
