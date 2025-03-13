"use client";
import { useState, useEffect, SetStateAction } from "react";
import { useActive } from "../app/utils/ActiveContext";

const CreationFlowActive = ({ steps, close }) => {
	const { active, setActive } = useActive();
	const [hydrated, setHydrated] = useState(false);

	// Ensure component is mounted before rendering
	useEffect(() => {
		setHydrated(true);
	}, []);

	// Prevent hydration errors by returning null until mounted
	if (!hydrated) return null;

	const handleStepClick = (stepNumber: SetStateAction<number>) => {
		setActive(stepNumber);
	};

	return (
		<div id={close ? "Sidenavbar_active" : "Sidenavbar"}>
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
						<div
							className="SideBar__SideBar cursor-pointer"
							key={stepNumber}
							onClick={() => handleStepClick(stepNumber)} // Handle step click
						>
							<div className="SideBar__state__container">
								{/* Step Icon */}
								<div className={`${step.sidecircle} ${stepColor}`}>
									{step.img}
								</div>

								{/* Line Connector (Not for last item) */}
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
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default CreationFlowActive;
