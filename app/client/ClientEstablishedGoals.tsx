// import React, { useState } from "react";

// import adset from "../../public/adset_level.svg";
// import channel from "../../public/channel_level.svg";
// import facebook from "../../public/facebook.svg";
// import instagram from "../../public/instagram.svg";
// import youtube from "../../public/youtube.svg";
// import tradedesk from "../../public/tradedesk.svg";
// import quantcast from "../../public/quantcast.svg";

// import Image from "next/image";
// import { DateRangeProvider } from "src/date-range-context";
// import DateComponent from "app/creation/components/molecules/date-component/date-component";
// import Modal from "components/Modals/Modal";


// const channels = [
// 	{
// 		icon: facebook,
// 		name: "Facebook",
// 		color: "#0866FF",
// 		audience: "Men 25+ Int. Sport",
// 		startDate: "01/02/2024",
// 		endDate: "01/03/2024",
// 		audienceSize: 50000,
// 		budgetSize: 10000,
// 		impressions: 2000000,
// 		reach: 2000000,
// 		hasChildren: true,
// 	},
// 	{
// 		icon: instagram,
// 		name: "Instagram",
// 		color: "#E01389",
// 		audience: "Lookalike Buyers 90D",
// 		startDate: "01/02/2024",
// 		endDate: "01/03/2024",
// 		audienceSize: 40000,
// 		budgetSize: 8000,
// 		impressions: 2000000,
// 		reach: 2000000,
// 		hasChildren: true,
// 	},
// 	{
// 		icon: youtube,
// 		name: "Youtube",
// 		color: "#FF0302",
// 		audience: "Men 25+ Int. Sport",
// 		startDate: "01/02/2024",
// 		endDate: "01/03/2024",
// 		audienceSize: 60000,
// 		budgetSize: 12000,
// 		impressions: 2000000,
// 		reach: 2000000,
// 		hasChildren: false,
// 	},
// 	{
// 		icon: tradedesk,
// 		name: "TheTradeDesk",
// 		color: "#0099FA",
// 		audience: "Lookalike Buyers 90D",
// 		startDate: "01/02/2024",
// 		endDate: "01/03/2024",
// 		audienceSize: 60000,
// 		budgetSize: 12000,
// 		impressions: 2000000,
// 		reach: 2000000,
// 		hasChildren: false,
// 	},
// 	{
// 		icon: quantcast,
// 		name: "Quantcast",
// 		color: "#061237",
// 		audience: "Men 25+ Int. Sport",
// 		startDate: "01/02/2024",
// 		endDate: "01/03/2024",
// 		audienceSize: 60000,
// 		budgetSize: 12000,
// 		impressions: 2000000,
// 		reach: 2000000,
// 		hasChildren: false,
// 	},
// ];

// export const ClientEstablishedGoals = () => {

// 	return (
// 		<section className="pt-[40px]">


// 		</section>
// 	);
// };


"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { BsFillMegaphoneFill } from "react-icons/bs";
import youtube from "../../public/youtube.svg";
import facebook from "../../public/facebook.svg";
import TheTradeDesk from "../../public/TheTradeDesk.svg";
import instagram from "../../public/ig.svg";
import { TbZoomFilled, TbCreditCardFilled } from "react-icons/tb";
import { CgInfo } from "react-icons/cg";

const ClientEstablishedGoals = ({ dateList, funnels }) => {
	// Manage state separately for each funnel, section, and platform
	const [expanded, setExpanded] = useState({});
	const [openSections, setOpenSections] = useState({});

	// Function to toggle campaign dropdown
	const toggleShow = (index, section, platform) => {
		const key = `${index}-${section}-${platform}`;
		setExpanded((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	// Function to toggle Awareness/Consideration/Conversion dropdowns
	const toggleOpen = (index, section) => {
		setOpenSections((prev) => ({
			...prev,
			[`${index}-${section}`]: !prev[`${index}-${section}`],
		}));
	};

	return (
		<div
			className="w-full min-h-[494px] relative pb-5"
			style={{
				backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
				backgroundSize: `calc(100% / ${dateList?.length}) 100%`,
			}}
		>
			{/* Loop through funnels */}
			{funnels?.map(({ startWeek, endWeek, label }, index) => (
				<div
					key={index}
					style={{
						display: "grid",
						gridTemplateColumns: `repeat(${dateList?.length}, 1fr)`,
					}}
				>
					<div
						className="mt-6"
						style={{
							gridColumnStart: startWeek,
							gridColumnEnd: endWeek + 1,
						}}
					>
						{/* Expanded section */}
						<div>
							{["Awareness", "Consideration", "Conversion"].map((section) => (
								<div key={section}
									style={{
										display: 'grid',
										gridTemplateColumns: `repeat(${(endWeek + 1) - startWeek}, 1fr)`
									}}>
									<button
										onClick={() => toggleOpen(index, section)}
										className={`mt-5 w-full flex items-center rounded-[10px] text-[17px] font-[500] p-3 text-center ${section === "Awareness"
											? "bg-[#3175FF]"
											: section === "Consideration"
												? "bg-[#34A853]"
												: "bg-[#ff9037]"
											} text-white`}
										style={{
											gridColumnStart: 1,
											gridColumnEnd: ((endWeek + 1) - startWeek) + 1
										}}
									>
										<div className="flex items-center justify-center gap-3 flex-1">
											<span>
												{section === "Awareness"
													? <BsFillMegaphoneFill />
													: section === "Consideration"
														? <TbZoomFilled />
														: <TbCreditCardFilled />}
											</span>
											<span>{section}</span>
											<span>
												{openSections[`${index}-${section}`] ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
											</span>
										</div>
										<button className="justify-self-end px-3 py-[10px] text-[16px] font-[500] bg-white/25 rounded-[5px]">
											{section === "Awareness"
												? "6,000 €"
												: section === "Consideration"
													? "6,000 €"
													: "5,250 €"}
										</button>
									</button>

									{openSections[`${index}-${section}`] && (
										<div style={{ gridColumnStart: 1, gridColumnEnd: ((endWeek + 1) - startWeek) + 1 }}>
											{[
												{ platform: "Facebook", image: facebook, amount: "1,800 €", bg: "bg-[#0866FF33]", color: "#3175FF", acolor: "#E4EDFF" },
												{ platform: "Instagram", image: instagram, amount: "1,800 €", bg: "bg-[#FEF1F8]", color: "#E01389", acolor: "#FCE6F2" },
												{ platform: "Youtube", image: youtube, amount: "1,200 €", bg: "bg-[#FFF0F0]", color: "#FF0302", acolor: "#FFE4E4" },
												{ platform: "TheTradeDesk", image: TheTradeDesk, amount: "900 €", bg: "bg-[#F0F9FF]", color: "#0099FA", acolor: "#E4F4FE" },
											].map(({ platform, image, amount, bg, color, acolor }) => {
												const key = `${index}-${section}-${platform}`;
												return (
													<div key={platform} style={{
														display: 'grid',
														gridTemplateColumns: `repeat(${(((endWeek + 1) - startWeek) + 1) - 2}, 1fr)`
													}}>
														<div className={`p-1 ${bg} text-[15px] font-[500] my-5 w-full rounded-[10px] flex items-center justify-between`}
															style={{
																gridColumnStart: 1,
																gridColumnEnd: (((((endWeek + 1) - startWeek) + 1) - 1) + 1) - 1,
																border: `0.5px solid ${color}`
															}}
														>
															<div />
															<span className="flex items-center gap-3">
																<Image src={image} alt={platform} width={20} />
																<span style={{ color: color }}>{platform}</span>
																<button onClick={() => toggleShow(index, section, platform)}>
																	{expanded[key] ? <FiChevronUp /> : <FiChevronDown />}
																</button>
															</span>
															<button
																className={`py-2 px-[10px] rounded-[5px]`}
																style={{ backgroundColor: acolor }}>
																{amount}
															</button>
														</div>
														{/* Child content */}
														{expanded[key] && (
															<div className="budgetImpressions" style={{
																gridColumnStart: 1,
																gridColumnEnd: (((endWeek + 1) - startWeek) + 1)
															}}>
																<div className="flex flex-col gap-2">
																	<h6 className="reach-btn-text">Budget</h6>
																	<p className="budget_number ">1,800 €</p>
																</div>
																<div className="flex flex-col gap-2">
																	<h6 className="reach-btn-text">CPM</h6>
																	<p className="budget_number_btn">CPM</p>
																</div>
																<div className="flex flex-col gap-2">
																	<div className="flex items-center gap-1">
																		<h6 className="reach-btn-text">Impressions</h6>
																		<CgInfo size={10} className="mt-[0.5]" />
																	</div>

																	<p className=" ">280,000</p>
																</div>
																<div className="flex flex-col gap-2">
																	<h6 className="reach-btn-text">Frequency</h6>
																	<p className="budget_number_btn">Frequency</p>
																</div>
																<div className="flex flex-col gap-2">
																	<div className="flex items-center gap-1">
																		<h6 className="reach-btn-text">Reach</h6>
																		<CgInfo size={10} className="mt-[0.5]" />
																	</div>
																	<p className=" ">320 000</p>
																</div>
																<div className="flex flex-col gap-2">
																	<button className="reach-btn">+</button>
																	<p className=" "></p>
																</div>

															</div>
														)}
													</div>
												);
											})}
										</div>
									)}
								</div>
							))}
						</div>

					</div>
				</div>
			))}
		</div>
	);
};

export default ClientEstablishedGoals;