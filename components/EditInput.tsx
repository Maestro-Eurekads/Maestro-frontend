import React from 'react'
import mdEdit from "../public/line-md_edit.svg";
import Image from 'next/image'

const EditInput = ({ label }: { label: string; options: string[] }) => {
	return (
		<div className="relative w-full"   >
			{/* Dropdown Button */}
			<div
				className="flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer"

			>
				<span className="text-gray-600"> {label}</span>
				<span className="ml-auto text-gray-500">
					<Image src={mdEdit} alt='nike' />
				</span>
			</div>


		</div>
	)
}

const EditInputs = () => {
	return (
		<div className="flex  items-center gap-4 mt-[20px] ">
			<EditInput label="Business level 1" options={["2022", "2023", "2024", "2025"]} />
			<EditInput label="Business level 2" options={["Q1", "Q2", "Q3", "Q4"]} />
			<EditInput label="Business level 3" options={["Electronics", "Fashion", "Home", "Sports"]} />
		</div>
	);
};

export default EditInputs