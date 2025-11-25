"use client"
import React, { useEffect, useState } from 'react'
import Header from './Header';
import ApproverContainer from './ApproverContainer';
import General from './General';
import BrandAwareness from './BrandAwareness';
import ApproveModel from './Modal/ApproveModel';
import GeneralComment from './GeneralComment';
import { RxDotFilled } from "react-icons/rx";
import { useComments } from 'app/utils/CommentProvider';
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
import ConfigureBudgetComponet from 'app/creation/components/ConfigureAdSetsAndBudget/ConfigureBudgetComponet';
import Skeleton from 'react-loading-skeleton';
import EnhancedMainSection from 'app/creation/components/organisms/main-section/enhanced-main-section';
import { toast } from 'sonner';
import ComfirmModelClient from 'components/Modals/ComfirmModelClient';




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
	const { clientCampaignData, campaignData, getActiveCampaign, campaignFormData, jwt } = useCampaigns();
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

	console.log('campaignData', campaignData)




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
		if (selected && jwt) {
			dispatch(getCampaignById({ clientId: clientId, campaignId: selected, jwt }));
			dispatch(getComment({ commentId, jwt, client_commentId }));
			dispatch(getGeneralComment({ commentId, jwt }));
		}
	}, [selected, commentId, client_commentId, clientId, jwt]);





	const handleDrawerOpen = () => {
		setIsDrawerOpen(true);
		dispatch(getComment({ commentId, jwt, client_commentId }));
		setClose(true)
	}

	const handleOpenComment = () => {
		setGeneralComment(!generalComment)
		dispatch(getGeneralComment({ commentId, jwt }));
	}


	const handleCheckCampaign = () => {
		toast.error("Please Select a Campaign!");
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

	//console.log("Final Category Order:", campaignData);



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
							<ApproverContainer campaign={campaignData} loading={loading} isLoadingCampaign={isLoadingCampaign} />
							<General
								campaign={Array.isArray(campaignFormData) ? campaignFormData[0] || {} : campaignFormData || {}}
								loading={loading}
								isLoadingCampaign={isLoadingCampaign}
							/>

							<BrandAwareness statsData={statsData} aggregatedStats={aggregatedStats} loading={isLoadingKpis} isLoadingCampaign={isLoadingCampaign} campaign={campaignData} />
							<ClientMessageContainer isOpen={isDrawerOpen} isCreateOpen={isCreateOpen} campaign={campaign} />
							<div className="mt-[50px] flex flex-col justify-between gap-4 md:flex-row">
								<div></div>

								<div className="flex gap-[12px] md:flex-row">
									{/* <ComfirmModelClient /> */}
									<button
										className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
										style={{ border: "1px solid #3175FF" }} onClick={() => setShow(!show)}>{!show ? "See" : "Hide"} budget overview
									</button>
									<button
										className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
										style={{ border: "1px solid #3175FF" }}
										onClick={() => {
											if (campaignData) {
												handleOpenComment();
											} else {
												handleCheckCampaign();
											}
										}}
									>
										General Comment
									</button>
									<button
										onClick={() => {
											if (campaignData) {
												handleDrawerOpen();
											} else {
												handleCheckCampaign();
											}
										}}

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

					<div>
						{isLoadingCampaign ?
							<div className='w-full h-[500px] flex flex-col gap-[50px] m-20px'>
								<Skeleton height={20} width={600} />
								<Skeleton height={20} width={700} />
								<Skeleton height={20} width={800} />
								<Skeleton height={20} width={"100%"} />
								<Skeleton height={20} width={"100%"} />
								<Skeleton height={20} width={"100%"} />
							</div> : !campaignData ? "" :

								<EnhancedMainSection hideDate={false} disableDrag={true} view={true} />}

					</div>



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


