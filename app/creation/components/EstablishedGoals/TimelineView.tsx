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


	console.log('campaignData-campaignData', campaignData)

	const { range } = useDateRange();
	const dateList = eachDayOfInterval({
		start: range.startDate,
		end: range.endDate,
	});

	// useEffect(() => {
	// 	if (campaignId) {
	// 		getActiveCampaign(campaignId);
	// 	}
	// }, [campaignId]);

	// console.log('campaignData-campaignData', clientCampaignData)

	// const fromDate = parseApiDate(campaignData?.campaign_timeline_start_date);
	// const toDate = parseApiDate(campaignData?.campaign_timeline_end_date);


	// const funnelsData = [
	// 	{ startWeek: fromDate?.day, endWeek: toDate?.day, label: "Campaign 1" },
	// 	// { startWeek: 3, endWeek: 5, label: "Campaign 2" },
	// 	// { startWeek: 3, endWeek: 5, label: "Campaign 2" },
	// ];

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
			className="w-full min-h-[494px] relative "
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
	)
}

export default TimelineView


