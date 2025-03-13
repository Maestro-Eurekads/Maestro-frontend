import React, { useState } from 'react'
import PageHeaderWrapper from '../../../components/PageHeaderWapper'
import DateComponent from './molecules/date-component/date-component';
import ConfigureBudgetComponet from './ConfigureAdSetsAndBudget/ConfigureBudgetComponet';
import OverviewOfYourCampaigntimeline from './OverviewOfYourCampaign/OverviewOfYourCampaigntimeline';
import { useDateRange } from '../../../src/date-range-context';
import { format, eachDayOfInterval } from "date-fns";

const OverviewofyourCampaign = () => {
	const [show, setShow] = useState(false);
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
		<div>
			<div className="creation_continer">
				<PageHeaderWrapper
					t1="Campaign summary"
					t2="Final review of your campaign's budget allocation across phases and channels."
				/>

				<div >
					<button className="overview-budget-conponent mt-8"
						onClick={() => setShow(!show)}>{!show ? "See" : "Hide"} budget overview</button>

					<ConfigureBudgetComponet show={show} t1={"Your budget by campaign phase"} t2={undefined} />
				</div>



				<div className='mt-[20px]'>
					<span className="w-[68px] h-[19px] font-[600] text-[14px] leading-[19px] text-[#061237]">
						Comment
					</span>

					<textarea
						className="w-[600px] h-[128px] flex flex-col justify-center items-end p-4 pb-20 gap-12 bg-white border border-gray-300 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-[8px]"
						placeholder="Write your comment">
					</textarea>
				</div>
			</div>
			<div>

				<div className='mt-[30px]'>
					<DateComponent useDate={false} />
				</div>

				<OverviewOfYourCampaigntimeline dateList={dateList} funnels={funnelsData} />
			</div>

		</div>
	)
}

export default OverviewofyourCampaign
