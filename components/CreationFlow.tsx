import Image from "next/image";
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
		title: "Define campaign objective",
		objective: "Main objective: Purchase",
		img: <Image src={symbol} alt="symbol" />
	},
	{
		title: "Map funnel stages",
		objective: "Awareness · Consideration · Conversion",
		img: <Image src={funnel} alt="funnel" />
	},
	{
		title: "Select channel mix",
		img: <Image src={channel} alt="channel" />
	},
	{
		title: "Formats selection",
		img: <Image src={devicefill} alt="devicefill" />
	},
	{
		title: "Set buy objectives and types",
		img: <Image src={basket} alt="basket" />
	},
	{
		title: "Plan campaign schedule",
		img: <Image src={Calender} alt="click" />
	},
	{
		title: "Configure ad sets and budget",
		img: <Image src={click} alt="click" />
	},
	{
		title: "Establish goals",
		img: <Image src={workbench} alt="workbench" />
	},
	{
		title: "Overview of your campaign",
		img: <Image src={checkfill} alt="checkfill" />
	},
];

const CreationFlow = () => {
	const { active } = useActive();

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
						? "SideBar_state_text_active" // Active step (blue)
						: isCompleted
							? "SideBar_state_text_done" // Completed step (green)
							: "SideBar_state_text"; // Inactive step (gray)

					return (
						<div className="SideBar__SideBar" key={stepNumber}>
							<div className="SideBar__state__container">
								{/* Step Icon */}
								<div className={`SideBar_Menu_active ${stepColor}`}>
									{step.img}
								</div>

								{/* Line Connector (Not for last item) */}
								{stepNumber !== steps.length && (
									<div className={`vl ${active > stepNumber + 1 ? "vl_done" : active === stepNumber + 1 ? "vl_active" : ""}`} />
								)}
							</div>

							{/* Step Text */}
							<div className="SideBar_Menu_state">
								<span className={`SideBar_state_text ${stepColors}`}>
									{step.title}
								</span>

								{/* Show objective ONLY when the step is completed */}
								{isCompleted && step.objective && (
									<div className="objective_step_text">{step.objective}</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default CreationFlow;

