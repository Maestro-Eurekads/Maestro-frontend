"use client";

import React, { useState, useEffect } from "react";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import Image from "next/image";
import { MdOutlineCancel } from "react-icons/md";

const BusinessUnitGroup = ({ onUpdate, setAlert, label, initial = [], onRemove }) => {
	const [fields, setFields] = useState(
		initial.length > 0 ? initial.map((text, i) => ({ id: i + 1, text })) : [{ id: 1, text: "" }]
	);

	useEffect(() => {
		onUpdate(fields.map((f) => f.text));
	}, [fields]);

	const handleAddField = () => {
		if (fields.length >= 5) {
			setAlert({
				variant: "warning",
				message: "Maximum 5 business units allowed",
				position: "bottom-right",
			});
			return;
		}
		if (!fields[fields.length - 1].text.trim()) {
			setAlert({
				variant: "error",
				message: "Business unit name cannot be empty",
				position: "bottom-right",
			});
			return;
		}
		setFields((prev) => [...prev, { id: prev.length + 1, text: "" }]);
	};

	const handleRemoveField = (index) => {
		setFields((prev) => prev.filter((_, i) => i !== index));
	};

	const handleInputChange = (index, text) => {
		setFields((prev) =>
			prev.map((item, i) => (i === index ? { ...item, text } : item))
		);
	};

	return (
		<div className="relative w-full rounded-lg p-4 mb-4">
			<label className="font-medium text-[15px] text-gray-600">
				{label}
			</label>

			{fields.map((field, index) => (
				<div
					key={field.id}
					className={`mt-[8px] flex items-center px-4 py-2 h-[40px] border border-[#EFEFEF] rounded-[10px] ${index > 0 ? "ml-4 w-[85%]" : "w-full"
						}`}
				>
					<input
						type="text"
						className="w-full bg-transparent outline-none text-gray-600"
						placeholder={index === 0 ? "Business Level 2" : `Parameter ${index}`}
						value={field.text}
						onChange={(e) => handleInputChange(index, e.target.value)}
					/>
					{fields.length > 1 && (
						<MdOutlineCancel
							size={18}
							color="red"
							onClick={() => handleRemoveField(index)}
							className="cursor-pointer"
						/>
					)}
				</div>
			))}

			<div className="flex items-center gap-2 mt-[8px]">
				<button
					onClick={handleAddField}
					className="flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
				>
					<Image src={blueSmallPlue} alt="add" />
					Add parameter
				</button>
			</div>

			{onRemove && (
				<button
					onClick={onRemove}
					className="absolute top-2 right-2 text-sm text-red-500"
				>
					Remove
				</button>
			)}
		</div>
	);
};

export default BusinessUnitGroup;
