"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import symbol from "../public/material-symbols_campaign-rounded.svg";
import funnel from "../public/ant-design_funnel-plot-filled.svg";
import channel from "../public/icon-park-solid_web-page.svg";
import devicefill from "../public/device-fill.svg";
import basket from "../public/bxs_basket.svg";
import click from "../public/fluent_cursor-click-24-filled.svg";
import workbench from "../public/icon-park-solid_workbench.svg";
import checkfill from "../public/mingcute_check-fill.svg";
import Calender from "../public/Calender.svg";
import { useActive } from "../app/utils/ActiveContext";

const steps = [
	{
		vl: "vl",
		vl_done: "vl_done",
		vl_active: "vl_active",
		state_text: "SideBar_Menu_state",
		sidecircle: "SideBar_Menu_active",
		title: "Define campaign objective",
		objective: "Main objective: Purchase",
		img: <Image src={symbol} alt="symbol" />
	},
	{
		vl: "vl",
		vl_done: "vl_done",
		vl_active: "vl_active",
		state_text: "SideBar_Menu_state",
		sidecircle: "SideBar_Menu_active",
		title: "Map funnel stages",
		objective: "Awareness · Consideration · Conversion",
		img: <Image src={funnel} alt="funnel" />
	},
	{
		vl: "vl",
		vl_done: "vl_done",
		vl_active: "vl_active",
		state_text: "SideBar_Menu_state",
		sidecircle: "SideBar_Menu_active",
		title: "Select channel mix",
		img: <Image src={channel} alt="channel" />
	},
	{
		vl: "vl",
		vl_done: "vl_done",
		vl_active: "vl_active",
		state_text: "SideBar_Menu_state",
		sidecircle: "SideBar_Menu_active",
		title: "Formats selection",
		img: <Image src={devicefill} alt="devicefill" />
	},
	{
		vl: "vl",
		vl_done: "vl_done",
		vl_active: "vl_active",
		state_text: "SideBar_Menu_state",
		sidecircle: "SideBar_Menu_active",
		title: "Set buy objectives and types",
		img: <Image src={basket} alt="basket" />
	},
	{
		vl: "vls",
		vl_done: "vl_dones",
		vl_active: "vl_actives",
		state_text: "SideBar_Menu_state_sub",
		sidecircle: "SideBar_Menu_active_sub",
		title: "Mid-recap",
		// img: <Image src={basket} alt="basket" />
	},
	{
		vl: "vl",
		vl_done: "vl_done",
		vl_active: "vl_active",
		state_text: "SideBar_Menu_state",
		sidecircle: "SideBar_Menu_active",
		title: "Plan campaign schedule",
		img: <Image src={Calender} alt="click" />
	},
	{
		vl: "vl",
		vl_done: "vl_done",
		vl_active: "vl_active",
		state_text: "SideBar_Menu_state",
		sidecircle: "SideBar_Menu_active",
		title: "Configure ad sets and budget",
		img: <Image src={click} alt="click" />
	},
	{
		vl: "vl",
		vl_done: "vl_done",
		vl_active: "vl_active",
		state_text: "SideBar_Menu_state",
		sidecircle: "SideBar_Menu_active",
		title: "Establish goals",
		img: <Image src={workbench} alt="workbench" />
	},
	{
		vl: "vl",
		vl_done: "vl_done",
		vl_active: "vl_active",
		state_text: "SideBar_Menu_state",
		sidecircle: "SideBar_Menu_active",
		title: "Overview of your campaign",
		img: <Image src={checkfill} alt="checkfill" />
	},
];



const CreationFlowActive = () => {
	const { active } = useActive();
	const [hydrated, setHydrated] = useState(false);

	// Ensure component is mounted before rendering
	useEffect(() => {
		setHydrated(true);
	}, []);

	// Prevent hydration errors by returning null until mounted
	if (!hydrated) return null;

	return (
		<div id="Sidenavbar">
			<div id="SideBar__container">
				{steps.map((step, index) => {
					const stepNumber = index + 1;
					const isActive = active === stepNumber;
					const isCompleted = active > stepNumber;
					const stepColor = isActive
						? "bg-blue-500 text-white" // Active step (blue)
						: isCompleted
							? "bg-green-500 text-white" // Completed step (green)
							: "bg-gray-300 text-gray-700"; // Inactive step (gray)
					const stepColors = isActive
						? "SideBar_state_text_active"
						: isCompleted
							? "SideBar_state_text_done"
							: "SideBar_state_text";

					return (
						<div className="SideBar__SideBar" key={stepNumber}>
							<div className="SideBar__state__container">
								{/* Step Icon */}
								<div className={`${step.sidecircle} ${stepColor}`}>
									{step.img}
								</div>

								{/* Line Connector (Not for last item) */}
								{stepNumber !== steps.length && (
									<div className={`${step.vl} ${active > stepNumber + 1 ? `${step.vl_done}` : active === stepNumber + 1 ? `${step.vl_active}` : ""}`} />
								)}
							</div>

							{/* Step Text */}

						</div>
					);
				})}
			</div>
		</div>
	);
};

export default CreationFlowActive;

