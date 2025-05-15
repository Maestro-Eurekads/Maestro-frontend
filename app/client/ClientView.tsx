"use client"
import React, { useEffect, useState } from 'react'
import Header from './Header';
import ClientToggleSwitch from './ClientToggleSwitch';
import ClientTableView from './ClientTableView';
import ClientEstablishedGoals from './ClientEstablishedGoals';
import facebook from "../../public/facebook.svg";
import instagram from "../../public/instagram.svg";
import youtube from "../../public/youtube.svg";
import tradedesk from "../../public/tradedesk.svg";
import quantcast from "../../public/quantcast.svg";
import TimelineView from './TimelineView';
import ApproverContainer from './ApproverContainer';
import General from './General';
import BrandAwareness from './BrandAwareness';
import ApproveModel from './Modal/ApproveModel';
import GeneralComment from './GeneralComment';
import { RxDotFilled } from "react-icons/rx";
import { useComments } from 'app/utils/CommentProvider';
import MessageContainer from 'components/Drawer/MessageContainer';
import CommentsDrawer from 'components/Drawer/CommentsDrawer';
import { useAppDispatch, useAppSelector } from 'store/useStore';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { getCampaignById, getComment, getGeneralComment } from 'features/Comment/commentSlice';
import Image from "next/image";
import tickcircles from "../../public/solid_circle-check.svg";
import { useSession } from 'next-auth/react';
import SignatureModal from './Modal/SignatureModal';
import { useClientCampaign } from './ClientCampaignContext';
import TableLoader from 'app/creation/components/TableLoader';
import ClientCommentsDrawer from './compoment/ClientDrawer/ClientCommentsDrawer';
import ClientMessageContainer from './compoment/ClientDrawer/ClientMessageContainer';
import downoffline from "../../public/arrow-down-outline.svg";
import upfull from "../../public/arrow-up-full.svg";
import downfull from "../../public/arrow-down-full.svg";
import upoffline from "../../public/arrow-up-offline.svg";
import { useKpis } from 'app/utils/KpiProvider';
import { aggregateKPIStatsFromExtracted, categoryOrder, extractKPIByFunnelStage, extractPlatforms, kpiCategories, mapKPIStatsToStatsDataDynamic } from 'components/Options';
import MainSection from './compoment/Timeline/main-section';
import ChannelDistributionChatTwo from 'components/ChannelDistribution/ChannelDistributionChatTwo';
import { getCurrencySymbol, platformIcons } from 'components/data';
import CampaignPhases from 'app/creation/components/CampaignPhases';
import DoughnutChat from 'components/DoughnutChat';
import { processCampaignData } from 'components/processCampaignData';


const channels = [
	{
		icon: facebook,
		name: "Facebook",
		color: "#0866FF",
		audience: "Men 25+ Int. Sport",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 50000,
		budgetSize: "1,800 €",
		impressions: 2000000,
		reach: 2000000,
		hasChildren: true,
	},
	{
		icon: instagram,
		name: "Instagram",
		color: "#E01389",
		audience: "Lookalike Buyers 90D",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 40000,
		budgetSize: 8000,
		impressions: 2000000,
		reach: 2000000,
		hasChildren: true,
	},
	{
		icon: youtube,
		name: "Youtube",
		color: "#FF0302",
		audience: "Men 25+ Int. Sport",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 60000,
		budgetSize: 12000,
		impressions: 2000000,
		reach: 2000000,
		hasChildren: false,
	},
	{
		icon: tradedesk,
		name: "TheTradeDesk",
		color: "#0099FA",
		audience: "Lookalike Buyers 90D",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 60000,
		budgetSize: 12000,
		impressions: 2000000,
		reach: 2000000,
		hasChildren: false,
	},
	{
		icon: quantcast,
		name: "Quantcast",
		color: "#061237",
		audience: "Men 25+ Int. Sport",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 60000,
		budgetSize: 12000,
		impressions: 2000000,
		reach: 2000000,
		hasChildren: false,
	},
];

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
const ClientView = () => {
	const { isDrawerOpen, setIsDrawerOpen, isCreateOpen, setClose, modalOpen, setModalOpen, selected, isOpen, setIsOpen } = useComments();
	const [generalComment, setGeneralComment] = useState(false);
	const [active, setActive] = useState("Timeline view");
	const { clientCampaignData, campaignData, getActiveCampaign } = useCampaigns();
	const { data, campaignDetails, isLoadingCampaign } = useAppSelector((state) => state.comment);
	const comments: Comment[] = data
		?.filter((comment: Comment) => comment?.addcomment_as !== "Internal")
		.sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	const allApproved = (comments?.length || 0) > 0 && comments.every((comment: Comment) => comment?.approved === true);
	const dispatch = useAppDispatch();
	const { campaigns, loading, fetchCampaignsByClientId } = useClientCampaign();
	const [finalCategoryOrder, setFinalCategoryOrder] = useState(categoryOrder); // default fallback
	const { data: session }: any = useSession();
	const clientId = session?.user?.id;
	const client_commentId = session?.user?.id;
	const campaign = !campaignDetails ? [] : campaignDetails[0];
	const commentId = campaign?.documentId
	const campaignId = campaign?.documentId
	const { getKpis, isLoadingKpis, kpiCategory, setkpiCategory } = useKpis();






	useEffect(() => {
		if (selected) {
			getActiveCampaign(selected);
		}
	}, [selected]);

	useEffect(() => {
		if (selected) {
			getKpis(selected);
		}
	}, [selected]);


	useEffect(() => {
		if (clientId) {
			fetchCampaignsByClientId(clientId);
		}
	}, [clientId]);

	useEffect(() => {
		if (selected) {
			dispatch(getCampaignById({ clientId: clientId, campaignId: selected }));
			dispatch(getComment(commentId, client_commentId));
			dispatch(getGeneralComment(commentId));
		}
	}, [selected, commentId, client_commentId, clientId]);




	const handleDrawerOpen = () => {
		setIsDrawerOpen(true);
		dispatch(getComment(commentId, client_commentId));
		setClose(true)
	}

	const handleOpenComment = () => {
		setGeneralComment(!generalComment)
		dispatch(getGeneralComment(commentId));
	}






	const fetchCategories = async (campaign_id) => {
		const kpiData = await getKpis(campaign_id);
		if (kpiData) {

			setkpiCategory(kpiData);
		}
	};


	useEffect(() => {
		if (commentId) {
			fetchCategories(commentId);
		}
	}, [commentId]);


	useEffect(() => {
		if (kpiCategory?.aggregated_kpis && Array.isArray(kpiCategory?.aggregated_kpis)) {
			setFinalCategoryOrder(kpiCategory?.aggregated_kpis);
		} else {
			setFinalCategoryOrder(categoryOrder);
		}
	}, [kpiCategory]);


	const extractedData = extractKPIByFunnelStage(campaignData, kpiCategories);
	const aggregatedStats = aggregateKPIStatsFromExtracted(extractedData, kpiCategories)
	const statsData = mapKPIStatsToStatsDataDynamic(aggregatedStats, kpiCategories, { upfull, downfull, downoffline, upoffline }, finalCategoryOrder);

	const processedCampaigns = processCampaignData(clientCampaignData, platformIcons)

	return (
		<>
			<div id="page-wrapper-client">
				<Header setIsOpen={setIsOpen} campaigns={campaigns} loading={loading} />
				<ClientCommentsDrawer isOpen={isDrawerOpen} onClose={setIsDrawerOpen} campaign={campaign} />
				<main className="!px-0 mt-[30px] bg-[#F9FAFB]">
					<div className={`px-[20px]  ${isDrawerOpen ? 'md:px-[50px]' : 'xl:px-[100px]'}`}>
						<div className='flex	flex-col gap-[24px]'>
							<ApproverContainer campaign={campaign} loading={loading} isLoadingCampaign={isLoadingCampaign} />
							<General campaign={campaign} loading={loading} isLoadingCampaign={isLoadingCampaign} campaign_id={campaignId} />
							<BrandAwareness statsData={statsData} aggregatedStats={aggregatedStats} loading={isLoadingKpis} isLoadingCampaign={isLoadingCampaign} />
							<ClientMessageContainer isOpen={isDrawerOpen} isCreateOpen={isCreateOpen} campaign={campaign} />
							<div className="mt-[50px] flex flex-col justify-between gap-4 md:flex-row">
								<div></div>
								{/* <ClientToggleSwitch active={active} setActive={setActive} /> */}

								<div className="flex gap-[12px] md:flex-row">
									<button
										className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
										style={{ border: "1px solid #3175FF" }} >
										See Budget Overview
									</button>
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
								<GeneralComment />}

						</div>
					</div>
					<div className='mt-[50px]'>
						{isLoadingCampaign ? <TableLoader isLoading={isLoadingCampaign} /> : ""}
					</div>
					<MainSection hideDate={true} disableDrag={true} campaignData={campaignData} />
					{/* <div >
						{active === "Timeline view" && }
						<div className="md:px-[150px] xl:px-[200px]">
							{active === "Table" && <ClientTableView channels={channels} />}
						</div>

					</div> */}
					{processedCampaigns?.map((campaign, index) => {
						const channelD = extractPlatforms(campaign)

						return (
							<div key={index} className="flex justify-center gap-[48px] mt-[100px]">
								<div className="box-border flex flex-row items-start p-6 gap-[72px] w-[493px] h-[403px] bg-[#F9FAFB] rounded-lg">
									<div className="flex flex-col">
										<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
											Your budget by phase for {campaign?.media_plan_details?.plan_name}
										</h3>
										<div className="flex items-center gap-5">
											<div className="mt-[16px]">
												<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
													Total budget
												</p>

												<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
													{campaign?.campaign_budget?.amount} {campaign?.campaign_budget?.currency}
												</h3>
											</div>
											<div className="mt-[16px]">
												<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
													Campaign phases
												</p>

												<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
													{campaign?.channel_mix?.length} phases
												</h3>
											</div>
										</div>

										<div className="flex items-center gap-6 mt-[24px] w-full">
											{/* Doughnut Chat */}
											<DoughnutChat
												data={campaign?.channel_mix?.map((ch) =>
													Number(ch?.stage_budget?.percentage_value || 0)?.toFixed(0),
												)}
												color={campaign?.channel_mix?.map((ch) =>
													ch?.funnel_stage === "Awareness"
														? "#3175FF"
														: ch?.funnel_stage === "Consideration"
															? "#00A36C"
															: ch?.funnel_stage === "Conversion"
																? "#FF9037"
																: "#F05406",
												)}
												insideText={`${campaign?.campaign_budget?.amount || 0} ${campaign?.campaign_budget?.currency ? getCurrencySymbol(campaign?.campaign_budget?.currency) : ""
													}`}
											/>
											{/* Campaign Phases */}
											<CampaignPhases
												campaignPhases={campaign?.channel_mix?.map((ch) => ({
													name: ch?.funnel_stage,
													percentage: Number(ch?.stage_budget?.percentage_value || 0)?.toFixed(0),
													color:
														ch?.funnel_stage === "Awareness"
															? "#3175FF"
															: ch?.funnel_stage === "Consideration"
																? "#00A36C"
																: ch?.funnel_stage === "Conversion"
																	? "#FF9037"
																	: "#F05406",
												}))}
											/>
										</div>
									</div>
								</div>

								<div className="flex flex-col">
									<div
										key={index}
										className="box-border flex flex-col items-start p-6 gap-[5px] w-[493px] min-h-[545px] bg-[#F9FAFB] rounded-lg"
									>
										<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
											Your budget by channel
										</h3>
										<div className="mt-[16px]">
											<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
												Channels
											</p>
											<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
												{channelD?.length} channels
											</h3>
										</div>
										<ChannelDistributionChatTwo
											channelData={channelD}
											currency={getCurrencySymbol(campaign?.campaign_budget?.currency)}
										/>
									</div>
								</div>
							</div>
						)
					})}
					ffff
				</main>

				<SignatureModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
				/>
				<ApproveModel isOpen={isOpen} setIsOpen={setIsOpen} />
			</div>
		</>
	)
}

export default ClientView


