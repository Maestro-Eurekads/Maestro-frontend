"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useActive } from "../../app/utils/ActiveContext";
import AlertMain from "../Alert/AlertMain";



const ComfirmModel = ({ isOpen, setIsOpen }) => {
	const router = useRouter();
	const { setActive, setSubStep } = useActive();
	const [approval, setApproval] = useState(false);


	const handleBackClick = () => {
		setActive(0); // Reset state
		setSubStep(0);
		router.push("/"); // Navigate to home
	};

	const handleApproval = () => {
		setApproval(true)
		setTimeout(() => {
			setApproval(false)
		}, 3000);


	};

	return (
		<div className="z-50">

			{isOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="flex flex-col items-start p-6 gap-6   bg-white rounded-[10px]">
						<div className="card bg-base-100 h-[160px] w-[418px]">
							<div className="flex justify-between p-6 !pb-0">
								<span></span>
								<span className="w-[44px]   grid place-items-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="25"
										height="25"
										viewBox="0 0 25 25"
										fill="none"
									>
										<g clipPath="url(#clip0_1_23349)">
											<rect
												x="0.710938"
												y="0.5"
												width="24"
												height="24"
												rx="12"
												fill="white"
											/>
											<path
												d="M12.7109 24.5C15.8935 24.5 18.9458 23.2357 21.1962 20.9853C23.4467 18.7348 24.7109 15.6826 24.7109 12.5C24.7109 9.3174 23.4467 6.26516 21.1962 4.01472C18.9458 1.76428 15.8935 0.5 12.7109 0.5C9.52834 0.5 6.47609 1.76428 4.22566 4.01472C1.97522 6.26516 0.710938 9.3174 0.710938 12.5C0.710938 15.6826 1.97522 18.7348 4.22566 20.9853C6.47609 23.2357 9.52834 24.5 12.7109 24.5ZM18.0078 10.2969L12.0078 16.2969C11.5672 16.7375 10.8547 16.7375 10.4188 16.2969L7.41875 13.2969C6.97813 12.8562 6.97813 12.1438 7.41875 11.7078C7.85938 11.2719 8.57188 11.2672 9.00781 11.7078L11.2109 13.9109L16.4141 8.70312C16.8547 8.2625 17.5672 8.2625 18.0031 8.70312C18.4391 9.14375 18.4438 9.85625 18.0031 10.2922L18.0078 10.2969Z"
												fill="#0ABF7E"
											/>
										</g>
										<defs>
											<clipPath id="clip0_1_23349">
												<rect
													x="0.710938"
													y="0.5"
													width="24"
													height="24"
													rx="12"
													fill="white"
												/>
											</clipPath>
										</defs>
									</svg>
								</span>
								<button className="self-start" onClick={() => setIsOpen(false)}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="25"
										height="25"
										viewBox="0 0 25 25"
										fill="none"
									>
										<path
											d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
											stroke="#717680"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
							</div>

							<div className="p-6 pb-0 text-center">
								<h2 className="text-xl mb-4 text-[#181D27] font-[500]">
									Media plan completed, well done!
								</h2>
								<p className="text-[15px] font-[500] text-[#535862]">
									You’ve successfully completed the setup of your media plan. Ready to move forward?
								</p>
							</div>

							{approval && (
								<AlertMain
									alert={{
										variant: 'info',
										message: 'Request approval not available!',
										position: 'bottom-right',
									}}
								/>
							)}
						</div>


						<div className=" w-full mt-1 pt-4">

							<div className="flex items-center justify-between gap-5 w-full">
								<button className="btn_model_outline w-full" onClick={handleBackClick}>Back to Dashboard</button>
								<button className="btn_model_active w-full" onClick={handleApproval}>Request approval</button>
							</div>
						</div>
					</div>
				</div>
			)
			}
		</div >
	)
}

export default ComfirmModel