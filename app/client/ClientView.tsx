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
	const { isDrawerOpen, setIsDrawerOpen, isCreateOpen, setClose, modalOpen, setModalOpen, selected } = useComments();
	const [isOpen, setIsOpen] = useState(false);
	const [generalComment, setGeneralComment] = useState(false);
	const [active, setActive] = useState("Timeline view");
	const { clientCampaignData, campaignData } = useCampaigns();
	const { data, campaignDetails, isLoadingCampaign } = useAppSelector((state) => state.comment);
	const comments: Comment[] = data
		?.filter((comment: Comment) => comment?.addcomment_as !== "Internal")
		.sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	const allApproved = (comments?.length || 0) > 0 && comments.every((comment: Comment) => comment?.approved === true);
	const dispatch = useAppDispatch();
	// const commentId = campaignData?.documentId
	const { campaigns, loading, fetchCampaignsByClientId } = useClientCampaign();
	const { data: session }: any = useSession();
	const clientId = session?.user?.id;
	const client_commentId = session?.user?.id;
	const campaign = !campaignDetails ? [] : campaignDetails[0];
	const commentId = campaign?.documentId
	const { getKpis,
		kpisData,
		isFetchingKpis,
		getKpisError } = useKpis();

	console.log('kpisData-kpisData-kpisData', kpisData?.aggregated_kpis
	)

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
			// dispatch(getCampaignById(clientId, selected));
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

	const kpiCategories = {
		"Video Views": [
			"VTR", "CPV", "Completed View", "Video Views", "Completion Rate", "CPCV"
		],
		"Engagement": [
			"Eng Rate", "Engagements", "CPE"
		],
		"Traffic": [
			"CTR", "CPC", "Lands", "Link Clicks", "Click to land rate", "CPL",
			"Avg Visit Time", "Avg pages/visit", "Bounce Rate", "Bounced Visits",
			"Cost/bounce", "Lead Rate", "Lead visits", "Cost/lead",
			"Off-funnel rate", "Off-funnel visits", "Cost/Off funnel"
		],
		"Lead Generation (On platform)": [
			"CTR", "Cost / opened form", "Leads", "Forms open", "CVR", "Cost / lead"
		],
		"Lead Generation (On website)": [
			"CTR", "CPC", "Lands", "CVR", "Cost / lead", "Link clicks",
			"Click to land rate", "CPL", "Leads"
		],
		"Purchase": [
			"CTR", "CPC", "Lands", "Link Clicks", "Click to land rate", "CPL",
			"Avg Visit Time", "Avg pages/visit", "Bounce Rate", "Bounced Visits",
			"Cost/bounce", "Lead Rate", "Lead visits", "Cost/lead",
			"Off-funnel rate", "Off-funnel visits", "Cost/Off funnel",
			"Conversions", "CVR", "Cost/conversion",
			"CLV of associated product", "Generated Revenue", "Return on Ad Spent",
			"Add to cart rate", "Add to carts", "CPATC",
			"Payment info rate", "Payment infos", "CPPI",
			"Purchase rate", "Purchases", "CPP",
			"Conversion", "Cost/conversion"
		],
		"App Install": [
			"CTR", "CPC", "Installs", "Link Clicks", "Install Rate", "CPI"
		],
		"In-App Conversion": [
			"CTR", "CPC", "App Open", "Link Clicks", "Open Rate", "Cost/App Open",
			"CVR", "Cost/conversion", "CLV of associated product",
			"Generated Revenue", "Return on Ad Spent",
			"Conversion", "Cost/conversion"
		],
		"Awareness Metrics": [
			"CPM", "Frequency", "Reach", "Impressions"
		]
	};


	// function mapKPIStatsToStatsDataDynamic(aggregatedStats, kpiCategories, icons) {
	// 	const categoryMapping = [
	// 		{
	// 			title: "Brand Awareness",
	// 			kpiCategory: "Awareness Metrics",
	// 			background: "#E5F2F7",
	// 			icons: { up: icons.upfull, down: icons.downoffline },
	// 			indicatorIndex: 0,
	// 			priorityKPIs: ["Reach", "Frequency", "Impressions"],
	// 		},
	// 		{
	// 			title: "Traffic",
	// 			kpiCategory: "Traffic",
	// 			background: "#E6F4D5",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			indicatorIndex: 1,
	// 			priorityKPIs: ["CTR", "Link Clicks", "Bounce Rate"],
	// 		},
	// 		{
	// 			title: "Purchase",
	// 			kpiCategory: "Purchase",
	// 			background: "#FFE2C5",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			indicatorIndex: 2,
	// 			priorityKPIs: ["CTR", "Purchases", "CVR"],
	// 		},
	// 		{
	// 			title: "Lead Generation",
	// 			kpiCategory: "Lead Generation (On platform)",
	// 			background: "#E5F2F7",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			indicatorIndex: 3,
	// 			priorityKPIs: ["CVR", "Leads", "Cost / lead"],
	// 		},
	// 		{
	// 			title: "App Installs",
	// 			kpiCategory: "App Install",
	// 			background: "#E6F4D5",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			indicatorIndex: 4,
	// 			priorityKPIs: ["CTR", "Installs", "Install Rate"],
	// 		},
	// 		{
	// 			title: "Engagement",
	// 			kpiCategory: "Engagement",
	// 			background: "#FFE2C5",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			indicatorIndex: 5,
	// 			priorityKPIs: ["Eng Rate", "Engagements", "CPE"],
	// 		},
	// 		{
	// 			title: "In-App Conversion",
	// 			kpiCategory: "In-App Conversion",
	// 			background: "#E5F2F7",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			indicatorIndex: 6,
	// 			priorityKPIs: ["CTR", "CPC", "App Open", "Link Clicks", "Open Rate"],
	// 		},
	// 		{
	// 			title: "Video Views",
	// 			kpiCategory: "Video Views",
	// 			background: "#E6F4D5",
	// 			icons: { up: icons.upoffline, down: icons.downfull },
	// 			indicatorIndex: 7,
	// 			priorityKPIs: ["VTR", "Video Views", "Completion Rate"],
	// 		},
	// 	];

	// 	const formatKPIValue = (value, kpiName) => {
	// 		if (value === undefined || value === null) {
	// 			if (kpiName.includes("Cost") || kpiName.includes("CPL")) return "$0";
	// 			if (kpiName.includes("Rate") || kpiName === "CTR" || kpiName === "CVR" || kpiName === "Frequency") return "0%";
	// 			return "0";
	// 		}
	// 		const formattedValue = value.toString();
	// 		if (kpiName.includes("Cost") || kpiName.includes("CPL")) return `$${formattedValue}`;
	// 		if (kpiName.includes("Rate") || kpiName === "CTR" || kpiName === "CVR" || kpiName === "Frequency") return `${formattedValue}%`;
	// 		return formattedValue;
	// 	};

	// 	return React.useMemo(() => {
	// 		return categoryMapping?.map((category) => {
	// 			const kpiData = aggregatedStats[category?.kpiCategory] || {};
	// 			const availableKPIs = Object.keys(kpiData);

	// 			const selectedKPIs = [
	// 				...category?.priorityKPIs.filter((kpi) => availableKPIs.includes(kpi)),
	// 				...availableKPIs.filter((kpi) => !category?.priorityKPIs.includes(kpi)),
	// 			].map((kpiName) => ({
	// 				label: kpiName,
	// 				value: formatKPIValue(kpiData[kpiName], kpiName),
	// 			}));

	// 			const indicators = Array(8).fill("#C0C0C0");
	// 			indicators[category?.indicatorIndex] = "#3175FF";

	// 			return {
	// 				title: category?.title,
	// 				background: category?.background,
	// 				stats: selectedKPIs?.length > 0 ? selectedKPIs : [{ label: "No Data", value: "0" }],
	// 				indicators,
	// 				icons: category?.icons,
	// 				kpiCategory: category?.kpiCategory, // Added to access category in rendering
	// 			};
	// 		});
	// 	}, [aggregatedStats, kpiCategories, icons]);
	// }
	function mapKPIStatsToStatsDataDynamic(aggregatedStats = {}, kpiCategories, icons) {
		const categoryMapping = [
			{
				title: "Brand Awareness",
				kpiCategory: "Awareness Metrics",
				background: "#E5F2F7",
				icons: { up: icons.upfull, down: icons.downoffline },
				indicatorIndex: 0,
				priorityKPIs: ["Reach", "Frequency", "Impressions"],
			},
			{
				title: "Traffic",
				kpiCategory: "Traffic",
				background: "#E6F4D5",
				icons: { up: icons.upfull, down: icons.downfull },
				indicatorIndex: 1,
				priorityKPIs: ["CTR", "Link Clicks", "Bounce Rate"],
			},
			{
				title: "Purchase",
				kpiCategory: "Purchase",
				background: "#FFE2C5",
				icons: { up: icons.upfull, down: icons.downfull },
				indicatorIndex: 2,
				priorityKPIs: ["CTR", "Purchases", "CVR"],
			},
			{
				title: "Lead Generation",
				kpiCategory: "Lead Generation (On platform)",
				background: "#E5F2F7",
				icons: { up: icons.upfull, down: icons.downfull },
				indicatorIndex: 3,
				priorityKPIs: ["CVR", "Leads", "Cost / lead"],
			},
			{
				title: "App Installs",
				kpiCategory: "App Install",
				background: "#E6F4D5",
				icons: { up: icons.upfull, down: icons.downfull },
				indicatorIndex: 4,
				priorityKPIs: ["CTR", "Installs", "Install Rate"],
			},
			{
				title: "Engagement",
				kpiCategory: "Engagement",
				background: "#FFE2C5",
				icons: { up: icons.upfull, down: icons.downfull },
				indicatorIndex: 5,
				priorityKPIs: ["Eng Rate", "Engagements", "CPE"],
			},
			{
				title: "In-App Conversion",
				kpiCategory: "In-App Conversion",
				background: "#E5F2F7",
				icons: { up: icons.upfull, down: icons.downfull },
				indicatorIndex: 6,
				priorityKPIs: ["CTR", "CPC", "App Open", "Link Clicks", "Open Rate"],
			},
			{
				title: "Video Views",
				kpiCategory: "Video Views",
				background: "#E6F4D5",
				icons: { up: icons.upoffline, down: icons.downfull },
				indicatorIndex: 7,
				priorityKPIs: ["VTR", "Video Views", "Completion Rate"],
			},
		];

		const formatKPIValue = (value, kpiName) => {
			if (value === undefined || value === null) {
				if (kpiName.includes("Cost") || kpiName.includes("CPL")) return "$0";
				if (kpiName.includes("Rate") || kpiName === "CTR" || kpiName === "CVR" || kpiName === "Frequency")
					return "0%";
				return "0";
			}
			const formattedValue = value.toString();
			if (kpiName.includes("Cost") || kpiName.includes("CPL")) return `$${formattedValue}`;
			if (kpiName.includes("Rate") || kpiName === "CTR" || kpiName === "CVR" || kpiName === "Frequency")
				return `${formattedValue}%`;
			return formattedValue;
		};

		return React.useMemo(() => {
			return categoryMapping.map((category) => {
				// Safely access kpiData, defaulting to an empty object if undefined
				const kpiData = aggregatedStats[category?.kpiCategory] || {};
				const availableKPIs = Object.keys(kpiData);

				const selectedKPIs = [
					...category.priorityKPIs.filter((kpi) => availableKPIs.includes(kpi)),
					...availableKPIs.filter((kpi) => !category.priorityKPIs.includes(kpi)),
				].map((kpiName) => ({
					label: kpiName,
					value: formatKPIValue(kpiData[kpiName], kpiName),
				}));

				const indicators = Array(8).fill("#C0C0C0");
				indicators[category.indicatorIndex] = "#3175FF";

				return {
					title: category.title,
					background: category.background,
					stats: selectedKPIs.length > 0 ? selectedKPIs : [{ label: "No Data", value: "0" }],
					indicators,
					icons: category.icons,
					kpiCategory: category.kpiCategory,
				};
			});
		}, [aggregatedStats, kpiCategories, icons]);
	}

	// const aggregatedStats = kpisData?.aggregated_kpis
	const aggregatedStats = {}
	const statsData = mapKPIStatsToStatsDataDynamic(aggregatedStats, kpiCategories, { upfull, downfull, downoffline, upoffline });


	return (
		<>
			<div id="page-wrapper-client">
				<Header setIsOpen={setIsOpen} campaigns={campaigns} loading={loading} />
				<ClientCommentsDrawer isOpen={isDrawerOpen} onClose={setIsDrawerOpen} campaign={campaign} />
				<main className="!px-0 mt-[30px] bg-[#F9FAFB]">
					<div className={`px-[20px]  ${isDrawerOpen ? 'md:px-[50px]' : 'xl:px-[100px]'}`}>

						<div className='flex	flex-col gap-[24px]'>
							<ApproverContainer campaign={campaign} loading={loading} isLoadingCampaign={isLoadingCampaign} />

							<General campaign={campaign} loading={loading} isLoadingCampaign={isLoadingCampaign} />

							<BrandAwareness statsData={statsData} aggregatedStats={aggregatedStats} />
							<ClientMessageContainer isOpen={isDrawerOpen} isCreateOpen={isCreateOpen} campaign={campaign} />
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