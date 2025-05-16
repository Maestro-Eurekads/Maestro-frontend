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
import { aggregateKPIStatsFromExtracted, categoryOrder, extractKPIByFunnelStage, kpiCategories, mapKPIStatsToStatsDataDynamic } from 'components/Options';
import MainSection from './compoment/Timeline/main-section';
import ChannelDistributionChatTwo from 'components/ChannelDistribution/ChannelDistributionChatTwo';
import { getCurrencySymbol, platformIcons } from 'components/data';
import CampaignPhases from 'app/creation/components/CampaignPhases';
import { extractPlatforms } from 'app/creation/components/EstablishedGoals/table-view/data-processor';
import { processCampaignData } from 'components/processCampaignData';
import DoughnutChat from 'components/DoughnutChat';
import ConfigureBudgetComponet from 'app/creation/components/ConfigureAdSetsAndBudget/ConfigureBudgetComponet';




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
	const [show, setShow] = useState(false);
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
										style={{ border: "1px solid #3175FF" }} onClick={() => setShow(!show)}>{!show ? "See" : "Hide"} budget overview
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
					<div >
						<ConfigureBudgetComponet show={show} t1={"Your budget by campaign phase"} t2={undefined} funnelData={extractedData} />
					</div>
					<div className='mt-[50px]'>
						{isLoadingCampaign ? <TableLoader isLoading={isLoadingCampaign} /> : ""}
					</div>
					<MainSection hideDate={true} disableDrag={true} campaignData={campaignData} />


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


