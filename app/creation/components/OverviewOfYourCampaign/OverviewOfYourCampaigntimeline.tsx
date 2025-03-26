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

const OverviewOfYourCampaigntimeline = ({ dateList, funnels, setIsDrawerOpen, openComments }) => {
	// Manage state separately for each funnel, section, and platform
	const [expanded, setExpanded] = useState({});
	const [openSections, setOpenSections] = useState({});
	const [expandedAdsets, setExpandedAdsets] = useState({});
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

	const toggleComment = (index) => {
		setIsDrawerOpen((prev) => {
			// If the same index is already open, close it; otherwise, open it
			return prev[index] ? {} : { [index]: true };
		});
	};



	return (
		<div
			className="w-full min-h-[494px] relative pb-5"
			style={{
				backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
				backgroundSize: `calc(100% / ${dateList.length}) 100%`,
			}}
		>
			{/* Loop through funnels */}
			{funnels.map(({ startWeek, endWeek, label }, index) => (
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
												{ platform: "Facebook", image: facebook, amount: "1,800 €", bg: "bg-[#0866FF33]", color: "##F0F6FF", acolor: "#0866FF0D" },
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
														<div className={`p-1 ${bg} text-[15px] h-[44px] font-[500] my-5 w-full rounded-[10px] flex items-center justify-between`}
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
														<div>
															{expanded[key] && (
																<button className="add_set_Impressions"
																	onClick={() => toggleShowAdsets(index, section, platform)}  >
																	<p className="whitespace-nowrap ">
																		2 ad sets
																	</p>
																	<Image src={arrowup} alt={"arrowup"} />
																</button>
															)}

															{(expanded[key] && expandedAdsets[key]) && (
																<div className="expandedAdsets   mt-2 flex flex-col pl-10">
																	{/* Sample Ad Set Content */}
																	<table className="w-full text-left border-collapse border-none">
																		<thead className="border-none">
																			<tr className="text-gray-600 border-b-0 bg-white">
																				<th className="p-2 pr-3 border-b-0">#</th>
																				<th className="p-2 pr-3 border-b-0">Type</th>
																				<th className="p-2 pr-3 border-b-0">Name</th>
																				<th className="p-2 pr-3 border-b-0">Audience size</th>
																				<th className="p-2 pr-3 border-b-0">Budget</th>
																				<th className="p-2 pr-3 border-b-0"></th>
																			</tr>
																		</thead>
																		<tbody className="border-none relative">
																			{[
																				{ id: 1, type: "Board", name: "Spring sale Awareness", audience: "50,000", budget: "350 €", view: "View Comment" },
																				{ id: 2, type: "Board", name: "Spring sale Awareness", audience: "50,000", budget: "350 €", view: "View Comment" },
																				// { id: 3, type: "Board", name: "Spring sale Awareness", audience: "50,000", budget: "350 €" },
																				// { id: 4, type: "Board", name: "Spring sale Awareness", audience: "50,000", budget: "350 €" },
																			].map((row, index) => (
																				<tr key={index} className="border-none relative">
																					{/* Add absolute lines inside each row */}
																					<td className="relative p-2 pr-3 border-b-0">
																						<div className="absolute left-[-50px] top-[-16px] w-[70.3px] border-t-[2px] border-[#DCDCDC] rotate-[-90deg]" />
																						<div className="absolute left-[-15px] top-[18px] w-[15px] border-t-[2px] border-[#DCDCDC]" />
																						{row.id}.
																					</td>
																					<td className="p-2 pr-3 border-b-0">{row.type}</td>
																					<td className="p-2 pr-3 border-b-0">{row.name}</td>
																					<td className="p-2 pr-3 border-b-0">{row.audience}</td>
																					<td className="p-2 pr-3 border-b-0">{row.budget}</td>
																					<td className="p-2 pr-3 border-b-0">
																						<button onClick={() => toggleComment(index)}
																							className=" font-medium text-[15px] leading-[20px] text-[#0866FF]">
																							{openComments[index] ? "View Comment" : "View Comment"}
																						</button>
																					</td>
																				</tr>
																			))}
																		</tbody>
																	</table>



																</div>
															)}
														</div>


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

export default OverviewOfYourCampaigntimeline;

