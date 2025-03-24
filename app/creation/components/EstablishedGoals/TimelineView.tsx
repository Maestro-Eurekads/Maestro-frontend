import React, { useEffect, useState } from 'react'
import DateComponent from '../molecules/date-component/date-component'
import Image from "next/image";
import facebook from "../../../../public/facebook.svg";
import instagram from "../../../../public/instagram.svg";
import youtube from "../../../../public/youtube.svg";
import tradedesk from "../../../../public/tradedesk.svg";
import quantcast from "../../../../public/quantcast.svg";
import { useDateRange } from '../../../../src/date-range-context';
import { eachDayOfInterval } from "date-fns";
import EstablishedGoalsTimeline from './EstablishedGoalsTimeline';
import { useSearchParams } from 'next/navigation';
import { useCampaigns } from '../../../utils/CampaignsContext';
import { parseApiDate } from '../../../../components/Options';
import ig from "../../../../public/ig.svg";
import TheTradeDesk from "../../../../public/TheTradeDesk.svg";
import Quantcast from "../../../../public/quantcast.svg";
import google from "../../../../public/social/google.svg";
import x from "../../../../public/x.svg";
import linkedin from "../../../../public/linkedin.svg";
import Display from "../../../../public/Display.svg";
import yahoo from "../../../../public/yahoo.svg";
import bing from "../../../../public/bing.svg";
import tictok from "../../../../public/tictok.svg";

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
const TimelineView = () => {
	const [channels, setChannels] = useState<IChannel[]>([]);
	const searchParams = useSearchParams();
	const campaignId = searchParams.get("campaignId");
	const {
		updateCampaign,
		campaignData,
		getActiveCampaign,
		campaignFormData,
		clientCampaignData,
	} = useCampaigns();
	const { range } = useDateRange();


	 

	const dateList = eachDayOfInterval({
		start: range.startDate,
		end: range.endDate,
	});

	useEffect(() => {
		if (campaignId) {
			getActiveCampaign(campaignId);
		}
	}, [campaignId, getActiveCampaign]);

	useEffect(() => {
		if (campaignFormData?.channel_mix) {
			const newChannels = campaignFormData.funnel_stages
				.map((stageName) => {
					const stage = campaignFormData.channel_mix.find(
						(chan) => chan.funnel_stage === stageName
					);
					if (!stage) return null;

					return [
						{
							title: "Social media",
							platforms: stage.social_media?.map((platform) => ({
								name: platform.platform_name,
								icon: getPlatformIcon(platform.platform_name),
							})),
							style: "max-w-[150px] w-full h-[52px]",
						},
						{
							title: "Display Networks",
							platforms: stage.display_networks?.map((platform) => ({
								name: platform.platform_name,
								icon: getPlatformIcon(platform.platform_name),
							})),
							style: "max-w-[200px] w-full",
						},
						{
							title: "Search Engines",
							platforms: stage.search_engines?.map((platform) => ({
								name: platform.platform_name,
								icon: getPlatformIcon(platform.platform_name),
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

	const mapCampaignsToFunnels = (campaigns: any[]) => {
		return campaigns.map((campaign, index) => {
			const fromDate = parseApiDate(campaign.campaign_timeline_start_date);
			const toDate = parseApiDate(campaign.campaign_timeline_end_date);

			return {
				startWeek: fromDate?.day ?? 0, // Default to 0 if null
				endWeek: toDate?.day ?? 0,
				label: `Campaign ${index + 1}`,
			};
		});
	};

	const funnelsData = mapCampaignsToFunnels(clientCampaignData);

	return (
		<div
			className="w-full min-h-[494px] relative"
			style={{
				backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
				backgroundSize: `calc(100% / ${dateList.length}) 100%`,
			}}
		>
			<div className="bg-white">
				<DateComponent useDate={undefined} />
			</div>

			<EstablishedGoalsTimeline dateList={dateList} funnels={funnelsData} />
		</div>
	);
};

export default TimelineView;