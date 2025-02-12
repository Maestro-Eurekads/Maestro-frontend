// import Image from "next/image";
// import symbol from "../public/material-symbols_campaign-rounded.svg";
// import { useActive } from "../app/utils/ActiveContext";


// interface CreationFlowProps {
// 	active: number;
// 	setActive: React.Dispatch<React.SetStateAction<number>>;
// }

// const CreationFlow: React.FC<CreationFlowProps> = () => {
// 	const { active } = useActive();

// 	return (
// 		<div id='Sidenavbar'>
// 			<div id='SideBar__container'  >
// 				<div className='SideBar__JobSideBar'>
// 					<div className='SideBar__state__container'>
// 						<div className={active === 1 ? "SideBar_Menu_active" : 'SideBar_Menu_none'}>
// 							<Image src={symbol} alt="menu" />
// 						</div>
// 						<div className='vl'></div>
// 					</div>
// 					<div className='SideBar_Menu_state'>
// 						<div className={active === 1 ? "SideBar_state_text_active" : "SideBar_state_text"}>Define campaign objective</div>
// 						{/* <div className='SideBar_state_circle_container'>
// 							{active >= 2 ? <CheckIcon className='coloricon' /> : <div className='SideBar_state_circle'></div>} */}
// 						{/* <span className={active >= 2 ? 'SideBar_state_circle_text_active' : active === 1 ? 'SideBar_state_circle_text_active_move' : 'SideBar_state_circle_text'}>
// 								Job Profile</span> */}
// 						{/* </div> */}
// 					</div>
// 				</div>
// 				<div className='SideBar__JobSideBar'>
// 					<div className='SideBar__state__container'>
// 						<div className={active === 1 ? "SideBar_Menu_active" : 'SideBar_Menu_none'}>
// 							<Image src={symbol} alt="menu" />
// 						</div>
// 						<div className='vl'></div>
// 					</div>
// 					<div className='SideBar_Menu_state'>
// 						<div className='SideBar_state_text'>Map funnel stages</div>
// 					</div>
// 				</div>
// 				<div className='SideBar__JobSideBar'>
// 					<div className='SideBar__state__container'>
// 						<div className='SideBar_Menu_none'>
// 							<Image src={symbol} alt="menu" />
// 						</div>
// 						<div className='vl'></div>
// 					</div>
// 					<div className='SideBar_Menu_state'>
// 						<div className='SideBar_state_text'> Select channel mix</div>
// 					</div>
// 				</div>
// 				<div className='SideBar__JobSideBar'>
// 					<div className='SideBar__state__container'>
// 						<div className='SideBar_Menu_none'>
// 							<Image src={symbol} alt="menu" />
// 						</div>
// 						<div className='vl'></div>
// 					</div>
// 					<div className='SideBar_Menu_state'>
// 						<div className='SideBar_state_text'>Formats selection</div>
// 					</div>
// 				</div>
// 				<div className='SideBar__JobSideBar'>
// 					<div className='SideBar__state__container'>
// 						<div className='SideBar_Menu_none'>
// 							<Image src={symbol} alt="menu" />
// 						</div>
// 						<div className='vl' />
// 					</div>
// 					<div className='SideBar_Menu_state'>
// 						<div className='SideBar_state_text'>Set buy objectives and types</div>

// 					</div>
// 				</div>
// 				<div className='SideBar__JobSideBar'>
// 					<div className='SideBar__state__container'>
// 						<div className='SideBar_Menu_none'>
// 							<Image src={symbol} alt="menu" />
// 						</div>
// 						<div className='vl'></div>
// 					</div>
// 					<div className='SideBar_Menu_state'>
// 						<div className='SideBar_state_text'>Plan campaign schedule</div>

// 					</div>
// 				</div>
// 				<div className='SideBar__JobSideBar'>
// 					<div className='SideBar__state__container'>
// 						<div className='SideBar_Menu_none'>
// 							<Image src={symbol} alt="menu" />
// 						</div>
// 						<div className='vl'></div>
// 					</div>
// 					<div className='SideBar_Menu_state'>
// 						<div className='SideBar_state_text'>Configure ad sets and budget</div>

// 					</div>
// 				</div>
// 				<div className='SideBar__JobSideBar'>
// 					<div className='SideBar__state__container'>
// 						<div className='SideBar_Menu_none'>
// 							<Image src={symbol} alt="menu" />
// 						</div>
// 					</div>
// 					<div className='SideBar_Menu_state'>
// 						<div className='SideBar_state_text'>Establish goals</div>
// 					</div>
// 				</div>
// 			</div>

// 		</div >
// 	)
// }

// export default CreationFlow

import Image from "next/image";
import symbol from "../public/material-symbols_campaign-rounded.svg";
import { useActive } from "../app/utils/ActiveContext";

const steps = [
	"Define campaign objective",
	"Map funnel stages",
	"Select channel mix",
	"Formats selection",
	"Set buy objectives and types",
	"Plan campaign schedule",
	"Configure ad sets and budget",
	"Establish goals",
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

					return (
						<div className="SideBar__JobSideBar" key={stepNumber}>
							<div className="SideBar__state__container">
								{/* Step Icon */}
								<div className={`SideBar_Menu_active ${stepColor}`}>
									<Image src={symbol} alt="menu" />
								</div>

								{/* Line Connector (Not for last item) */}
								{stepNumber !== steps.length && (
									<div className={`vl ${isCompleted ? "bg-green-500" : "bg-gray-300"}`} />
								)}
							</div>

							{/* Step Text */}
							<div className="SideBar_Menu_state">
								<div className={isActive ? "SideBar_state_text_active" : "SideBar_state_text"}>
									{step}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default CreationFlow;
