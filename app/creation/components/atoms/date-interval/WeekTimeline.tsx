"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { BsFillMegaphoneFill } from "react-icons/bs";
import youtube from "../../../../../public/youtube.svg";
import facebook from "../../../../../public/facebook.svg";
import TheTradeDesk from "../../../../../public/TheTradeDesk.svg";
import instagram from "../../../../../public/ig.svg";
import { TbZoomFilled, TbCreditCardFilled } from "react-icons/tb";

const WeekTimeline = ({ weeksCount, funnels }) => {
	// Manage state separately for each funnel
	const [expanded, setExpanded] = useState({});
	const [openSections, setOpenSections] = useState({});

	// Function to toggle campaign dropdown
	const toggleShow = (index) => {
		setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
	};

	// Function to toggle Awareness/Consideration/Conversion dropdowns
	const toggleOpen = (index, section) => {
		setOpenSections((prev) => ({
			...prev,
			[`${index}-${section}`]: !prev[`${index}-${section}`],
		}));
	};

	const columnWidth = 100 / weeksCount;

	return (
		<div
			className="w-full min-h-[494px] relative pb-5"
			style={{
				backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
				backgroundSize: `calc(100% / ${weeksCount}) 100%`,
			}}
		>
			{/* Loop through funnels */}
			{funnels.map(({ startWeek, endWeek, label }, index) => (
				<div
					key={index}
					style={{
						display: "grid",
						gridTemplateColumns: `repeat(${weeksCount}, 1fr)`,
					}}
				>
					<div
						className="flex flex-col min-h-[69px] bg-white border border-[rgba(0,0,0,0.1)] mt-6 shadow-sm rounded-[10px]  justify-between"
						style={{
							gridColumnStart: startWeek,
							gridColumnEnd: endWeek + 1,
						}}
					>
						<div className={`${expanded[index] ? 'border-b border-b-[rgba(0,0,0,0.1)] !rounded-t-[10px] flex justify-between items-center p-4    h-[77px] bg-[#F9FAFB]  "' : 'flex justify-between items-center p-4'} `}>
							<div >
								<h3 className="text-[#061237] font-semibold text-[16px] leading-[22px]  ">
									{label} - Running
								</h3>
								<p className="text-[#061237] font-medium text-[14px]">
									250,000 €
								</p>
							</div>
							<button onClick={() => toggleShow(index)}>
								{expanded[index] ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
							</button>
						</div>

						{/* Expanded section */}
						{expanded[index] && (
							<div className="p-4">
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
													<FiChevronDown size={15} />
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
											<div style={{ gridColumnStart: 2, gridColumnEnd: ((endWeek + 1) - startWeek) + 1, }}>
												{[
													{ platform: "Facebook", image: facebook, amount: "1,800 €", bg: "bg-[#0866FF33]" },
													{ platform: "Instagram", image: instagram, amount: "1,800 €", bg: "bg-[#FEF1F8]" },
													{ platform: "Youtube", image: youtube, amount: "1,200 €", bg: "bg-[#FFF0F0]" },
													{ platform: "TheTradeDesk", image: TheTradeDesk, amount: "900 €", bg: "bg-[#F0F9FF]" },
												].map(({ platform, image, amount, bg }) => (
													<div key={platform} style={{
														display: 'grid',
														gridTemplateColumns: `repeat(${(((endWeek + 1) - startWeek) + 1) - 2}, 1fr)`
													}}>
														<div className={`py-1 ${bg} text-[15px] font-[500] border my-5 w-full rounded-[10px] flex items-center justify-between`}
															style={{
																gridColumnStart: 1,
																gridColumnEnd: (((((endWeek + 1) - startWeek) + 1) - 1) + 1) - 1
															}}
														>
															<div />
															<span className="flex items-center gap-3 pl-3 ml-14">
																<Image src={image} alt={platform} width={20} />
																<span>{platform}</span>
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
								))}
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

export default WeekTimeline;
