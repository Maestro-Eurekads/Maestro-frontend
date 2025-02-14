import React from 'react'
import mdEdit from "../public/line-md_edit.svg";
import blueSmallPlue from "../public/blueSmallPlue.svg";
import Image from 'next/image'

const EditInput = ({ label, islabelone, islabeltwo, islabelthree }: { label: string; options: string[]; islabelone: string, islabeltwo: string, islabelthree: string }) => {
	return (
		<div className="relative w-full">
			{/* Dropdown Button */}
			<label className="font-medium text-[15px] leading-5 text-gray-600 ">{islabelone || islabeltwo || islabelthree}</label>
			<div
				className="mt-[8px] flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer"
			>
				<span className="text-gray-600">{label}</span>
				<span className="ml-auto text-gray-500">
					<Image src={mdEdit} alt='nike' />

				</span>
			</div>
			<div className='flex items-center gap-2 mt-[8px]'>
				<Image src={blueSmallPlue} alt='blueSmallPlue' />
				<button className=" w-[28px] h-[19px] font-general-sans font-semibold text-[14px] leading-[19px] text-[#3175FF]"
				>Add</button>
			</div>
		</div>
	)
}

const EditInputs = ({ islabelone, islabeltwo, islabelthree }) => {
	return (
		<div className="flex  items-center gap-4 mt-[20px]">
			<EditInput label="Sport" options={["2022", "2023", "2024", "2025"]} islabelone={islabelone} islabeltwo={""} islabelthree={""} />
			<EditInput label="Business unit" options={["Q1", "Q2", "Q3", "Q4"]}
				islabelone={""} islabeltwo={islabeltwo} islabelthree={""} />
			<EditInput label="Business unit" options={["Electronics", "Fashion", "Home", "Sports"]}
				islabelone={""} islabeltwo={""} islabelthree={islabelthree} />
		</div>
	);
};

export default EditInputs