import React, { useEffect, useState } from 'react'
import DateComponent from './molecules/date-component/date-component';
import ConfigureBudgetComponet from './ConfigureAdSetsAndBudget/ConfigureBudgetComponet';
// import OverviewOfYourCampaigntimeline from './OverviewOfYourCampaign/OverviewOfYourCampaigntimeline';
import { useDateRange } from '../../../src/date-context';
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
import AlertMain from 'components/Alert/AlertMain';
import MainSection from './organisms/main-section/main-section';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import differenceInCalendarWeeks from 'date-fns/differenceInCalendarWeeks';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import { min } from 'date-fns';
import { max } from 'moment';
import { differenceInDays } from 'date-fns';
import { parseISO } from 'date-fns';
import { processCampaignData } from 'components/processCampaignData';
import { getCurrencySymbol, getPlatformIcon } from 'components/data';
import { useVersionContext } from 'app/utils/VersionApprovalContext';


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
	const { createsSuccess, updateSuccess } = useVersionContext();
	const [show, setShow] = useState(false);
	const [generalComment, setGeneralComment] = useState(false);
	const [alert, setAlert] = useState(null);
	const [showalert, setshowAlert] = useState(false);
	const { range, setRange } = useDateRange();
	const { clientCampaignData, campaignData, isLoading: isLoadingCampaign, campaignFormData } = useCampaigns();
	const dispatch = useAppDispatch();
	const query = useSearchParams();
	const commentId = query.get("campaignId");
	const [finalCategoryOrder, setFinalCategoryOrder] = useState(categoryOrder); // default fallback
	const { getKpis, isLoadingKpis, kpiCategory, setkpiCategory, refresh, setRefresh } = useKpis();


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

	useEffect(() => {
		setClose(true);
		//@ts-ignore
		setRange("Day")
	}, []);




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
			socialMedia?.forEach((platform) => {
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
							kpiAccumulator[category][kpiName]?.values?.push(categoryData[kpiName]);
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

				if (values?.length > 0) {
					const average = values.reduce((sum, val) => sum + val, 0) / values?.length;
					aggregatedStats[category][kpiData?.displayName] = average; // No toFixed here
				}
			});

			if (Object.keys(aggregatedStats[category])?.length === 0) {
				delete aggregatedStats[category];
			}
		});

		return aggregatedStats;
	}

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




	useEffect(() => {
		if (alert) {
			const timer = setTimeout(() => { setAlert(null), setshowAlert(false) }, 3000);
			return () => clearTimeout(timer);
		}
	}, [alert]);


	useEffect(() => {
		if (showalert) {
			setAlert({
				variant: "error", message: "No kpi Data", position: "bottom-right"
			});
		}
	}, [showalert]);




	// Types for platforms and channels
	type IPlatform = {
		name: string
		icon: any
		style?: string
		mediaOptions?: any[]
		isExpanded?: boolean
	}
	type IChannel = {
		title: string
		platforms: IPlatform[]
		style?: string
	}



	const startDates = clientCampaignData
		?.filter((c) => c?.campaign_timeline_start_date)
		?.map((ch) => ch?.campaign_timeline_start_date !== null && parseISO(ch?.campaign_timeline_start_date))
	const endDates = clientCampaignData
		?.filter((c) => c?.campaign_timeline_end_date)
		?.map((ch) => ch?.campaign_timeline_end_date !== null && parseISO(ch?.campaign_timeline_end_date))

	// Find the earliest startDate and latest endDate
	const earliestStartDate = min(startDates)
	// const latestEndDate = max(endDates)
	// Calculate the week difference

	// const monthDifference = differenceInCalendarMonths(latestEndDate, earliestStartDate)
	const daysDiff = differenceInDays(endDates, startDates);
	const monthDifference = daysDiff / 30.44;

	const funnelsData = clientCampaignData?.map((ch) => {
		const start = ch?.campaign_timeline_start_date ? parseISO(ch.campaign_timeline_start_date) : null
		const end = ch?.campaign_timeline_end_date ? parseISO(ch.campaign_timeline_end_date) : null

		// Calculate positions for different time ranges
		const startDay = differenceInCalendarDays(start, earliestStartDate) + 1
		const endDay = differenceInCalendarDays(end, earliestStartDate) + 1



		const startWeek = differenceInCalendarWeeks(start, earliestStartDate) + 1
		const endWeek = differenceInCalendarWeeks(end, earliestStartDate) + 1

		const startMonth = differenceInCalendarMonths(start, earliestStartDate) + 1
		const endMonth = differenceInCalendarMonths(end, earliestStartDate) + 1

		const funnels = ch?.funnel_stages
		return {
			startDay,
			endDay,
			startWeek,
			endWeek,
			startMonth,
			endMonth,
			label: ch?.media_plan_details?.plan_name,
			stages: ch?.channel_mix?.map((d) => ({
				name: d?.funnel_stage,
				budget: d?.stage_budget?.fixed_value,
			})),
			budget: `${ch?.campaign_budget?.amount} ${getCurrencySymbol(ch?.campaign_budget?.currency)}`,
		}
	})







	return (
		<div>
			{alert && <AlertMain alert={alert} />}
			{/* Alert */}
			{createsSuccess && (
				<AlertMain
					alert={{
						variant: 'success',
						message: 'Media plan version created!',
						position: 'bottom-right',
					}}
				/>
			)}
			{updateSuccess && (
				<AlertMain
					alert={{
						variant: 'success',
						message: 'Media plan version updated!',
						position: 'bottom-right',
					}}
				/>
			)}
			<div className={`px-[20px]  ${isDrawerOpen ? 'md:px-[30px]' : 'xl:px-[60px]'}`}>
				<div className='flex	flex-col gap-[24px]'>
					<BusinessApproverContainer campaign={campaignData} loading={undefined} isLoadingCampaign={isLoadingCampaign} />
					<BusinessGeneral campaign={campaignData} loading={undefined} isLoadingCampaign={isLoadingCampaign}
						campaign_id={commentId} />
					<BusinessBrandAwareness statsData={statsData} aggregatedStats={aggregatedStats} loading={isLoadingKpis} isLoadingCampaign={isLoadingCampaign} />
					<div className="mt-[50px] flex flex-col justify-between gap-4 md:flex-row">
						<div className="flex gap-[12px] md:flex-row">
							<button className="overview-budget-conponent"
								onClick={() => setShow(!show)}>{!show ? "See" : "Hide"} budget overview</button>

							{Object.keys(aggregatedStats)?.length === 0 ? <button
								className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
								style={{ border: "1px solid #3175FF" }}
								onClick={() => setshowAlert(true)}
							>
								Edit KPI
							</button> :
								<KPIEditorModal
									aggregatedStats={aggregatedStats} campaign_id={commentId} finalCategoryOrder={finalCategoryOrder} />}

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
								{allApproved ? <Image src={tickcircles} alt="tickcircle" className="w-[18px] " /> :
									<RxDotFilled size={20} color='#FF0302' />}
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
					<ConfigureBudgetComponet show={show} t1={"Your budget by campaign phase"} t2={undefined} funnelData={extractedData} />
				</div>
			</div>
			<div>

				<div className='mt-[30px]'>
					<DateComponent useDate={true} />
				</div>

				<MessageContainer isOpen={isDrawerOpen} isCreateOpen={isCreateOpen} />
				{/* <OverviewOfYourCampaigntimeline dateList={range} funnels={funnelsData} setIsDrawerOpen={setIsDrawerOpen} openComments={isDrawerOpen} /> */}
				<MainSection hideDate={true} disableDrag={true} />
			</div>

		</div>
	)
}

export default OverviewofyourCampaign





