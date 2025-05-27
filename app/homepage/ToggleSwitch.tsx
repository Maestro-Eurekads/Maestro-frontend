"use client"
import { useState } from "react";

interface ToggleSwitchProps {
	active: string;
	setActive: (value: string) => void;
}

export default function ToggleSwitch({ active, setActive }: ToggleSwitchProps) {


	return (
		<div className="relative flex items-center p-[3px] gap-[2px] w-[410px] h-[52px] bg-gray-200 rounded-[11px] overflow-hidden">
			<div
				className={`absolute top-1 bottom-1 left-[3px] w-[136px] bg-white rounded-[8px] transition-transform duration-300 shadow-md ${active === "Finance" ? "translate-x-[268px]" : active === "Dashboard" ? "translate-x-[130px]" : "translate-x-0"
					}`}
			></div>
			{["Overview", "Dashboard", "Finance"].map((label) => (
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


