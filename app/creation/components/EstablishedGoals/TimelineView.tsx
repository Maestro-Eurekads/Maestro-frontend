import React, { useEffect } from 'react'
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

const TimelineView = () => {
	const searchParams = useSearchParams();
	const campaignId = searchParams.get("campaignId");
	const {
		updateCampaign,
		campaignData,
		getActiveCampaign,
		clientCampaignData
	} = useCampaigns();




	const { range } = useDateRange();

	// useEffect(() => {
	// 	if (campaignId) {
	// 		getActiveCampaign(campaignId);
	// 	}
	// }, [campaignId]);

<<<<<<< HEAD
	 
=======
>>>>>>> b013bd844346fa1a60b4bc40f318b8b2a3e3a1d1


	// const fromDate = parseApiDate(campaignData?.campaign_timeline_start_date);
	// const toDate = parseApiDate(campaignData?.campaign_timeline_end_date);


<<<<<<< HEAD
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
=======
	// const funnelsData = [
	// 	{ startWeek: fromDate?.day, endWeek: toDate?.day, label: "Campaign 1" },
	// 	// { startWeek: 3, endWeek: 5, label: "Campaign 2" },
	// 	// { startWeek: 3, endWeek: 5, label: "Campaign 2" },
	// ];
>>>>>>> b013bd844346fa1a60b4bc40f318b8b2a3e3a1d1

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
	console.log("🚀 ~ TimelineView ~ funnelsData:", funnelsData)

	return (
		<div
			className="w-full min-h-[494px] relative "
			style={{
				backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
				backgroundSize: `calc(100% / ${range.length}) 100%`,
			}}
		>
			<div className="bg-white">
				<DateComponent useDate={undefined} />
			</div>

			<EstablishedGoalsTimeline/>
		</div>
	)
}

export default TimelineView


