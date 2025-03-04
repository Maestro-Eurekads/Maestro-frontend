"use client";
import { useState, useEffect } from "react";
import { useActive } from "../app/utils/ActiveContext";

const CreationFlow = ({ steps }) => {
	const { active, setActive } = useActive();
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return null;

	return (
		<div id="Sidenavbar">
			{steps.map((step, index) => {
				const stepNumber = index + 1;
				const isActive = active === stepNumber;
				const isCompleted = active > stepNumber;
				const stepColor = isActive
					? "bg-blue-500 text-white"
					: isCompleted
						? "bg-green-500 text-white"
						: "bg-gray-300 text-gray-700";
				const stepColors = isActive
					? "SideBar_state_text_active"
					: isCompleted
						? "SideBar_state_text_done"
						: "SideBar_state_text";

				return (
					<div
						className="SideBar__SideBar cursor-pointer"
						key={stepNumber}
						onClick={() => setActive(stepNumber)}
					>
						<div className="SideBar__state__container">
							<div className={`${step.sidecircle} ${stepColor}`}>{step.img}</div>
							{stepNumber !== steps.length && (
								<div
									className={`${step.vl} ${active > stepNumber + 1
										? `${step.vl_done}`
										: active === stepNumber + 1
											? `${step.vl_active}`
											: ""
										}`}
								/>
							)}
						</div>
						<div className={`${step.state_text}`}>
							<span className={`mb-2 SideBar_state_text ${stepColors}`}>
								{step.title}
							</span>
							{isCompleted && step.objective && (
								<div className="objective_step_text">{step.objective}</div>
							)}
						</div>
					</div>
				);
			})}
		</div >
	);
};

export default CreationFlow;


