import React, { useState } from 'react'
import PageHeaderWrapper from '../../../components/PageHeaderWapper'
import DateComponent from './molecules/date-component/date-component';
import ConfigureBudgetComponet from './ConfigureAdSetsAndBudget/ConfigureBudgetComponet';
import OverviewOfYourCampaigntimeline from './OverviewOfYourCampaign/OverviewOfYourCampaigntimeline';
import { useDateRange } from '../../../src/date-range-context';
import { format, eachDayOfInterval } from "date-fns";
import { parseApiDate } from '../../../components/Options';
import { useCampaigns } from '../../utils/CampaignsContext';
import CommentsDrawer from 'components/Drawer/CommentsDrawer';
import Message from 'components/Drawer/Message';
// import Draggable from 'react-draggable';

const OverviewofyourCampaign = () => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [show, setShow] = useState(false);
	const [message, setMessage] = useState(false);
	const [addComment, setAddComment] = useState(false);
	const [addmessage, setAddMessage] = useState(false);
	const { range } = useDateRange();

	const {
		updateCampaign,
		campaignData,
		getActiveCampaign,
		clientCampaignData
	} = useCampaigns();



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
		<div>
			<div className="creation_continer">
				<PageHeaderWrapper
					t1="Campaign summary"
					t2="Final review of your campaign's budget allocation across phases and channels."
				/>
				<CommentsDrawer
					isOpen={isDrawerOpen}
					onClose={setIsDrawerOpen}
					setIsDrawerOpen={setIsDrawerOpen}
					setAddComment={setAddComment}
					addComment={addComment}
					message={message}
				/>
				<div >
					<div className='flex gap-5'>
						<button className="overview-budget-conponent mt-8"
							onClick={() => setShow(!show)}>{!show ? "See" : "Hide"}budget overview</button>
						<button className="overview-budget-conponent mt-8"
							onClick={() => setIsDrawerOpen(!isDrawerOpen)}>View Comments</button>
					</div>
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
				<Message message={message} setAddMessage={setAddMessage} addComment={addComment} isOpen={isDrawerOpen} setMessage={setMessage} />
				<OverviewOfYourCampaigntimeline dateList={range} funnels={funnelsData} />
			</div>

		</div>
	)
}

export default OverviewofyourCampaign
