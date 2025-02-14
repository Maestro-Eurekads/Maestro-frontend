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
import Quantcast from '../../../public/Quantcast.svg';
import Display from '../../../public/Display.svg';
import Google from '../../../public/Google.svg';
import yahoo from '../../../public/yahoo.svg';
import bing from '../../../public/bing.svg';
import orangecredit from '../../../public/orangecredit-card.svg';
import tablerzoomfilled from '../../../public/tabler_zoom-filled.svg';



const funnelStages = [
	{
		name: "Awareness",
		icon: speaker,
		status: "In progress",
		statusIsActive: true,
		platforms: {
			"Social media": [
				{ name: "Facebook", icon: facebook },
				{ name: "Instagram", icon: ig },
				{ name: "TikTok", icon: tictok },
				{ name: "YouTube", icon: youtube },
				{ name: "Twitter/X", icon: x },
				{ name: "LinkedIn", icon: linkedin },
			],
			"Display networks": [
				{ name: "TheTradeDesk", icon: TheTradeDesk },
				{ name: "Quantcast", icon: Quantcast },
				{ name: "Display & Video", icon: Display },
			],
			"Search engines": [
				{ name: "Google", icon: Google },
				{ name: "Yahoo", icon: yahoo },
				{ name: "Bing", icon: bing },
			],
		},
	},
	{
		name: "Consideration",
		icon: tablerzoomfilled,
		status: "Not started",
		statusIsActive: false,
		platforms: {
			"Social media": [
				{ name: "Facebook", icon: facebook },
				{ name: "Instagram", icon: ig },
				{ name: "TikTok", icon: tictok },
				{ name: "YouTube", icon: youtube },
				{ name: "Twitter/X", icon: x },
				{ name: "LinkedIn", icon: linkedin },
			],
			"Display networks": [
				{ name: "TheTradeDesk", icon: TheTradeDesk },
				{ name: "Quantcast", icon: Quantcast },
				{ name: "Display & Video", icon: Display },
			],
			"Search engines": [
				{ name: "Google", icon: Google },
				{ name: "Yahoo", icon: yahoo },
				{ name: "Bing", icon: bing },
			],
		},
	},
	{
		name: "Conversion",
		icon: orangecredit,
		status: "Not started",
		statusIsActive: false,
		platforms: {
			"Social media": [
				{ name: "Facebook", icon: facebook },
				{ name: "Instagram", icon: ig },
				{ name: "TikTok", icon: tictok },
				{ name: "YouTube", icon: youtube },
				{ name: "Twitter/X", icon: x },
				{ name: "LinkedIn", icon: linkedin },
			],
			"Display networks": [
				{ name: "TheTradeDesk", icon: TheTradeDesk },
				{ name: "Quantcast", icon: Quantcast },
				{ name: "Display & Video", icon: Display },
			],
			"Search engines": [
				{ name: "Google", icon: Google },
				{ name: "Yahoo", icon: yahoo },
				{ name: "Bing", icon: bing },
			],
		},
	},
];

const FunnelStage = () => {
	const [openItems, setOpenItems] = useState({ Awareness: true });

	const toggleItem = (stage: string) => {
		setOpenItems((prev) => ({
			...prev,
			[stage]: !prev[stage],
		}));
	};

	return (
		<div>
			<h1 className="font-general-sans font-semibold text-[24px] leading-[32px] text-[#292929]">
				Which platforms would you like to activate for each funnel stage?
			</h1>
			<h2 className="font-general-sans font-medium text-[16px] leading-[22px] text-[rgba(0,0,0,0.9)] mt-2">
				Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time.
			</h2>

			<div className="mt-[32px] flex flex-col gap-[24px]">
				{funnelStages.map((stage, index) => (
					<div key={index}>
						<div
							className="flex justify-between items-center p-6 gap-3 w-[968px] h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] rounded-t-[10px]"
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
							<div className="card_bucket_container_main_sub flex flex-col pb-6 w-[968px] min-h-[300px]">
								{Object.entries(stage.platforms).map(([category, platforms]) => (
									<div key={category} className="card_bucket_container_main">
										<h3>{category}</h3>
										<div className="card_bucket_container">
											{platforms.map((platform, pIndex) => (
												<div
													key={pIndex}
													className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
												>
													<div className="flex items-center gap-2">
														<Image src={platform.icon} alt={platform.name} />
														<p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
															{platform.name}
														</p>
													</div>
													<div className="w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full" />
												</div>
											))}

										</div>

									</div>
								))}
								<div className='flex justify-end pr-[24px]'>
									<button className="flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] bg-[#3175FF] opacity-50 rounded-lg text-white font-semibold text-[16px] leading-[22px] ">Validate</button>
								</div>
							</div>

						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default FunnelStage;
