import React, { useState } from 'react'
import FiltersDropdowns from './FiltersDropdowns'
import HighlightViewDropdowns from './HighlightViewDropdowns'
import DoughnutChat from '../../../components/DoughnutChat'
import WeekInterval from '../../creation/components/atoms/date-interval/WeekInterval'
import WeekTimeline from '../../creation/components/atoms/date-interval/WeekTimeline'
import ChannelDistributionChatThree from '../../../components/ChannelDistribution/ChannelDistributionChatThree'
import CampaignPhases from '../../creation/components/CampaignPhases'

const Dashboard = () => {
	const weeksCount = 14; // Dynamic count
	// const [show, setShow] = useState(false);
	// const [open, setOpen] = useState(false);
	const funnelsData = [
		{ startWeek: 3, endWeek: 10, label: "Campaign 1" },
		{ startWeek: 4, endWeek: 7, label: "Campaign 2" },
		// { startWeek: 4, endWeek: 7, label: "Campaign 2" },
	];

	const campaignPhases = [
		{ name: "Awareness", percentage: 35, color: "#3175FF" },
		{ name: "Consideration", percentage: 40, color: "#00A36C" },
		{ name: "Conversion", percentage: 25, color: "#FF9037" },
	];

	return (
		<div className='mt-[24px] '>
			<div className='flex items-center gap-3 px-[72px] flex-wrap '>
				<FiltersDropdowns />
				<div className="w-[24px] h-0 border border-[rgba(0,0,0,0.1)] rotate-90 self-center " />
				<HighlightViewDropdowns />
			</div>



			<div className="box-border w-full min-h-[519px] bg-white mt-[20px] border-b-2">
				<WeekInterval weeksCount={weeksCount} />
				<WeekTimeline weeksCount={weeksCount} funnels={funnelsData} />
			</div>;


			<div className='flex justify-center gap-[48px] mt-[100px]'>
				<div className="box-border flex flex-row items-start p-6 gap-[72px] w-[493px] h-[402.73px] bg-[#F9FAFB] rounded-lg">
					<div className='flex flex-col'>
						<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">Your budget by phase</h3>
						<div className='flex items-center gap-5'>
							<div className='mt-[16px]'>

								<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
									Total budget
								</p>

								<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">12 000 €</h3>
							</div>
							<div className='mt-[16px]'>
								<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
									Campaign phases
								</p>

								<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">3 phases</h3>
							</div>
						</div>


						<div className='flex items-center gap-6 mt-[24px] w-full'>
							{/* Doughnut Chat */}
							<DoughnutChat data={[35, 40, 25]} />

							{/* Campaign Phases */}
							<CampaignPhases campaignPhases={campaignPhases} />

						</div>
					</div>
				</div>

				<div className="box-border flex flex-col items-start p-6 gap-[5px] w-[493px] min-h-[545px] bg-[#F9FAFB] rounded-lg">
					<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">Your budget by channel</h3>
					<div className='mt-[16px]'>
						<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
							Channels
						</p>

						<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">4</h3>
					</div>

					<ChannelDistributionChatThree />
				</div>

			</div>

		</div>
	)
}

export default Dashboard


