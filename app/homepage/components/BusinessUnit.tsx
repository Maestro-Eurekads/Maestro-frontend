"use client";

import React, { useState, useEffect } from "react";
import mdEdit from "../../../public/line-md_edit.svg";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import Image from "next/image";
import { MdOutlineCancel } from "react-icons/md";

const EditInput = ({
	placeholder,
	setInputs,
}: {
	placeholder: string;
	setInputs: any;
}) => {
	const [fields, setFields] = useState<{ id: number; text: string }[]>([
		{ id: 1, text: "" },
	]);

	// Sync fields with global state
	useEffect(() => {
		setInputs((prev: any) => ({
			...prev,
			businessUnits: fields.map((item) => item.text),
		}));
	}, [fields, setInputs]);

	// Handle adding a new field
	const handleAddField = () => {
		setFields((prev) => [...prev, { id: prev.length + 1, text: "" }]);
	};

	// Handle removing a field
	const handleRemoveField = (index: number) => {
		setFields((prev) => prev.filter((_, i) => i !== index));
	};

	// Handle clearing a field
	const handleClear = (index: number) => {
		setFields((prev) =>
			prev.map((item, i) => (i === index ? { ...item, text: "" } : item))
		);
	};

	// Handle input change
	const handleInputChange = (index: number, text: string) => {
		setFields((prev) =>
			prev.map((item, i) => (i === index ? { ...item, text } : item))
		);
	};

	return (
		<div className="relative w-full">
			{fields.map((item, i) => (
				<div key={item.id} className="mb-4">
					<label className="font-medium text-[15px] leading-5 text-gray-600">
						{placeholder}
					</label>
					<div className="mt-[8px] flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px]">
						<input
							type="text"
							className="w-full bg-transparent outline-none text-gray-600"
							placeholder={placeholder}
							value={item.text}
							onChange={(e) => handleInputChange(i, e.target.value)}
						/>
						<span className="ml-auto text-gray-500 cursor-pointer">
							<Image src={mdEdit} alt="edit" />
						</span>
					</div>

					<div className="flex items-center gap-2 mt-[8px]">
						{/* Add button */}
						<button
							onClick={handleAddField}
							className="flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
						>
							<Image src={blueSmallPlue} alt="add" />
							Add
						</button>

						{/* Clear button */}
						{item.text && (
							<button
								onClick={() => handleClear(i)}
								className="text-gray-500 font-semibold text-[14px]"
							>
								Clear
							</button>
						)}

						{/* Remove button (not for the first field) */}
						{i !== 0 && (
							<button onClick={() => handleRemoveField(i)}>
								<MdOutlineCancel size={18} color="red" />
							</button>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

const BusinessUnit = ({ setInputs }: { setInputs: any }) => {
	return (
		<div className="flex flex-col gap-4 mt-[20px]">
			<EditInput placeholder="Business Unit" setInputs={setInputs} />
		</div>
	);
};

export default BusinessUnit;
