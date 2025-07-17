import React, { useEffect, useState } from "react";
import DateComponent from "./molecules/date-component/date-component";
import ConfigureBudgetComponet from "./ConfigureAdSetsAndBudget/ConfigureBudgetComponet";
// import OverviewOfYourCampaigntimeline from './OverviewOfYourCampaign/OverviewOfYourCampaigntimeline';
import { useDateRange } from "../../../src/date-context";
import {
  categoryOrder,
  kpiCategories,
  mapKPIStatsToStatsDataDynamic,
  parseApiDate,
} from "../../../components/Options";
import { useCampaigns } from "../../utils/CampaignsContext";
import MessageContainer from "components/Drawer/MessageContainer";
import { useComments } from "app/utils/CommentProvider";
import { useAppDispatch } from "store/useStore";

import BusinessGeneral from "../BusinessView/BusinessGeneral";
import BusinessBrandAwareness from "../BusinessView/BusinessBrandAwareness";
import BusinessApproverContainer from "../BusinessView/BusinessApproverContainer";
import Image from "next/image";
import BusinessGeneralComment from "../BusinessView/BusinessGeneralComment";
import tickcircles from "../../../public/solid_circle-check.svg";
import { RxDotFilled } from "react-icons/rx";
import { useSearchParams } from "next/navigation";
import KPIEditorModal from "components/Modals/KPIEditorModal";
import downoffline from "../../../public/arrow-down-outline.svg";
import upfull from "../../../public/arrow-up-full.svg";
import downfull from "../../../public/arrow-down-full.svg";
import upoffline from "../../../public/arrow-up-offline.svg";
import { useKpis } from "app/utils/KpiProvider";
import AlertMain from "components/Alert/AlertMain";
import MainSection from "./organisms/main-section/main-section";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import differenceInCalendarWeeks from "date-fns/differenceInCalendarWeeks";
import differenceInCalendarMonths from "date-fns/differenceInCalendarMonths";
import { min } from "date-fns";
import { max } from "moment";
import { differenceInDays } from "date-fns";
import { parseISO } from "date-fns";
import { processCampaignData } from "components/processCampaignData";
import { getCurrencySymbol, getPlatformIcon } from "components/data";
import { useVersionContext } from "app/utils/VersionApprovalContext";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import { useSession } from "next-auth/react";
import { getComment, getGeneralComment } from "features/Comment/commentSlice";
import { useActive } from "app/utils/ActiveContext";
import VersionPromptModal from "components/ApprovalModals/VersionPromptModal";

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
  const { setChange } = useActive()
  const { isDrawerOpen, setIsDrawerOpen, isCreateOpen, setClose, close } =
    useComments();
  const { createsSuccess, updateSuccess } = useVersionContext();
  const [show, setShow] = useState(false);
  const [generalComment, setGeneralComment] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showalert, setshowAlert] = useState(false);
  const { range, setRange } = useDateRange();
  const {
    clientCampaignData,
    campaignData,
    isLoading: isLoadingCampaign,
    campaignFormData,
    jwt,
    loadingCampaign,
    getActiveCampaign,
  } = useCampaigns();
  const dispatch = useAppDispatch();
  const query = useSearchParams();
  const commentId = query.get("campaignId");
  const campaignId = query.get("campaignId");
  const [finalCategoryOrder, setFinalCategoryOrder] = useState(categoryOrder);



  const {
    getKpis,
    isLoadingKpis,
    kpiCategory,
    setkpiCategory,
    refresh,
    setRefresh,
  } = useKpis();

  useEffect(() => {
    if (campaignId) {
      getActiveCampaign(campaignId);
    }
  }, [campaignId]);

  const comments: Comment[] = clientCampaignData
    ?.filter((comment: Comment) => comment?.addcomment_as !== "Internal")
    .sort(
      (a: Comment, b: Comment) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const allApproved =
    (comments?.length || 0) > 0 &&
    comments?.every((comment: Comment) => comment?.approved === true);

  useEffect(() => {
    if (refresh) {
      const timer = setTimeout(() => setRefresh(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [refresh]);

  useEffect(() => {
    setClose(true);
    //@ts-ignore
    setRange("Day");
  }, []);

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
    dispatch(getComment({ commentId, jwt }));
    setClose(true);
  };
  const handleOpenComment = () => {
    setGeneralComment(!generalComment);
    dispatch(getGeneralComment({ commentId, jwt }));
  };

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
            if (
              categoryData[kpiName] !== undefined &&
              categoryData[kpiName] !== null
            ) {
              kpiAccumulator[category][kpiName]?.values?.push(
                categoryData[kpiName]
              );
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
          const average =
            values.reduce((sum, val) => sum + val, 0) / values?.length;
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
  const aggregatedStats = aggregateKPIStatsFromExtracted(
    extractedData,
    kpiCategories
  );
  const statsData = mapKPIStatsToStatsDataDynamic(
    aggregatedStats,
    kpiCategories,
    { upfull, downfull, downoffline, upoffline },
    finalCategoryOrder
  );

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
    if (
      kpiCategory?.aggregated_kpis &&
      Array.isArray(kpiCategory?.aggregated_kpis)
    ) {
      setFinalCategoryOrder(kpiCategory?.aggregated_kpis);
    } else {
      setFinalCategoryOrder(categoryOrder);
    }
  }, [kpiCategory]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null), setshowAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    if (showalert) {
      toast.error("No kpi Data!")
    }
  }, [showalert]);

  const stage = campaignData?.isStatus?.stage;


  return (
    <div>
      <div
        className={`px-[20px]  ${isDrawerOpen ? "md:px-[30px]" : "xl:px-[60px]"
          }`}
      >
        <div className="flex	flex-col gap-[24px]">
          <div className="flex flex-row justify-between">

            <div className="bg-white w-fit p-2 h-fit rounded-md shadow-[0px_4px_14px_rgba(0,38,116,0.15)]">
              {campaignFormData?.media_plan && (<p>{campaignFormData?.media_plan}</p>)}
            </div>
            {(!stage || stage === "client_changes_needed" || stage === "changes_needed") && <VersionPromptModal />}

          </div>


          <BusinessApproverContainer
            campaign={campaignData}
            loading={undefined}
            isLoadingCampaign={loadingCampaign}
            campaignFormData={campaignFormData}
          />
          <BusinessGeneral
            campaign={campaignData}
            loading={undefined}
            isLoadingCampaign={loadingCampaign}
            campaign_id={commentId}
          />
          <BusinessBrandAwareness
            statsData={statsData}
            aggregatedStats={aggregatedStats}
            loading={isLoadingKpis}
            isLoadingCampaign={loadingCampaign}
            campaign={campaignData}
          />
          <MessageContainer isOpen={isDrawerOpen} isCreateOpen={isCreateOpen} />
          <div className="mt-[50px] flex flex-col justify-between gap-4 md:flex-row">
            <div className="flex gap-[12px] md:flex-row">
              <button
                className="overview-budget-conponent"
                onClick={() => setShow(!show)}
              >
                {!show ? "See" : "Hide"} budget overview
              </button>

              {Object.keys(aggregatedStats)?.length === 0 ? (
                <button
                  className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
                  style={{ border: "1px solid #3175FF" }}
                  onClick={() => setshowAlert(true)}
                >
                  Edit KPI
                </button>
              ) : (
                <KPIEditorModal
                  aggregatedStats={aggregatedStats}
                  campaign_id={commentId}
                  finalCategoryOrder={finalCategoryOrder}
                />
              )}

              <button
                className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
                style={{ border: "1px solid #3175FF" }}
                onClick={handleOpenComment}
              >
                General Comment
              </button>
              <button
                onClick={handleDrawerOpen}
                className="bg-[#FAFDFF]  rounded-[10px] py-[14px] px-6 self-start flex items-center	gap-[4px]"
                style={{ border: "1px solid #3175FF" }}
              >
                {allApproved ? (
                  <Image
                    src={tickcircles}
                    alt="tickcircle"
                    className="w-[18px] "
                  />
                ) : (
                  <RxDotFilled size={20} color="#FF0302" />
                )}
                <span className="text-[16px] font-[600] text-[#3175FF]">
                  See Focus Comments
                </span>
              </button>
            </div>
            {/* General Comment */}
          </div>
          {generalComment && <BusinessGeneralComment />}
        </div>
      </div>
      <div className="creation_continer">
        <div>
          <ConfigureBudgetComponet
            show={show}
            t1={"Your budget by campaign phase"}
            t2={undefined}
            funnelData={extractedData}
          />
        </div>
      </div>
      <div>
        <div className="mt-[30px]">
          <DateComponent useDate={true} hideRange={true} />
        </div>

        {isLoadingCampaign ?
          <div className='w-full h-[500px] flex flex-col gap-[50px] m-20px'>
            <Skeleton height={20} width={600} />
            <Skeleton height={20} width={700} />
            <Skeleton height={20} width={800} />
            <Skeleton height={20} width={"100%"} />
            <Skeleton height={20} width={"100%"} />
            <Skeleton height={20} width={"100%"} />
          </div> : !campaignData ? [] :
            <MainSection hideDate={true} disableDrag={true} />}
      </div>
    </div>
  );
};

export default OverviewofyourCampaign;
