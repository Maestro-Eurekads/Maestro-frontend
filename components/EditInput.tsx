'use client';

import React, { useState } from 'react';
import mdEdit from '../public/line-md_edit.svg';
import blueSmallPlue from '../public/blueSmallPlue.svg';
import Image from 'next/image';

const EditInput = ({ placeholder }: { placeholder: string }) => {
	const [value, setValue] = useState('');

	return (
		<div className="relative w-full">
			<label className="font-medium text-[15px] leading-5 text-gray-600">{placeholder}</label>
			<div className="mt-[8px] flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer">
				<input
					type="text"
					className="w-full bg-transparent outline-none text-gray-600"
					placeholder={placeholder}
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
				<span className="ml-auto text-gray-500 cursor-pointer"  >
					<Image src={mdEdit} alt='edit' />
				</span>
			</div>
			<div className='flex items-center gap-2 mt-[8px]'>
				<Image src={blueSmallPlue} alt='add' />
				<button className="w-[28px] h-[19px] font-semibold text-[14px] leading-[19px] text-[#3175FF]">Add</button>
			</div>
		</div>
	);
};

const EditInputs = ({ setInputs }) => {
	return (
		<div className="flex items-center gap-4 mt-[20px]">
			<EditInput placeholder="Sport" />
			<EditInput placeholder="Business Unit" />
			<EditInput placeholder="Category" />
		</div>
	);
};

export default EditInputs;
