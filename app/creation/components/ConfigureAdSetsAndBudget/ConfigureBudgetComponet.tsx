import React, { useState } from 'react'
import DoughnutChat from '../../../../components/DoughnutChat'
import down from '../../../../public/down.svg';
import Image from 'next/image'
import PhasedistributionProgress from '../../../../components/PhasedistributionProgress';
import ChannelDistributionChatOne from '../../../../components/ChannelDistribution/ChannelDistributionChatOne';
import CampaignPhases from '../CampaignPhases';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { getCurrencySymbol } from 'components/data';

const ConfigureBudgetComponet = ({ show, t1, t2 }) => {
	const [open, setOpen] = useState(false);
	const [opens, setOpens] = useState(false);
	const [openBudget, setOpenBudget] = useState(false);
	const [channelData, setChannelData] = useState(null);
	//   const [selectedGoal, setSelectedGoal] = useState("");
	const { setCampaignFormData, campaignFormData } = useCampaigns();




	// useEffect(() => {
	// 		if (campaignFormData) {
	// 				if (campaignFormData?.goal_level) {
	// 						setIsModalOpen(false);
	// 				} else {
	// 						setIsModalOpen(true);
	// 				}
	// 		}
	// }, [campaignFormData]);

	function extractPlatforms(data) {
		const platforms = [];
		data.channel_mix.forEach((stage) => {
			const stageName = stage.funnel_stage;
			const stageBudget = parseFloat(stage.stage_budget?.fixed_value);
			["search_engines", "display_networks", "social_media"].forEach(
				(channelType) => {
					stage[channelType].forEach((platform) => {
						const platformName = platform?.platform_name;
						const platformBudget = parseFloat(platform?.budget?.fixed_value);
						const percentage = (platformBudget / stageBudget) * 100;
						const existingPlatform = platforms.find(
							(p) => p?.platform_name === platformName
						);
						if (existingPlatform) {
							existingPlatform?.stages_it_was_found?.push({
								stage_name: stageName,
								percentage: percentage,
							});
						} else {
							platforms?.push({
								platform_name: platformName,
								platform_budegt: platformBudget,
								stages_it_was_found: [
									{
										stage_name: stageName,
										percentage: percentage,
									},
								],
							});
						}
					});
				}
			);
		});
		setChannelData(platforms);
	}


	function mapCampaignPhases(phases) {
		return phases?.map(phase => ({
			name: phase?.name,
			percentage: phase?.percentage ?? 0,
			colorClass: phase?.color
		}));
	}


	const campaignPhases = mapCampaignPhases(campaignFormData?.custom_funnels);
	const data = campaignPhases?.map((phase) => Number(phase?.percentage?.toFixed(0)));
	const colors = campaignPhases?.map((phase) => phase.colorClass);


	function tailwindBgClassToHex(className: string): string {
		const colorMap: Record<string, Record<string, string>> = {
			blue: {
				"500": "#3B82F6",
			},
			green: {
				"500": "#22C55E",
			},
			orange: {
				"500": "#F97316",
			},
			red: {
				"500": "#EF4444",
			},
			// Add more colors/shades if needed
		};

		// Extract the first matched bg-* class
		const match = className.match(/bg-([a-z]+)-(\d{3})/);
		if (!match) return "#000000"; // Fallback hex if not matched

		const [, color, shade] = match;
		return colorMap[color]?.[shade] || "#000000";
	}



	const hexColors = colors?.map(cls => tailwindBgClassToHex(cls));
	// console.log("hexColors-hexColors", hexColors);


	return (
		<div>
			{show &&
				<div className="w-[100%] items-start p-[24px] gap-[8px] bg-white border border-[rgba(6,18,55,0.1)] rounded-[8px] box-border  mt-[20px]">
					<div className='allocate_budget_phase'>
						<div className='allocate_budget_phase_one'>
							{t1 &&
								<h3 className="  font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
									{t1}</h3>}
							{t2 &&
								<p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
									Here is a percentage of the total budget allocated
									to each campaign phase.
									{t2}
								</p>}

							<div className='flex items-center gap-5'>
								<div className='mt-[16px]'>
									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Total budget
									</p>

									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
										{campaignFormData?.campaign_budget?.amount ?? 0}{" "}{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
									</h3>
								</div>
								<div className='mt-[16px]'>
									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Campaign phases
									</p>

									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">3 phases</h3>
								</div>
							</div>


							<div className='campaign_phases_container mt-[24px]'>
								<div className='campaign_phases_container_one'>
									<DoughnutChat
										data={data}
										color={hexColors}
										insideText={`${campaignFormData?.campaign_budget?.amount ?? 0} ${getCurrencySymbol(campaignFormData?.campaign_budget?.currency ?? '')}`}
									/>
								</div>
								{/* Campaign Phases */}
								<CampaignPhases campaignPhases={campaignPhases} />
							</div>

							{/* Phase distribution */}
							<div className="mr-[62px] mt-8 ">
								<button
									onClick={() => setOpen(!open)}
									className="flex flex-row items-center p-0 gap-2 h-[24px] font-[600] text-[18px] leading-[24px] text-[#061237]"
								>
									<Image
										src={down}
										alt="down"
										className={`transition-transform duration-300 ${open ? "rotate-0" : "-rotate-90"}`}
									/>
									Phase distribution
								</button>



								{open &&
									<PhasedistributionProgress />}

							</div>
						</div>



						<div className='allocate_budget_phase_two'>
							<button
								onClick={() => (setOpens(!opens), extractPlatforms(campaignFormData))}
								className="flex flex-row items-center p-0 gap-2 h-[24px] font-[600] text-[18px] leading-[24px] text-[#061237]"
							>
								<Image
									src={down}
									alt="down"
									className={`transition-transform duration-300 ${opens ? "rotate-0" : "-rotate-90"}`}
								/>
								Channel distribution
							</button>


							{/* <p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
								Graph showing the total budget spent and its breakdown across the three phases.
							</p> */}
							{opens &&
								<div className='mt-[16px]'>
									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Channels
									</p>


									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
										{channelData?.length}</h3>
								</div>}

							{/* <PlatformSpending /> */}
							{opens && <ChannelDistributionChatOne channelData={channelData} currency={getCurrencySymbol(
								campaignFormData?.campaign_budget?.currency
							)} />}

						</div>

					</div>
				</div>}
		</div>
	)
}

export default ConfigureBudgetComponet