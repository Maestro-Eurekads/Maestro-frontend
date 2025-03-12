import React from 'react'
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

const TimelineView = () => {
	const { range } = useDateRange();
	const dateList = eachDayOfInterval({
		start: range.startDate,
		end: range.endDate,
	});

	const weeksCount = ""


	const funnelsData = [
		{ startWeek: 2, endWeek: 10, label: "Campaign 1" },
		// { startWeek: 3, endWeek: 5, label: "Campaign 2" },
		// { startWeek: 3, endWeek: 5, label: "Campaign 2" },
	];


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


