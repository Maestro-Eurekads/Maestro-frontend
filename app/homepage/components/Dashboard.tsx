import React, { useEffect, useState } from 'react'
import FiltersDropdowns from './FiltersDropdowns'
import HighlightViewDropdowns from './HighlightViewDropdowns'
import DoughnutChat from '../../../components/DoughnutChat'
import WeekInterval from '../../creation/components/atoms/date-interval/WeekInterval'
import WeekTimeline from '../../creation/components/atoms/date-interval/WeekTimeline'
import ChannelDistributionChatThree from '../../../components/ChannelDistribution/ChannelDistributionChatThree'
import CampaignPhases from '../../creation/components/CampaignPhases'
import { useCampaigns } from '../../utils/CampaignsContext'
import { parseApiDate } from '../../../components/Options'
import TableLoader from '../../creation/components/TableLoader'
import ig from "../../../public/ig.svg";
import TheTradeDesk from "../../../public/TheTradeDesk.svg";
import Quantcast from "../../../public/quantcast.svg";
import google from "../../../public/social/google.svg";
import x from "../../../public/x.svg";
import linkedin from "../../../public/linkedin.svg";
import Display from "../../../public/Display.svg";
import yahoo from "../../../public/yahoo.svg";
import bing from "../../../public/bing.svg";
import tictok from "../../../public/tictok.svg";
import facebook from "../../../public/facebook.svg";
import youtube from "../../../public/youtube.svg";
import { useDateRange } from '../../../src/date-range-context';
import { processCampaignData } from 'components/processCampaignData'

const Dashboard = () => {
	const [selected, setSelected] = useState([]);
	const weeksCount = 14; // Dynamic count
	const [channels, setChannels] = useState<IChannel[]>([]);
	const {
		updateCampaign,
		campaignData,
		getActiveCampaign,
		campaignFormData,
	} = useCampaigns();
	const { range } = useDateRange();
	const { clientCampaignData, loading } = useCampaigns();
	// const [show, setShow] = useState(false);
	// const [open, setOpen] = useState(false);
	// const funnelsData = [
	// 	{ startWeek: 3, endWeek: 10, label: "Campaign 1" },
	// 	{ startWeek: 4, endWeek: 7, label: "Campaign 2" },
	// 	// { startWeek: 4, endWeek: 7, label: "Campaign 2" },
	// ];

	const currencySymbols: Record<string, string> = {
		"Euro (EUR)": "€",
		"US Dollar (USD)": "$",
		"British Pound (GBP)": "£",
		"Nigerian Naira (NGN)": "₦",
		"Japanese Yen (JPY)": "¥",
		"Canadian Dollar (CAD)": "C$"
	};



	// Types for platforms and channels
	type IPlatform = {
		name: string;
		icon: any;
		style?: string;
		mediaOptions?: any[];
		isExpanded?: boolean;
	};
	type IChannel = {
		title: string;
		platforms: IPlatform[];
		style?: string;
	};
	const platformIcons = {
		Facebook: facebook,
		Instagram: ig,
		YouTube: youtube,
		TheTradeDesk: TheTradeDesk,
		Quantcast: Quantcast,
		Google: google,
		"Twitter/X": x,
		LinkedIn: linkedin,
		TikTok: tictok,
		"Display & Video": Display,
		Yahoo: yahoo,
		Bing: bing,
		"Apple Search": google,
		"The Trade Desk": TheTradeDesk,
		QuantCast: Quantcast,
	};

	const getPlatformIcon = (platformName: string | number) => {
		return platformIcons[platformName] || null;
	};
	console.log('clientCampaignData-clientCampaignData', clientCampaignData)
	const mapCampaignsToFunnels = (campaigns: any[]) => {


		useEffect(() => {
			if (clientCampaignData?.channel_mix) {
				const newChannels = clientCampaignData?.funnel_stages
					.map((stageName) => {
						const stage = clientCampaignData?.channel_mix.find(
							(chan) => chan.funnel_stage === stageName
						);
						if (!stage) return null;

						return [
							{
								title: "Social media",
								platforms: stage?.social_media?.map((platform) => ({
									name: platform?.platform_name,
									icon: getPlatformIcon(platform?.platform_name),
								})),
								style: "max-w-[150px] w-full h-[52px]",
							},
							{
								title: "Display Networks",
								platforms: stage?.display_networks?.map((platform) => ({
									name: platform?.platform_name,
									icon: getPlatformIcon(platform?.platform_name),
								})),
								style: "max-w-[200px] w-full",
							},
							{
								title: "Search Engines",
								platforms: stage.search_engines?.map((platform) => ({
									name: platform?.platform_name,
									icon: getPlatformIcon(platform?.platform_name),
								})),
								style: "max-w-[180px] w-full",
							},
						];
					})
					.flat()
					.filter(Boolean); // Flatten array and remove null values

				// **Fix: Prevent re-render loop**
				if (JSON.stringify(channels) !== JSON.stringify(newChannels)) {
					setChannels(newChannels);
				}
			}
		}, [campaignFormData]);

		return campaigns?.map((campaign, index) => {
			const fromDate = parseApiDate(campaign?.campaign_timeline_start_date);
			const toDate = parseApiDate(campaign?.campaign_timeline_end_date);

			const budgetDetails = campaign?.budget_details;
			const currencySymbol = currencySymbols[budgetDetails?.currency] || "";
			const budgetValue = budgetDetails?.value ? `${budgetDetails.value} ${currencySymbol}` : "N/A";

			return {
				startWeek: fromDate?.day ?? 0, // Default to 0 if null
				endWeek: toDate?.day ?? 0,
				label: `Campaign ${index + 1}`,
				budget: budgetValue
			};
		});
	};


	const funnelsData = mapCampaignsToFunnels(clientCampaignData);

	const processedCampaigns = processCampaignData(clientCampaignData, platformIcons);
	console.log('processedCampaigns-processedCampaigns', processedCampaigns);


	// const campaignPhases = [
	// 	{ name: "Awareness", percentage: 35, color: "#3175FF" },
	// 	{ name: "Consideration", percentage: 40, color: "#00A36C" },
	// 	{ name: "Conversion", percentage: 25, color: "#FF9037" },
	// ];

	return (
		<div className='mt-[24px] '>
			<div className='flex items-center gap-3 px-[72px] flex-wrap '>
				<FiltersDropdowns />
				<div className="w-[24px] h-0 border border-[rgba(0,0,0,0.1)] rotate-90 self-center " />
				<HighlightViewDropdowns />
			</div>


			<div className=' mt-[20px] w-full'>

				{loading ? <TableLoader isLoading={loading} /> : ""}
			</div>
			<div className="box-border w-full min-h-[519px] bg-white border-b-2">
				<WeekInterval weeksCount={weeksCount} />
				<WeekTimeline weeksCount={weeksCount} funnels={funnelsData} />
			</div>;



			{processedCampaigns?.map((campaign, index) => (
				<div key={index} className='flex justify-center gap-[48px] mt-[100px]'>
					<div className="box-border flex flex-row items-start p-6 gap-[72px] w-[493px] h-[402.73px] bg-[#F9FAFB] rounded-lg">
						<div className='flex flex-col'>
							<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">Your budget by phase</h3>
							<div className='flex items-center gap-5'>
								<div className='mt-[16px]'>

									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Total budget
									</p>

									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">{campaign?.campaign_budget?.amount} {campaign?.campaign_budget?.currency}</h3>
								</div>
								<div className='mt-[16px]'>
									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Campaign phases
									</p>

									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">{campaign?.channel_mix?.length} phases</h3>
								</div>
							</div>


							<div className='flex items-center gap-6 mt-[24px] w-full'>
								{/* Doughnut Chat */}
								<DoughnutChat data={campaign} />

								{/* Campaign Phases */}

								<CampaignPhases key={index} campaignPhases={campaign} />;




							</div>
						</div>
					</div>

					<div className='flex flex-col'>
						<div key={index} className="box-border flex flex-col items-start p-6 gap-[5px] w-[493px] min-h-[545px] bg-[#F9FAFB] rounded-lg">
							<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
								Your budget by channel
							</h3>
							<div className="mt-[16px]">
								<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
									Channels
								</p>
								<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
									{campaign?.channel_mix?.length}
								</h3>
							</div>

							<ChannelDistributionChatThree campaign={campaign} />
						</div>
					</div>



				</div>
			))}
		</div>
	)
}

export default Dashboard


