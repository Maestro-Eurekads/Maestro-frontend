"use client"
import { useState } from "react";

export default function ToggleSwitch({ active, setActive }) {
	// const [active, setActive] = useState("Overview");

	return (
		<div className="relative flex items-center p-[3px] gap-[2px] w-[136px] h-[52px] bg-gray-200 rounded-[11px] overflow-hidden">
			{/* <div
				className={`absolute top-1 bottom-1 left-[3px] w-[136px] bg-white rounded-[8px] transition-transform duration-300 shadow-md ${active === "Table View" ? "translate-x-[143px]" : "translate-x-0"
					}`}
			></div> */}
			{["Table View"].map((label) => (
				<button
					key={label}
					onClick={() => setActive(label)}
					className="flex-1 text-center py-2 text-lg font-medium relative z-10"
				>
					{label}
				</button>
			))}
		</div>
	);
}


