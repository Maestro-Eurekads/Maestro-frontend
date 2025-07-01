"use client";

import React from "react";

const InternalVisibilityToggle = ({ selectedOption, setSelectedOption }) => {
	const handleToggle = () => setSelectedOption((prev: any) => !prev);

	return (
		<div className="flex items-center gap-3 mt-2">
			<label
				htmlFor="visibility-toggle"
				className="flex items-center cursor-pointer"
			>
				<div className="relative">
					<input
						id="visibility-toggle"
						type="checkbox"
						className="sr-only"
						checked={selectedOption}
						onChange={handleToggle}
					/>
					<div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner"></div>
					<div
						className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-300 ${selectedOption
							? "translate-x-5 bg-red-500"
							: "translate-x-0 bg-green-500"
							}`}
					/>
				</div>
				<span className="ml-3 text-sm font-medium text-gray-700">
					{selectedOption ? "Client" : "Internal"}
				</span>
			</label>
		</div>
	);
};

export default InternalVisibilityToggle;
