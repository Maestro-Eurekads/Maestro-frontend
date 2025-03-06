"use client";
import React from "react";

const TextInput = ({
	label,
	isEditing,
}: {
	label: string;
	isEditing: boolean;
}) => {
	return (
		<div className="relative max-w-xs">
			{/* Input Field */}
			<input
				type="text"
				placeholder={label}
				className={`dropdown_button_width px-4 py-2 h-[45px] bg-white border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-100 placeholder-[#061237] ${isEditing ? "cursor-text" : "cursor-not-allowed"}`}
				disabled={!isEditing}
			/>
		</div>
	);
};

const ClientSelectionInput = ({
	label,
	isEditing,
}: {
	label: string;
	isEditing: boolean;
}) => {
	return (
		<div className="flex items-center gap-4 mt-[20px]">
			<TextInput label={label} isEditing={isEditing} />
		</div>
	);
};

export default ClientSelectionInput;