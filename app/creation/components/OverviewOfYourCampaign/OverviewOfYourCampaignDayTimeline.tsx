"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { BsFillMegaphoneFill } from "react-icons/bs";
import youtube from "../../../../public/youtube.svg";
import facebook from "../../../../public/facebook.svg";
import TheTradeDesk from "../../../../public/TheTradeDesk.svg";
import instagram from "../../../../public/ig.svg";
import arrowup from "../../../../public/iconamoon_arrow-up-2.svg";
import { TbZoomFilled, TbCreditCardFilled } from "react-icons/tb";
import { useCampaigns } from "app/utils/CampaignsContext";
import { extractPlatforms } from "components/Options";

const OverviewOfYourCampaignDayTimeline = ({ daysCount, funnels }) => {
	// Manage state separately for each funnel, section, and platform
	const [expanded, setExpanded] = useState({});
	const [openSections, setOpenSections] = useState({});
	const [expandedAdsets, setExpandedAdsets] = useState({});
	const { campaignFormData, clientCampaignData } = useCampaigns();
	// Function to toggle campaign dropdown
	const toggleShow = (index, section, platform) => {
		const key = `${index}-${section}-${platform}`;
		setExpanded((prev) => {
			const isCurrentlyExpanded = prev[key];

			// If collapsing, also close the ad sets
			if (isCurrentlyExpanded) {
				setExpandedAdsets((prevAdsets) => {
					const updatedAdsets = { ...prevAdsets };
					delete updatedAdsets[key]; // Remove the key from expandedAdsets
					return updatedAdsets;
				});
			}

			return {
				...prev,
				[key]: !isCurrentlyExpanded,
			};
		});
	};

	// Function to toggle Ad sets campaign dropdown
	const toggleShowAdsets = (index, section, platform) => {
		setExpandedAdsets((prev) => {
			const key = `${index}-${section}-${platform}`;
			return {
				...prev,
				[key]: !prev[key] // Toggle state
			};
		});
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
				backgroundSize: `calc(100% / ${daysCount}) 100%`,
			}}
		>
			{/* Loop through funnels */}
			{funnels.map(({ startWeek, endWeek, label, budget, stages }, index) => (
				<div
					key={index}
					style={{
						display: "grid",
						gridTemplateColumns: `repeat(${daysCount}, 1fr)`,
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




									{/* Expanded section */}
									{expanded[index] && (
										<div className="p-4">
											{stages?.map((section, zIndex) => {

												const channels = extractPlatforms(
													clientCampaignData[index]
												);

												return (
													<div
														key={section?.name}
													// style={{
													// 	display: 'grid',
													// 	gridTemplateColumns: `repeat(${(endWeek + 1) - startWeek}, 1fr)`
													// }}
													>
														<div
															onClick={() => toggleOpen(index, section?.name)}
															className={`mt-5 w-full flex items-center rounded-[10px] text-[17px] font-[500] p-3 text-center ${section?.name === "Awareness"
																? "bg-[#3175FF]"
																: section?.name === "Consideration"
																	? "bg-[#34A853]"
																	: section?.name === "Conversion"
																		? "bg-[#ff9037]"
																		: "bg-[#F05406]"
																} text-white`}
															style={{
																gridColumnStart: startWeek,
																gridColumnEnd: endWeek + 1 - startWeek + 1,
															}}
														>
															<div className="flex items-center justify-center gap-3 flex-1">
																<span>
																	{section?.name === "Awareness" ? (
																		<BsFillMegaphoneFill />
																	) : section?.name === "Consideration" ? (
																		<TbZoomFilled />
																	) : (
																		<TbCreditCardFilled />
																	)}
																</span>
																<span>{section?.name}</span>
																<span>
																	<FiChevronDown size={15} />
																</span>
															</div>
															<button className="justify-self-end px-3 py-[10px] text-[16px] font-[500] bg-white/25 rounded-[5px]">
																{section?.budget}
															</button>
														</div>

														{openSections[`${index}-${section?.name}`] && (
															<div
																style={{
																	gridColumnStart: 1,
																	gridColumnEnd: endWeek + 1 - startWeek + 1,
																}}
															>
																{channels
																	?.filter((ch) => ch?.stageName === section?.name)
																	?.map(({ platform_name, icon, amount, bg }) => (
																		<div
																			key={platform_name}
																			style={{
																				display: "grid",
																				gridTemplateColumns: `repeat(${endWeek + 1 - startWeek + 1 - 2
																					}, 1fr)`,
																			}}
																		>
																			<div
																				className={`py-1 text-[15px] font-[500] border my-5 w-full rounded-[10px] flex items-center justify-between`}
																				style={{
																					gridColumnStart: 1,
																					gridColumnEnd:
																						endWeek + 1 - startWeek + 1 - 1 + 1 - 1,
																					backgroundColor: bg,
																				}}
																			>
																				<div />
																				<span className="flex items-center gap-3 pl-3 ml-14">
																					<Image
																						src={icon}
																						alt={platform_name}
																						width={20}
																					/>
																					<span>{platform_name}</span>
																				</span>
																				<button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
																					{amount}
																				</button>
																			</div>
																		</div>
																	))}
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

export default OverviewOfYourCampaignDayTimeline;

