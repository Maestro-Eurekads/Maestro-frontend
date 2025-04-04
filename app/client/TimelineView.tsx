import React from 'react'

import Image from "next/image";
import facebook from "../../../../public/facebook.svg";
import instagram from "../../../../public/instagram.svg";
import youtube from "../../../../public/youtube.svg";
import tradedesk from "../../../../public/tradedesk.svg";
import quantcast from "../../../../public/quantcast.svg";
import { useDateRange } from '../../src/date-range-context';
import { addDays, eachDayOfInterval } from "date-fns";
import ClientEstablishedGoals from './ClientEstablishedGoals';
import DateComponent from 'app/creation/components/molecules/date-component/date-component';

const TimelineView = () => {
	const range = {
		startDate: new Date(), // Example start date
		endDate: addDays(new Date(), 11), // Example end date to cover 12 days
	};

	const dateList = range.startDate && range.endDate
		? eachDayOfInterval({ start: range.startDate, end: range.endDate })
		: [];



	const funnelsData = [
		{ startWeek: 2, endWeek: 10, label: "Campaign 1" },
		{ startWeek: 4, endWeek: 11, label: "Campaign 2" },
		{ startWeek: 3, endWeek: 5, label: "Campaign 2" },
	];





	return (
		<div
			className="w-full min-h-[494px] relative "
			style={{
				backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
				backgroundSize: `calc(100% / ${dateList?.length}) 100%`,
			}}
		>
			<div className="bg-white">
				<DateComponent useDate={undefined} />
			</div>

			<ClientEstablishedGoals dateList={dateList} funnels={funnelsData} />
		</div>
	)
}

export default TimelineView