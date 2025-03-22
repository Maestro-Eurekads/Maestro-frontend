"use client"
import React, { useState } from 'react'
import Image from "next/image";
import speaker from '../../../public/mdi_megaphone.svg';
import up from '../../../public/arrow-down.svg';
import down2 from '../../../public/arrow-down-2.svg';
import facebook from '../../../public/facebook.svg';
import ig from '../../../public/ig.svg';
import tictok from '../../../public/tictok.svg';
import youtube from '../../../public/youtube.svg';
import x from '../../../public/x.svg';
import linkedin from '../../../public/linkedin.svg';
import TheTradeDesk from '../../../public/TheTradeDesk.svg';
import Quantcast from '../../../public/quantcast.svg';
import Display from '../../../public/Display.svg';
import Google from '../../../public/Google.svg';
import yahoo from '../../../public/yahoo.svg';
import bing from '../../../public/bing.svg';
import orangecredit from '../../../public/orangecredit-card.svg';
import tablerzoomfilled from '../../../public/tabler_zoom-filled.svg';
import FormatSelection from './FormatSelection';

const funnelStages = [
	{
		name: "Consideration",
		icon: tablerzoomfilled,
		status: "Not started",
		statusIsActive: false,
		platforms: {},
	},
	{
		name: "Conversion",
		icon: orangecredit,
		status: "Not started",
		statusIsActive: false,
		platforms: {},
	},
];

const FormatsSelection = () => {
	const [openItems, setOpenItems] = useState({ Awareness: true });

	const toggleItem = (stage: string) => {
		setOpenItems((prev) => ({
			...prev,
			[stage]: !prev[stage],
		}));
	};

	return (
		<div className="overflow-x-hidden"> {/* Prevent horizontal scrollbar */}
			<div className="mt-[32px] flex flex-col gap-[24px]">
				{funnelStages.map((stage, index) => (
					<div key={index}>
						<div
							className="flex justify-between items-center p-6 gap-3 w-full cursor-pointer h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] rounded-t-[10px]"
							onClick={() => toggleItem(stage.name)}
						>
							<div className="flex items-center gap-2">
								<Image src={stage.icon} alt={stage.name} />
								<p className="w-[119px] h-[24px] font-[General Sans] font-medium text-[18px] leading-[24px] text-[#061237]">
									{stage.name}
								</p>
							</div>

							{stage.statusIsActive ? <p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]">
								{stage.status}
							</p> : <p className="mx-auto w-[86px] h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237] opacity-50"
							>Not started</p>}
							<div>{openItems[stage.name] ? <Image src={up} alt="up" /> : <Image src={down2} alt="down" />}</div>
						</div>

						{openItems[stage.name] && (
							<div className="card_bucket_container_main_sub flex flex-col pb-6 w-full min-h-[80px] cursor-pointer">
								{Object.entries(stage.platforms).map(([category, platforms]) => (
									<div key={category} className="card_bucket_container_main">
										<h3>{category}</h3>
										<div className="card_bucket_container">
											{Array.isArray(platforms) && platforms.map((platform, pIndex) => (
												<div
													key={pIndex}
													className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62p border border-[rgba(0,0,0,0.1)] rounded-[10px]"
												>
													<div className="flex items-center gap-2">
														<Image src={platform.icon} alt={platform.name} />
														<p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
															{platform.name}
														</p>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
								<div className="card-body">
									<FormatSelection />
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default FormatsSelection;
