import React, { useEffect, useState } from 'react'
import DateComponent from './molecules/date-component/date-component';
import ConfigureBudgetComponet from './ConfigureAdSetsAndBudget/ConfigureBudgetComponet';
import OverviewOfYourCampaigntimeline from './OverviewOfYourCampaign/OverviewOfYourCampaigntimeline';
import { useDateRange } from '../../../src/date-range-context';
import { categoryOrder, kpiCategories, mapKPIStatsToStatsDataDynamic, parseApiDate } from '../../../components/Options';
import { useCampaigns } from '../../utils/CampaignsContext';
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
import KPIEditorModal from 'components/Modals/KPIEditorModal';
import downoffline from "../../../public/arrow-down-outline.svg";
import upfull from "../../../public/arrow-up-full.svg";
import downfull from "../../../public/arrow-down-full.svg";
import upoffline from "../../../public/arrow-up-offline.svg";
import { useKpis } from 'app/utils/KpiProvider';

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
	const { clientCampaignData, campaignData, isLoading: isLoadingCampaign } = useCampaigns();
	const dispatch = useAppDispatch();
	const query = useSearchParams();
	const commentId = query.get("campaignId");
	const [finalCategoryOrder, setFinalCategoryOrder] = useState(categoryOrder); // default fallback
	const { getKpis, isLoadingKpis, kpiCategory, setkpiCategory, refresh, setRefresh } = useKpis();

	// const commentId = campaignData?.documentId
	const comments: Comment[] = clientCampaignData
		?.filter((comment: Comment) => comment?.addcomment_as !== "Internal")
		.sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	const allApproved = (comments?.length || 0) > 0 && comments?.every((comment: Comment) => comment?.approved === true);

	useEffect(() => {
		if (refresh) {
			const timer = setTimeout(() => setRefresh(false), 3000);
			return () => clearTimeout(timer);
		}
	}, [refresh]);

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







	function extractKPIByFunnelStage(data, kpiCategories) {
		const result = {};
		const channelMix = data?.channel_mix;

		channelMix?.forEach((stage) => {
			const funnelStage = stage?.funnel_stage;
			result[funnelStage] = [];

			const socialMedia = stage?.social_media || [];
			socialMedia.forEach((platform) => {
				const platformName = platform?.platform_name;
				const kpi = platform?.kpi || {};
				const groupedKPIs = {};

				Object.keys(kpiCategories).forEach((category) => {
					groupedKPIs[category] = {};
					const kpiList = kpiCategories[category];

					kpiList?.forEach((kpiName) => {
						const kpiKey = kpiName
							.toLowerCase()
							.replace(/ /g, "_")
							.replace("/", "__");
						if (kpi[kpiKey] !== undefined && kpi[kpiKey] !== null) {
							groupedKPIs[category][kpiName] = kpi[kpiKey];
						}
					});

					if (Object.keys(groupedKPIs[category])?.length === 0) {
						delete groupedKPIs[category];
					}
				});

				result[funnelStage].push({
					platform_name: platformName,
					kpi: groupedKPIs, // Fixed: Changed zonedKPIs to groupedKPIs
				});
			});
		});

		return result;
	}

	function aggregateKPIStatsFromExtracted(extractedData, kpiCategories) {
		const kpiAccumulator = {};

		Object.keys(kpiCategories).forEach((category) => {
			kpiAccumulator[category] = {};
			kpiCategories[category].forEach((kpiName) => {
				kpiAccumulator[category][kpiName] = {
					values: [],
					displayName: kpiName,
				};
			});
		});

		Object.keys(extractedData).forEach((funnelStage) => {
			const platforms = extractedData[funnelStage] || [];

			platforms.forEach((platform) => {
				const kpi = platform?.kpi || {};

				Object.keys(kpiCategories).forEach((category) => {
					const kpiList = kpiCategories[category];
					const categoryData = kpi[category] || {};

					kpiList.forEach((kpiName) => {
						if (categoryData[kpiName] !== undefined && categoryData[kpiName] !== null) {
							kpiAccumulator[category][kpiName].values.push(categoryData[kpiName]);
						}
					});
				});
			});
		});

		const aggregatedStats = {};

		Object.keys(kpiAccumulator).forEach((category) => {
			aggregatedStats[category] = {};

			Object.keys(kpiAccumulator[category]).forEach((kpiName) => {
				const kpiData = kpiAccumulator[category][kpiName];
				const values = kpiData?.values;

				if (values.length > 0) {
					const average = values.reduce((sum, val) => sum + val, 0) / values?.length;
					aggregatedStats[category][kpiData?.displayName] = Number(average.toFixed(2));
				}
			});

			if (Object.keys(aggregatedStats[category])?.length === 0) {
				delete aggregatedStats[category];
			}
		});

		return aggregatedStats;
	}





	// function mapKPIStatsToStatsDataDynamic(aggregatedStats, kpiCategories, icons, finalCategoryOrder) {
	// 	const categoryMappingBase = {
	// 		"Awareness Metrics": {
	// 			title: "Brand Awareness",
	// 			background: "#E5F2F7",
	// 			icons: { up: icons.upfull, down: icons.downoffline },
	// 			priorityKPIs: ["Reach", "Frequency", "Impressions"]
	// 		},
	// 		"Traffic": {
	// 			title: "Traffic",
	// 			background: "#E6F4D5",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			priorityKPIs: ["CTR", "Link Clicks", "Bounce Rate"]
	// 		},
	// 		"Purchase": {
	// 			title: "Purchase",
	// 			background: "#FFE2C5",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			priorityKPIs: ["CTR", "Purchases", "CVR"]
	// 		},
	// 		"Lead Generation (On platform)": {
	// 			title: "Lead Generation Platform",
	// 			background: "#E5F2F7",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			priorityKPIs: ["CVR", "Leads", "Cost / lead"]
	// 		},
	// 		"Lead Generation (On website)": {
	// 			title: "Lead Generation Website",
	// 			background: "#E5F2F7",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			priorityKPIs: ["CVR", "Leads", "Cost / lead"]
	// 		},
	// 		"App Install": {
	// 			title: "App Installs",
	// 			background: "#E6F4D5",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			priorityKPIs: ["CTR", "Installs", "Install Rate"]
	// 		},
	// 		"Engagement": {
	// 			title: "Engagement",
	// 			background: "#FFE2C5",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			priorityKPIs: ["Eng Rate", "Engagements", "CPE"]
	// 		},
	// 		"In-App Conversion": {
	// 			title: "In-App Conversion",
	// 			background: "#E5F2F7",
	// 			icons: { up: icons.upfull, down: icons.downfull },
	// 			priorityKPIs: ["CTR", "CPC", "App Open", "Link Clicks", "Open Rate"]
	// 		},
	// 		"Video Views": {
	// 			title: "Video Views",
	// 			background: "#E6F4D5",
	// 			icons: { up: icons.upoffline, down: icons.downfull },
	// 			priorityKPIs: ["VTR", "Video Views", "Completion Rate"]
	// 		}
	// 	};

	// 	const formatKPIValue = (value, kpiName) => {
	// 		if (value === undefined || value === null) {
	// 			if (kpiName.includes("Cost") || kpiName.includes("CPL")) return "$0";
	// 			if (kpiName.includes("Rate") || ["CTR", "CVR", "Frequency"].includes(kpiName)) return "0%";
	// 			return "0";
	// 		}
	// 		const formattedValue = value.toString();
	// 		if (kpiName.includes("Cost") || kpiName.includes("CPL")) return `$${formattedValue}`;
	// 		if (kpiName.includes("Rate") || ["CTR", "CVR", "Frequency"].includes(kpiName)) return `${formattedValue}%`;
	// 		return formattedValue;
	// 	};

	// 	return React.useMemo(() => {
	// 		return finalCategoryOrder?.filter((kpiCategory) => aggregatedStats[kpiCategory]) // Only include if data exists
	// 			?.map((kpiCategory, index) => {
	// 				const category = categoryMappingBase[kpiCategory];
	// 				const kpiData = aggregatedStats[kpiCategory] || {};
	// 				const availableKPIs = Object.keys(kpiData);

	// 				const selectedKPIs = [
	// 					...category?.priorityKPIs?.filter((kpi) => availableKPIs.includes(kpi)),
	// 					...availableKPIs?.filter((kpi) => !category?.priorityKPIs?.includes(kpi)),
	// 				].map((kpiName) => ({
	// 					label: kpiName,
	// 					value: formatKPIValue(kpiData[kpiName], kpiName),
	// 				}));

	// 				const indicators = Array(finalCategoryOrder?.length).fill("#C0C0C0");
	// 				indicators[index] = "#3175FF";

	// 				return {
	// 					title: category?.title,
	// 					background: category?.background,
	// 					stats: selectedKPIs?.length > 0 ? selectedKPIs : [{ label: "No Data", value: "0" }],
	// 					indicators,
	// 					icons: category?.icons,
	// 					kpiCategory,
	// 				};
	// 			});
	// 	}, [aggregatedStats, kpiCategories, icons]);
	// }


	const extractedData = extractKPIByFunnelStage(campaignData, kpiCategories);
	const aggregatedStats = aggregateKPIStatsFromExtracted(extractedData, kpiCategories)
	const statsData = mapKPIStatsToStatsDataDynamic(aggregatedStats, kpiCategories, { upfull, downfull, downoffline, upoffline }, finalCategoryOrder);






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
	}, [commentId, refresh]);

	useEffect(() => {
		if (kpiCategory?.aggregated_kpis && Array.isArray(kpiCategory?.aggregated_kpis)) {
			setFinalCategoryOrder(kpiCategory?.aggregated_kpis);
		} else {
			setFinalCategoryOrder(categoryOrder);
		}
	}, [kpiCategory]);
	// console.log("kpiData-kpiData", kpiCategory?.aggregated_kpis)

	// console.log('aggregatedStats-aggregatedStats-aggregatedStats', aggregatedStats);
	// console.log('statsData-statsData-statsData', statsData);

	return (
		<div>
			<div className={`px-[20px]  ${isDrawerOpen ? 'md:px-[30px]' : 'xl:px-[60px]'}`}>
				<div className='flex	flex-col gap-[24px]'>
					<BusinessApproverContainer campaign={campaignData} loading={undefined} isLoadingCampaign={isLoadingCampaign} />
					<BusinessGeneral campaign={campaignData} loading={undefined} isLoadingCampaign={isLoadingCampaign} />
					<BusinessBrandAwareness statsData={statsData} aggregatedStats={aggregatedStats} loading={isLoadingKpis} isLoadingCampaign={isLoadingCampaign} />
					<div className="mt-[50px] flex flex-col justify-between gap-4 md:flex-row">
						<div className="flex gap-[12px] md:flex-row">
							<button className="overview-budget-conponent"
								onClick={() => setShow(!show)}>{!show ? "See" : "Hide"} budget overview</button>
							<KPIEditorModal
								aggregatedStats={aggregatedStats} campaign_id={commentId} finalCategoryOrder={finalCategoryOrder} />
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
				<div >
					<ConfigureBudgetComponet show={show} t1={"Your budget by campaign phase"} t2={undefined} />
				</div>
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




// const normalizeKpiKey = (key) => {
// 	const keyMap = {
// 		'cost__off_funnel': 'Cost/Off funnel',
// 		'cost__lead': 'Cost/lead',
// 		'cost__opened_form': 'Cost / opened form',
// 		'cost__app_open': 'Cost/App Open',
// 		'cost__conversion': 'Cost/conversion',
// 		'costlead': 'Cost/lead',
// 		'costbounce': 'Cost/bounce',
// 		'avg_pages__visit': 'Avg pages/visit',
// 		'avg_visit_time': 'Avg Visit Time',
// 		'link_clicks': 'Link Clicks',
// 		'completed_view': 'Completed View',
// 		'video_views': 'Video Views',
// 		'completion_rate': 'Completion Rate',
// 		'eng_rate': 'Eng Rate',
// 		'click_to_land_rate': 'Click to land rate',
// 		'bounced_visits': 'Bounced Visits',
// 		'lead_visits': 'Lead visits',
// 		'off_funnel_visits': 'Off-funnel visits',
// 		'off_funnel_rate': 'Off-funnel rate',
// 		'clv_of_associated_product': 'CLV of associated product',
// 		'generated_revenue': 'Generated Revenue',
// 		'return_on_ad_spent': 'Return on Ad Spent',
// 		'add_to_cart_rate': 'Add to cart rate',
// 		'add_to_carts': 'Add to carts',
// 		'cpatc': 'CPATC',
// 		'payment_info_rate': 'Payment info rate',
// 		'payment_infos': 'Payment infos',
// 		'cppi': 'CPPI',
// 		'purchase_rate': 'Purchase rate',
// 		'purchases': 'Purchases',
// 		'cpp': 'CPP',
// 		'app_open': 'App Open',
// 		'open_rate': 'Open Rate',
// 		'forms_open': 'Forms open',
// 		'install_rate': 'Install Rate',
// 		'lead_rate': 'Lead Rate',
// 		'conversions': 'Conversions',
// 		'conversion': 'Conversion'
// 	};
// 	return keyMap[key] || key.toUpperCase();
// };
