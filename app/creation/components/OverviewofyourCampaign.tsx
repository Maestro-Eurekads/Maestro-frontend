import React, { useState } from 'react'
import PageHeaderWrapper from '../../../components/PageHeaderWapper'
import DateComponent from './molecules/date-component/date-component';
import ConfigureBudgetComponet from './ConfigureAdSetsAndBudget/ConfigureBudgetComponet';
import OverviewOfYourCampaigntimeline from './OverviewOfYourCampaign/OverviewOfYourCampaigntimeline';
import { useDateRange } from '../../../src/date-range-context';
import { parseApiDate } from '../../../components/Options';
import { useCampaigns } from '../../utils/CampaignsContext';
import CommentsDrawer from 'components/Drawer/CommentsDrawer';
import MessageContainer from 'components/Drawer/MessageContainer';
import { useComments } from 'app/utils/CommentProvider';
import { useAppDispatch } from 'store/useStore';
import { getComment, getGeneralComment } from 'features/Comment/commentSlice';
import BusinessGeneral from '../BusinessView/BusinessGeneral';
import BusinessBrandAwareness from '../BusinessView/BusinessBrandAwareness';
import BusinessApproverContainer from '../BusinessView/BusinessApproverContainer';
import Image from "next/image";
import BusinessGeneralComment from '../BusinessView/BusinessGeneralComment';
import tickcircles from "../../../public/solid_circle-check.svg";
import { RxDotFilled } from 'react-icons/rx';
import { useSearchParams } from 'next/navigation';


interface Comment {
	documentId: string;
	addcomment_as: string;
	createdAt: string;
	replies?: Reply[];
	approved?: boolean; // Added the approved property
}

interface Reply {
	documentId: string;
	name?: string;
	date?: string;
	time?: string;
	message?: string;
}

const OverviewofyourCampaign = () => {
	const { isDrawerOpen, setIsDrawerOpen, isCreateOpen, setClose, close } = useComments();
	const [show, setShow] = useState(false);
	const [generalComment, setGeneralComment] = useState(false);
	const { range } = useDateRange();
	const { clientCampaignData, campaignData } = useCampaigns();
	const dispatch = useAppDispatch();
	const query = useSearchParams();
	const commentId = query.get("campaignId");
	// const commentId = campaignData?.documentId
	const comments: Comment[] = clientCampaignData
		?.filter((comment: Comment) => comment?.addcomment_as !== "Internal")
		.sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	const allApproved = (comments?.length || 0) > 0 && comments?.every((comment: Comment) => comment?.approved === true);


	const mapCampaignsToFunnels = (campaigns: any[]) => {
		return campaigns?.map((campaign, index) => {
			const fromDate = parseApiDate(campaign?.campaign_timeline_start_date);
			const toDate = parseApiDate(campaign?.campaign_timeline_end_date);

			return {
				startWeek: fromDate?.day ?? 0, // Default to 0 if null
				endWeek: toDate?.day ?? 0,
				label: `Campaign ${index + 1}`,
			};
		});
	};

	const funnelsData = mapCampaignsToFunnels(clientCampaignData);


	const handleDrawerOpen = () => {
		setIsDrawerOpen(true);
		dispatch(getComment(commentId));
		setClose(true)
	}
	const handleOpenComment = () => {
		setGeneralComment(!generalComment)
		dispatch(getGeneralComment(commentId));
	}

	return (
		<div>
			<div className={`px-[50px]  ${isDrawerOpen ? 'md:px-[50px]' : 'xl:px-[150px]'}`}>

				<div className='flex	flex-col gap-[24px]'>
					<BusinessApproverContainer campaign={clientCampaignData} />
					<BusinessGeneral campaign={clientCampaignData} />
					<BusinessBrandAwareness campaign={clientCampaignData} />
					{/* <ClientMessageContainer isOpen={isDrawerOpen} isCreateOpen={isCreateOpen} /> */}
					<div className="mt-[50px] flex flex-col justify-between gap-4 md:flex-row">
						{/* <ClientToggleSwitch active={active} setActive={setActive} /> */}

						<div className="flex gap-[12px] md:flex-row">
							{/* <button
								className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
								style={{ border: "1px solid #3175FF" }} onClick={() => setShow(!show)}>{!show ? "See" : "Hide"} budget overview
							</button> */}
							<button className="overview-budget-conponent"
								onClick={() => setShow(!show)}>{!show ? "See" : "Hide"} budget overview</button>
							<button
								className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
								style={{ border: "1px solid #3175FF" }}
								onClick={handleOpenComment}>
								General Comment
							</button>
							<button
								onClick={handleDrawerOpen}
								className="bg-[#FAFDFF]  rounded-[10px] py-[14px] px-6 self-start flex items-center	gap-[4px]"
								style={{ border: "1px solid #3175FF" }}>
								{allApproved ? <Image src={tickcircles} alt="tickcircle" className="w-[18px] " /> : <RxDotFilled size={20} color='#FF0302' />}

								<span className='text-[16px] font-[600] text-[#3175FF]'>See Focus Comments</span>
							</button>
						</div>
						{/* General Comment */}
					</div>
					{generalComment &&
						<BusinessGeneralComment />}


				</div>
			</div>
			<div className="creation_continer">
				{/* <PageHeaderWrapper
					t1="Campaign summary"
					t2="Final review of your campaign's budget allocation across phases and channels."
				/> */}
				{/* <CommentsDrawer
					isOpen={isDrawerOpen}
					onClose={setIsDrawerOpen}
				/> */}
				<div >
					{/* <div className='flex gap-5'> 
						<button className="overview-budget-conponent mt-8"
							onClick={handleDrawerOpen}>View Comments</button>
					</div> */}
					<ConfigureBudgetComponet show={show} t1={"Your budget by campaign phase"} t2={undefined} />
				</div>



				{/* <div className='mt-[20px]'>
				<span className="w-[68px] h-[19px] font-[600] text-[14px] leading-[19px] text-[#061237]">
					Comment
				</span>

				<textarea
					className="w-[600px] h-[128px] flex flex-col justify-center items-end p-4 pb-[20px] gap-12 bg-white border border-gray-300 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-[8px]"
					placeholder="Write your comment">
				</textarea>
			</div> */}
			</div>
			<div>

				<div className='mt-[30px]'>
					<DateComponent useDate={false} />
				</div>

				<MessageContainer isOpen={isDrawerOpen} isCreateOpen={isCreateOpen} />
				<OverviewOfYourCampaigntimeline dateList={range} funnels={funnelsData} setIsDrawerOpen={setIsDrawerOpen} openComments={isDrawerOpen} />
			</div>

		</div>
	)
}

export default OverviewofyourCampaign




