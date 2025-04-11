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
import { getComment } from 'features/Comment/commentSlice';
import Image from "next/image";
import tickcircles from "../../public/solid_circle-check.svg";
import { useSession } from 'next-auth/react';
import SignatureModal from './Modal/SignatureModal';
import { useClientCampaign } from './ClientCampaignContext';
import TableLoader from 'app/creation/components/TableLoader';
import ClientCommentsDrawer from './compoment/ClientDrawer/ClientCommentsDrawer';
import ClientMessageContainer from './compoment/ClientDrawer/ClientMessageContainer';


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
	const { isDrawerOpen, setIsDrawerOpen, isCreateOpen, setClose, modalOpen, setModalOpen } = useComments();
	const [isOpen, setIsOpen] = useState(false);
	const [generalComment, setGeneralComment] = useState(false);
	const [active, setActive] = useState("Timeline view");
	const { clientCampaignData, campaignData } = useCampaigns();
	const { data } = useAppSelector((state) => state.comment);
	const comments: Comment[] = data
		?.filter((comment: Comment) => comment?.addcomment_as !== "Internal")
		.sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	const allApproved = (comments?.length || 0) > 0 && comments.every((comment: Comment) => comment?.approved === true);
	const dispatch = useAppDispatch();
	const commentId = campaignData?.documentId
	const { campaigns, loading, fetchCampaignsByClientId } = useClientCampaign();
	const { data: session }: any = useSession();
	const clientId = session?.user?.id;
	const client_commentId = session?.user?.id;
	// const campaign = campaigns[0];

	// console.log("campaigns-campaigns", comments)
	useEffect(() => {
		if (clientId) {
			fetchCampaignsByClientId(clientId);
		}
	}, [clientId]);


	// console.log("campaigns-campaigns", campaign?.client?.documentId);

	const handleDrawerOpen = () => {
		setIsDrawerOpen(true);
		dispatch(getComment(commentId, client_commentId));
		setClose(true)
	}

	return (
		<>
			<div id="page-wrapper-client">
				<Header setIsOpen={setIsOpen} />
				<ClientCommentsDrawer isOpen={isDrawerOpen} onClose={setIsDrawerOpen} />
				<main className="!px-0 mt-[20px] bg-[#F9FAFB]">
					<div className={`px-[50px]  ${isDrawerOpen ? 'md:px-[50px]' : 'xl:px-[150px]'}`}>

						<div className='flex	flex-col gap-[24px]'>
							<ApproverContainer />

							<General />

							<BrandAwareness />
							<ClientMessageContainer isOpen={isDrawerOpen} isCreateOpen={isCreateOpen} />
							<div className="mt-[50px] flex flex-col justify-between gap-4 md:flex-row">
								<ClientToggleSwitch active={active} setActive={setActive} />

								<div className="flex gap-[12px] md:flex-row">
									<button
										className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
										style={{ border: "1px solid #3175FF" }} >
										See Budget Overview
									</button>
									<button
										className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
										style={{ border: "1px solid #3175FF" }}
										onClick={() => setGeneralComment(!generalComment)}>
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
						{loading ? <TableLoader isLoading={loading} /> : ""}
					</div>
					<div >
						{active === "Timeline view" && <TimelineView />}
						<div className="md:px-[150px] xl:px-[200px]">
							{active === "Table" && <ClientTableView channels={channels} />}
						</div>

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