import React from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { useActive } from "app/utils/ActiveContext";

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
	const { setChange } = useActive()

	const handleChange = () => {
		setChange(true)
		if (!isEditing) return; // Ensure editing is allowed


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
