"use client";
import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Button from "./common/button";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import {
 formatNumberWithCommas,
 getPlatformIcon,
 mediaTypes,
} from "components/data";
import { useCampaigns } from "app/utils/CampaignsContext";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";

interface OutletType {
 id: number;
 outlet: string;
 icon: StaticImageData;
 ad_sets: any;
 budget: {
  fixed_value;
  percetage_value;
 };
 channel: any;
}

const ConfiguredSetPage = ({ netAmount }) => {
 const [openItems, setOpenItems] = useState({
  Awareness: false,
  Consideration: false,
  Conversion: false,
 });

 const [stageStatus, setStageStatus] = useState({
  Awareness: "Not started",
  Consideration: "Not started",
  Conversion: "Not started",
 });

 const { campaignFormData, setCampaignFormData } = useCampaigns();
 const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({});

 const getPlatformsFromStage = (channelMix) => {
  if (channelMix?.length > 0) {
   const platformsByStage: Record<string, OutletType[]> = {};
   channelMix?.forEach((stage: any) => {
    const {
     funnel_stage,
     search_engines,
     display_networks,
     social_media,
     streaming,
     ooh,
     broadcast,
     messaging,
     print,
     e_commerce,
     in_game,
     mobile,
    } = stage;

    if (!platformsByStage[funnel_stage]) {
     platformsByStage[funnel_stage] = [];
    }

    mediaTypes?.forEach((channel, index) => {
     if (stage[channel]) {
      if (Array.isArray(stage[channel])) {
       stage[channel].forEach((platform: any) => {
        const icon = getPlatformIcon(platform?.platform_name);
        if (icon) {
         platformsByStage[funnel_stage].push({
          id: Math.floor(Math.random() * 1000000),
          outlet: platform.platform_name,
          ad_sets: platform?.ad_sets,
          icon,
          budget: platform?.budget,
          channel,
         });
        }
       });
      }
     }
    });
   });

   return platformsByStage;
  }
 };

 useEffect(() => {
  if (campaignFormData?.channel_mix) {
   const data = getPlatformsFromStage(campaignFormData.channel_mix);
   setPlatforms(data);
  }
  // Log custom_funnels to verify icon data
  console.log("ConfiguredSetPage custom_funnels:", campaignFormData?.custom_funnels);
 }, [campaignFormData]);

 const [validatedStages, setValidatedStages] = useState({
  Awareness: false,
  Consideration: false,
  Conversion: false,
 });

 const [results, setResults] = useState({
  Awareness: [],
  Consideration: [],
  Conversion: [],
 });

 const toggleItem = (stage) => {
  setOpenItems((prev) => ({ ...prev, [stage]: !prev[stage] }));
 };

 const getCurrencySymbol = (currencyCode) => {
  switch (currencyCode) {
   case "EUR":
    return "€";
   case "USD":
    return "$";
   case "GBP":
    return "£";
   case "NGN":
    return "₦";
   case "JPY":
    return "¥";
   case "CAD":
    return "$";
   default:
    return "€";
  }
 };

 const isButtonEnabled = (stage) => {
  const stageData = campaignFormData?.channel_mix?.find(
   (ch) => ch?.funnel_stage === stage
  );

  if (stageData?.stage_budget?.fixed_value) {
   return true;
  }

  const hasPlatformBudget = mediaTypes.some((type) =>
   stageData?.[type]?.some(
    (platform) =>
     platform?.budget?.fixed_value &&
     Number(platform.budget.fixed_value) > 0
   )
  );

  const hasAdSetBudget = mediaTypes.some((type) =>
   stageData?.[type]?.some((platform) =>
    platform?.ad_sets?.some(
     (adSet) =>
      adSet?.budget?.fixed_value && Number(adSet.budget.fixed_value) > 0
    )
   )
  );

  return hasPlatformBudget || hasAdSetBudget;
 };

 useEffect(() => {
  // Update status when budget changes
  campaignFormData?.funnel_stages.forEach((stageName) => {
   const stageData = campaignFormData?.channel_mix?.find(
    (ch) => ch?.funnel_stage === stageName
   );

   if (stageData?.stage_budget?.fixed_value > 0) {
    setStageStatus((prev) => ({
     ...prev,
     [stageName]: validatedStages[stageName] ? "Completed" : "In progress",
    }));
   } else {
    setStageStatus((prev) => ({
     ...prev,
     [stageName]: "Not started",
    }));
   }
  });
 }, [campaignFormData, validatedStages]);

 const handleValidateClick = (stage) => {
  setValidatedStages((prev) => ({ ...prev, [stage]: true }));
  setStageStatus((prev) => ({ ...prev, [stage]: "Completed" }));

  const stageData = campaignFormData?.channel_mix?.find(
   (ch) => ch?.funnel_stage === stage
  );

  const newResults = [];

  // Add stage budget
  if (stageData?.stage_budget?.fixed_value) {
   newResults.push({
    platform: "Top",
    budget: stageData.stage_budget.fixed_value,
    currency: campaignFormData?.campaign_budget?.currency,
   });
  }

  // Add platform budgets
  mediaTypes.forEach((type) => {
   stageData?.[type]?.forEach((platform) => {
    if (platform?.budget?.fixed_value) {
     newResults.push({
      platform: platform.platform_name,
      budget: platform.budget.fixed_value,
      currency: campaignFormData?.campaign_budget?.currency,
     });
    }
    // Add ad set budgets
    platform?.ad_sets?.forEach((adSet) => {
     if (adSet?.budget?.fixed_value) {
      newResults.push({
       platform: `${platform.platform_name} - ${adSet.name}`,
       budget: adSet.budget.fixed_value,
       currency: campaignFormData?.campaign_budget?.currency,
      });
     }
    });
   });
  });

  setResults((prev) => ({ ...prev, [stage]: newResults }));
 };

 const handleAutoSplitBudget = (stage, channel, platform) => {
  const stageData = campaignFormData.channel_mix.find(
   (ch) => ch.funnel_stage === stage.funnel_stage
  );
  const findPlatform = stageData[channel]?.find(
   (ch) => ch?.platform_name === platform
  );
  if (stageData) {
   const totalStageBudget = Number(findPlatform?.budget?.fixed_value);

   const totalAdSetCount = findPlatform?.ad_sets?.reduce((acc, ad) => {
    const extraAudienceCount = ad?.extra_audiences?.length || 0;
    return acc + 1 + extraAudienceCount;
   }, 0);

   const splitBudget = (totalStageBudget / totalAdSetCount).toFixed(2);

   const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
    if (ch.funnel_stage === stage.funnel_stage) {
     if (ch[channel]) {
      ch[channel] = ch[channel].map((p) => {
       if (p.platform_name === platform) {
        const updatedPlatform = {
         ...p,
         ad_sets: p.ad_sets?.map((adSet) => {
          const updatedExtraAudiences = adSet.extra_audiences?.map(
           (extraAudience) => ({
            ...extraAudience,
            budget: {
             fixed_value: splitBudget,
             percentage_value: (
              (Number(splitBudget) /
               Number(findPlatform?.budget?.fixed_value)) *
              100
             ).toFixed(1),
            },
           })
          );

          return {
           ...adSet,
           budget: {
            fixed_value: splitBudget,
            percentage_value: (
             (Number(splitBudget) /
              Number(findPlatform?.budget?.fixed_value)) *
             100
            ).toFixed(1),
           },
           extra_audiences: updatedExtraAudiences,
          };
         }),
        };
        return updatedPlatform;
       }
       return p;
      });
     }
    }
    return ch;
   });
   setCampaignFormData({
    ...campaignFormData,
    channel_mix: updatedChannelMix,
   });
  }
 };

 const handleResetBudget = (stage, channel, platform) => {
  const stageData = campaignFormData.channel_mix.find(
   (ch) => ch.funnel_stage === stage.funnel_stage
  );
  const findPlatform = stageData[channel]?.find(
   (ch) => ch?.platform_name === platform
  );

  if (stageData) {
   const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
    if (ch.funnel_stage === stage.funnel_stage) {
     if (ch[channel]) {
      ch[channel] = ch[channel].map((p) => {
       if (p.platform_name === platform) {
        const updatedPlatform = {
         ...p,
         ad_sets: p.ad_sets?.map((adSet) => {
          const updatedExtraAudiences = adSet.extra_audiences?.map(
           (extraAudience) => ({
            ...extraAudience,
            budget: {
             fixed_value: "",
             percentage_value: "",
            },
           })
          );

          return {
           ...adSet,
           budget: {
            fixed_value: "",
            percentage_value: "",
           },
           extra_audiences: updatedExtraAudiences,
          };
         }),
        };
        return updatedPlatform;
       }
       return p;
      });
     }
    }
    return ch;
   });

   setCampaignFormData({
    ...campaignFormData,
    channel_mix: updatedChannelMix,
   });
  }
 };

 // Validate custom_funnels before rendering
 if (!campaignFormData?.custom_funnels || campaignFormData.custom_funnels.length === 0) {
  return (
   <div className="mt-12 text-red-500">
    Error: Funnel stages are not configured. Please set up funnel stages first.
   </div>
  );
 }

 return (
  <div className="mt-12 flex items-start flex-col gap-12 w-full">
   {campaignFormData?.funnel_stages.map((stageName, index) => {
    const totalBudget = netAmount || 0;
    const stageBudget =
     campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === stageName
     )?.stage_budget?.fixed_value || 0;
    const percentage = totalBudget ? (stageBudget / totalBudget) * 100 : 0;
    const stage = campaignFormData?.custom_funnels?.find(
     (s) => s.name === stageName
    );
    if (!stage) {
     //  console.warn(`Stage not found in custom_funnels: ${stageName}`);
     return null;
    }
    // Log stage icon data
    // console.log(`Stage: ${stage.name}, Icon: ${stage.icon}, ActiveIcon: ${stage.activeIcon}`);
    return (
     <div key={index} className="w-full">
      <div
       className="flex items-center justify-between px-6 py-4 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
       onClick={() => toggleItem(stage.name)}
      >
       <div className="flex items-center gap-4">
        {stage?.icon ? (
         <Image
          src={stage.icon} // Use icon directly as string path
          alt={`${stage.name} icon`}
          width={20}
          height={20}
         />
        ) : (
         <span className="w-5 h-5" /> // Placeholder for text-only funnels
        )}
        <p className="text-md font-semibold text-[#061237]">
         {stage.name}
        </p>
       </div>
       <div className="flex items-center gap-2">
        <p
         className={`font-semibold text-base ${stageStatus[stage.name] === "Completed"
          ? "text-green-500 flex items-center gap-2"
          : stageStatus[stage.name] === "In progress"
           ? "text-[#3175FF]"
           : "text-[#061237] opacity-50"
          }`}
        >
         {stageStatus[stage.name]}
         {stageStatus[stage.name] === "Completed" && <FaCheckCircle />}
        </p>
       </div>
       <div>
        {openItems[stage.name] ? (
         <Image src={up || "/placeholder.svg"} alt="collapse" />
        ) : (
         <Image src={down2 || "/placeholder.svg"} alt="expand" />
        )}
       </div>
      </div>

      {openItems[stage.name] && (
       <>
        <div className="pt-4 bg-[#FCFCFC] rounded-lg cursor-pointer border px-6 border-[rgba(6,18,55,0.1)]">
         <div className="flex mt-6 flex-col items-start gap-8">
          <div className="flex mb-8 justify-center gap-6">
           <div className="flex flex-col gap-4">
            <h2 className="text-center font-bold">
             What is your budget for this phase ?
            </h2>
            <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
             <p className="font-bold">
              {getCurrencySymbol(
               campaignFormData?.campaign_budget?.currency
              )}
             </p>
             <input
              type="text"
              className="w-full px-4 focus:outline-none"
              disabled={validatedStages[stageName]}
              value={
               formatNumberWithCommas(
                campaignFormData?.channel_mix?.find(
                 (ch: { funnel_stage: string }) =>
                  ch?.funnel_stage === stageName
                )?.stage_budget?.fixed_value
               ) || ""
              }
              onChange={(e) => {
               const inputValue = e.target.value.replace(/,/g, ""); // Remove commas
               const newBudget = Number(inputValue);
               const currentTotal =
                campaignFormData?.channel_mix?.reduce(
                 (
                  acc: number,
                  stage: {
                   stage_budget: { fixed_value: string };
                  }
                 ) => {
                  return (
                   acc +
                   (Number(stage?.stage_budget?.fixed_value) || 0)
                  );
                 },
                 0
                ) || 0;
               if (
                currentTotal - (Number(stageBudget) || 0) + newBudget <=
                totalBudget
               ) {
                const updatedChannelMix =
                 campaignFormData.channel_mix.map(
                  (ch: {
                   funnel_stage: string;
                   stage_budget: {
                    fixed_value: string;
                    percentage_value: string;
                   };
                  }) => {
                   if (ch.funnel_stage === stage.name) {
                    return {
                     ...ch,
                     stage_budget: {
                      ...ch.stage_budget,
                      fixed_value: newBudget?.toString(),
                      percentage_value: String(
                       (newBudget / totalBudget) * 100
                      ),
                     },
                    };
                   }
                   return ch;
                  }
                 );
                setCampaignFormData({
                 ...campaignFormData,
                 channel_mix: updatedChannelMix,
                });
               } else {
                toast(
                 "The sum of all stage budgets cannot exceed the total budget.",
                 {
                  position: "bottom-right",
                  type: "error",
                  theme: "colored",
                 }
                );
               }
              }}
             />
             {campaignFormData?.campaign_budget?.currency}
            </div>
           </div>

           <div className="flex items-start flex-col gap-4">
            <h2 className="text-center font-bold">Percentage</h2>
            <div className="flex items-center gap-4">
             <div className=" bg-[#FFFFFF] rounded-[10px] min-w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
              <div className="flex items-center gap-2">
               <p>
                {isNaN(percentage) ? "0.0" : percentage?.toFixed(1)}
               </p>
               <span> %</span>
              </div>
             </div>
             <p className="tracking-tight">of total budget</p>
            </div>
           </div>
          </div>

          <hr className="text-gray-200 w-full p-1" />

          {platforms[stage.name]?.map((platform, index) => {
           const stage = campaignFormData?.channel_mix?.find(
            (stage) => stage.funnel_stage === stageName
           );
           if (!stage) return "";

           const channelTypes = mediaTypes;

           let platformBudget = "";
           for (const channelType of channelTypes) {
            const foundPlatform = stage[channelType]?.find(
             (p) => p.platform_name === platform?.outlet
            );
            if (foundPlatform) {
             platformBudget = foundPlatform?.budget?.fixed_value || "";
             break;
            }
           }
           const budgetValue = platformBudget;
           const totalStageBudge = stage?.stage_budget?.fixed_value;
           const platformPercentage = totalStageBudge
            ? Number((Number(budgetValue) / totalStageBudge) * 100)
            : 0;

           return (
            <div
             key={`${stageName}${platform?.outlet}${index}`}
             className="w-full"
             id={`${stageName}${platform?.outlet}${index}`}
            >
             <div className="flex mb-8 items-end justify- gap-3">
              <div className="flex items-start flex-col gap-2">
               {platform?.ad_sets?.length > 0 && (
                <div className="flex rounded-[50px] bg-[#00A36C1A] border border-[#00A36C1A] w-[82px] h-[29px] items-center gap-2">
                 <span className="text-[#00A36C] pl-2">
                  {platform?.ad_sets?.length} ad sets
                 </span>
                </div>
               )}

               <div className="flex gap-2 indent-[10px]">
                {campaignFormData?.campaign_budget?.level ===
                 "Adset level" &&
                 platform?.ad_sets?.length > 0 && (
                  <div className="l-shape-container-cb">
                   <div className="l-vertical-cb"></div>
                   <div className="l-horizontal-cb"></div>
                   {campaignFormData?.campaign_budget?.level ===
                    "Adset level" &&
                    platform?.ad_sets?.length > 1 && (
                     <>
                      <div
                       className="l-vertical-cb-long"
                       style={{
                        height:
                         platform?.ad_sets[0]?.extra_audiences
                          ?.length > 0
                          ? `${Number(
                           110 *
                           (platform?.ad_sets[0]?.extra_audiences
                            ?.length +
                            2)
                          )}px`
                          : platform?.ad_sets?.length > 1
                           ? `${Number(
                            110 * platform?.ad_sets?.length
                           )}px`
                           : "330px",
                       }}
                      ></div>
                      <div
                       className="l-horizontal-cb-long"
                       style={{
                        bottom:
                         platform?.ad_sets[0]?.extra_audiences
                          ?.length > 0
                          ? `-${Number(
                           121 *
                           (platform?.ad_sets[0]?.extra_audiences
                            ?.length +
                            2)
                          )}px`
                          : platform?.ad_sets?.length > 1
                           ? `-${Number(
                            132 * platform?.ad_sets?.length
                           )}px`
                           : "-375px",
                       }}
                      ></div>
                     </>
                    )}
                  </div>
                 )}
               </div>
               <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[200px] h-[50px] rounded-[10px] items-center gap-2">
                <div className="flex justify-between w-full px-4 items-center">
                 <div className="flex items-center gap-2">
                  <Image
                   src={platform?.icon || "/placeholder.svg"}
                   className="size-5"
                   alt="facebook"
                  />
                  <span>{platform?.outlet}</span>
                 </div>
                 {campaignFormData?.campaign_budget?.level ===
                  "Adset level" &&
                  platform?.ad_sets?.length > 0 && (
                   <Image
                    src={down2 || "/placeholder.svg"}
                    className="size-5"
                    alt="arrow down"
                   />
                  )}
                </div>
               </div>
              </div>

              <div className="flex items-start flex-col gap-4">
               <h2 className="text-center font-bold">Budget</h2>
               <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
                <p className="font-bold">
                 {getCurrencySymbol(
                  campaignFormData?.campaign_budget?.currency
                 )}
                </p>
                <input
                 type="text"
                 className="w-full px-4 focus:outline-none"
                 value={formatNumberWithCommas(budgetValue)}
                 disabled={validatedStages[stageName]}
                 onChange={(e) => {
                  const inputValue = e.target.value.replace(/,/g, "");
                  const newBudget = inputValue;
                  setCampaignFormData((prevData: typeof campaignFormData) => {
                   const updatedChannelMix = prevData.channel_mix.map((ch: any) => {
                    if (ch.funnel_stage === stageName) {
                     const updatedChannelType = channelTypes.find((type) =>
                      ch[type]?.some(
                       (p: any) => p.platform_name === platform.outlet
                      )
                     );
                     if (updatedChannelType) {
                      const totalPlatformBudget = channelTypes.reduce(
                       (acc, type) => {
                        return (
                         acc +
                         ch[type]?.reduce((typeAcc: number, p: any) => {
                          return (
                           typeAcc +
                           (p.platform_name === platform.outlet
                            ? Number(newBudget)
                            : Number(p?.budget?.fixed_value) || 0)
                          );
                         }, 0)
                        );
                       },
                       0
                      );
                      if (totalPlatformBudget <= ch.stage_budget?.fixed_value) {
                       return {
                        ...ch,
                        [updatedChannelType]: ch[updatedChannelType].map(
                         (p: any) =>
                          p.platform_name === platform.outlet
                           ? {
                            ...p,
                            budget: {
                             ...p.budget,
                             fixed_value: newBudget?.toString(),
                            },
                           }
                           : p
                        ),
                       };
                      } else {
                       toast(
                        "The sum of all platform budgets cannot exceed the stage budget.",
                        {
                         toastId: "here",
                         position: "bottom-right",
                         type: "error",
                         theme: "colored",
                        }
                       );
                      }
                     }
                    }
                    return ch;
                   });
                   return {
                    ...prevData,
                    channel_mix: updatedChannelMix,
                   };
                  });
                 }}
                />
                {campaignFormData?.campaign_budget?.currency}
               </div>
              </div>

              <div className="flex items-start flex-col gap-3">
               <h2 className="text-center font-bold">Percentage</h2>
               <div className="flex items-center gap-4">
                <div className=" bg-[#FFFFFF] rounded-[10px] min-w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
                 <div className="flex items-center gap-2">
                  <p>
                   {isNaN(platformPercentage)
                    ? "0.0"
                    : platformPercentage?.toFixed(1)}
                  </p>
                  <span> %</span>
                 </div>
                </div>
                <p className="whitespace-nowrap tracking-tight">
                 of {stageName} budget
                </p>
                {stageName?.funnel_stage === stage.name &&
                 platform?.ad_sets?.length > 1 &&
                 campaignFormData?.campaign_budget?.level === "Adset level" && (
                  <div className="flex items-center gap-2">
                   <label
                    htmlFor={`${stage.name}-${platform?.outlet}`}
                    className="relative inline-block h-6 w-12 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-blue-500 peer-checked:bg-blue-500"
                   >
                    <input
                     type="checkbox"
                     id={`${stage.name}-${platform?.outlet}`}
                     disabled={validatedStages[stageName]}
                     className="peer sr-only"
                     onChange={(e) => {
                      if (e.target.checked) {
                       handleAutoSplitBudget(
                        stage,
                        platform?.channel,
                        platform?.outlet
                       );
                      } else {
                       handleResetBudget(
                        stage,
                        platform?.channel,
                        platform?.outlet
                       );
                      }
                     }}
                    />
                    <span className="absolute inset-y-0 left-0 w-6 h-6 rounded-full bg-white transition-transform duration-200 transform peer-checked:translate-x-6"></span>
                   </label>
                   <p className="text-[#061237] text-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap tracking-tighter">
                    Auto-split budget across ad sets
                   </p>
                  </div>
                 )}
               </div>
              </div>
             </div>
             <div className="pb-8 space-y-6" id="setContainer">
              {campaignFormData?.campaign_budget?.level === "Adset level" &&
               platform?.ad_sets?.map((ad_set, index) => {
                const getAdSetBudget = (adSet) => {
                 return adSet?.budget?.fixed_value && platform.ad_sets?.length
                  ? Number(adSet?.budget?.fixed_value).toFixed(2)
                  : "0";
                };
                const adSetPercentage =
                 (ad_set?.budget?.percentage_value ||
                  platform?.budget?.fixed_value) &&
                  Number(getAdSetBudget(ad_set))
                  ? (
                   (Number(getAdSetBudget(ad_set)) /
                    Number(platform?.budget?.fixed_value)) *
                   100
                  ).toFixed(1)
                  : "0";

                const getAdSetExtraBudget = (adSet, extraIndex) => {
                 return adSet?.extra_audiences[extraIndex]?.budget?.fixed_value
                  ? Number(
                   adSet?.extra_audiences[extraIndex]?.budget?.fixed_value
                  )?.toFixed(2)
                  : "0";
                };
                const getAdSetExtraBudgetPercentage = (adSet, extraIndex) => {
                 const extraBudget =
                  adSet?.extra_audiences[extraIndex]?.budget?.fixed_value || 0;
                 const platformBudget = platform?.budget?.fixed_value || 0;

                 if (platformBudget > 0) {
                  return ((extraBudget / platformBudget) * 100).toFixed(1);
                 }

                 return "0";
                };
                return (
                 <div className="ml-[20px]" key={index}>
                  {campaignFormData?.campaign_budget?.level === "Adset level" &&
                   ad_set?.extra_audiences?.length > 0 && (
                    <div className="flex gap-2 indent-[10px]">
                     <div className="l-shape-container-cb">
                      <div
                       className="l-vertical-cb"
                       style={{
                        height: "120px",
                        top: "61px",
                        left: "-5px",
                       }}
                      ></div>
                      <div
                       className="l-horizontal-cb"
                       style={{
                        bottom: "-182px",
                        left: "-5px",
                        width: "25px",
                       }}
                      ></div>
                     </div>
                    </div>
                   )}
                  <div key={index} className="flex gap-3 items-end">
                   <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[50px] rounded-[10px] items-center gap-2">
                    <div className="flex justify-between w-full px-4 items-center">
                     <div className="flex items-center gap-2">
                      <span>{ad_set?.name}</span>
                     </div>
                    </div>
                   </div>
                   <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[200px] h-[50px] rounded-[10px] items-center gap-2">
                    <div className="flex justify-between w-full px-4 items-center">
                     <div className="flex items-center gap-2">
                      <span>{ad_set?.audience_type}</span>
                     </div>
                    </div>
                   </div>
                   <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[50px] rounded-[10px] items-center gap-2">
                    <div className="flex justify-between w-full px-4 items-center">
                     <div className="flex items-center gap-2">
                      <span>{ad_set?.size}</span>
                     </div>
                    </div>
                   </div>
                   <div className="flex items-start flex-col gap-4">
                    <h2 className="text-center font-bold">Budget</h2>
                    <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
                     <p className="font-bold">
                      {getCurrencySymbol(
                       campaignFormData?.campaign_budget?.currency
                      )}
                     </p>
                     <input
                      type="text"
                      className="w-full px-4 focus:outline-none"
                      value={formatNumberWithCommas(getAdSetBudget(ad_set))}
                      disabled={validatedStages[stageName]}
                      onChange={(e) => {
                       const inputValue = e.target.value.replace(/,/g, "");
                       const newBudget = inputValue;
                       setCampaignFormData((prevData) => {
                        const updatedChannelMix = prevData.channel_mix.map(
                         (ch) => {
                          if (ch.funnel_stage === stageName) {
                           const updatedChannelType = channelTypes.find(
                            (type) =>
                             ch[type]?.some(
                              (p) => p.platform_name === platform.outlet
                             )
                           );

                           if (updatedChannelType) {
                            return {
                             ...ch,
                             [updatedChannelType]: ch[
                              updatedChannelType
                             ].map((p) => {
                              if (
                               p.platform_name === platform.outlet
                              ) {
                               const updatedAdSets = p.ad_sets?.map(
                                (adSet, idx) => {
                                 if (idx === index) {
                                  return {
                                   ...adSet,
                                   budget: {
                                    fixed_value: newBudget,
                                    percentage_value: p.budget
                                     ?.fixed_value
                                     ? (
                                      (Number(newBudget) /
                                       Number(
                                        p.budget.fixed_value
                                       )) *
                                      100
                                     ).toFixed(1)
                                     : "0",
                                   },
                                  };
                                 }
                                 return adSet;
                                }
                               );

                               const totalAdSetBudget =
                                updatedAdSets?.reduce(
                                 (sum, adSet) => {
                                  const extraAudiencesTotal =
                                   adSet.extra_audiences?.reduce(
                                    (extraSum, extraAudience) =>
                                     extraSum +
                                     Number(
                                      extraAudience.budget
                                       ?.fixed_value || 0
                                     ),
                                    0
                                   ) || 0;

                                  return (
                                   sum +
                                   Number(
                                    adSet.budget?.fixed_value || 0
                                   ) +
                                   extraAudiencesTotal
                                  );
                                 },
                                 0
                                );

                               if (
                                totalAdSetBudget >
                                Number(p.budget?.fixed_value)
                               ) {
                                toast(
                                 "The sum of all ad set budgets cannot exceed the platform budget.",
                                 {
                                  position: "bottom-right",
                                  type: "error",
                                  theme: "colored",
                                  toastId: "sum",
                                 }
                                );
                                return p;
                               }

                               return {
                                ...p,
                                ad_sets: updatedAdSets,
                               };
                              }
                              return p;
                             }),
                            };
                           }
                          }
                          return ch;
                         }
                        );

                        return {
                         ...prevData,
                         channel_mix: updatedChannelMix,
                        };
                       });
                      }}
                     />
                     {campaignFormData?.campaign_budget?.currency}
                    </div>
                   </div>
                   <div className="flex items-start flex-col gap-3">
                    <h2 className="text-center font-bold">Percentage</h2>
                    <div className="flex items-center gap-4">
                     <div className=" bg-[#FFFFFF] rounded-[10px] min-w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
                      <div className="flex items-center gap-2">
                       <p>{adSetPercentage}</p>
                       <span> %</span>
                      </div>
                     </div>
                     <p className="whitespace-nowrap tracking-tight">
                      of {platform?.outlet} budget
                     </p>
                    </div>
                   </div>
                  </div>
                  {ad_set?.extra_audiences?.length > 0 &&
                   ad_set?.extra_audiences?.map((addSet, iid) => {
                    return (
                     <div
                      key={iid}
                      className="flex gap-3 items-end ml-[20px] mt-[20px]"
                     >
                      <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[50px] rounded-[10px] items-center gap-2">
                       <div className="flex justify-between w-full px-4 items-center">
                        <div className="flex items-center gap-2">
                         <span>{addSet?.name}</span>
                        </div>
                       </div>
                      </div>
                      <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[200px] h-[50px] rounded-[10px] items-center gap-2">
                       <div className="flex justify-between w-full px-4 items-center">
                        <div className="flex items-center gap-2">
                         <span>{addSet?.audience_type}</span>
                        </div>
                       </div>
                      </div>
                      <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[50px] rounded-[10px] items-center gap-2">
                       <div className="flex justify-between w-full px-4 items-center">
                        <div className="flex items-center gap-2">
                         <span>{addSet?.size}</span>
                        </div>
                       </div>
                      </div>
                      <div className="flex items-start flex-col gap-4">
                       <h2 className="text-center font-bold">Budget</h2>
                       <div className="flex items-center justify-between px-4 w-[200px] h-[50px] border border-[#D0D5DD] rounded-[10px] bg-[#FFFFFF]">
                        <p className="font-bold">
                         {getCurrencySymbol(
                          campaignFormData?.campaign_budget?.currency
                         )}
                        </p>
                        <input
                         type="text"
                         className="w-full px-4 focus:outline-none"
                         disabled={validatedStages[stageName]}
                         value={formatNumberWithCommas(
                          getAdSetExtraBudget(ad_set, iid)
                         )}
                         onChange={(e) => {
                          const inputValue = e.target.value.replace(/,/g, "");
                          const newBudget = Number(inputValue);

                          setCampaignFormData((prevData) => {
                           const updatedChannelMix = prevData.channel_mix.map(
                            (ch) => {
                             if (ch.funnel_stage === stageName) {
                              const updatedChannelType = channelTypes.find(
                               (type) =>
                                ch[type]?.some(
                                 (p) => p.platform_name === platform.outlet
                                )
                              );

                              if (updatedChannelType) {
                               return {
                                ...ch,
                                [updatedChannelType]: ch[
                                 updatedChannelType
                                ].map((p) => {
                                 if (
                                  p.platform_name === platform.outlet
                                 ) {
                                  // Update extra audience budget
                                  const updatedAdSets = p.ad_sets.map(
                                   (adSet, adSetIdx) => {
                                    if (adSetIdx === index) {
                                     const updatedExtraAudiences =
                                      adSet.extra_audiences?.map(
                                       (extra, exIdx) => {
                                        if (exIdx === iid) {
                                         return {
                                          ...extra,
                                          budget: {
                                           fixed_value: newBudget,
                                           percentage_value: p.budget
                                            ?.fixed_value
                                            ? (
                                             (newBudget /
                                              Number(
                                               p.budget.fixed_value
                                              )) *
                                             100
                                            ).toFixed(1)
                                            : "0",
                                          },
                                         };
                                        }
                                        return extra;
                                       }
                                      ) || [];

                                     const totalAdSetBudget =
                                      p.ad_sets.reduce(
                                       (sum, a, currentAdSetIdx) => {
                                        // Calculate the base ad set budget
                                        const adSetTotal = Number(
                                         a.budget?.fixed_value || 0
                                        );

                                        // Calculate extra audiences total
                                        const extraTotal =
                                         a.extra_audiences?.reduce(
                                          (s, ea, currentExtraIdx) => {
                                           // If this is the exact extra audience we're updating, use the new value
                                           if (
                                            currentAdSetIdx === index &&
                                            currentExtraIdx === iid
                                           ) {
                                            return s + newBudget;
                                           }
                                           // Otherwise use the existing value
                                           return (
                                            s +
                                            Number(
                                             ea.budget?.fixed_value || 0
                                            )
                                           );
                                          },
                                          0
                                         ) || 0;

                                        return (
                                         sum + adSetTotal + extraTotal
                                        );
                                       },
                                       0
                                      );

                                     if (
                                      totalAdSetBudget >
                                      Number(p.budget?.fixed_value)
                                     ) {
                                      toast(
                                       `Total budget (ad sets + extras) exceeds ${platform.outlet} budget`,
                                       {
                                        toastId: "extraToast",
                                        position: "bottom-right",
                                        type: "error",
                                        theme: "colored",
                                       }
                                      );
                                      return adSet;
                                     }

                                     return {
                                      ...adSet,
                                      extra_audiences:
                                       updatedExtraAudiences,
                                     };
                                    }
                                    return adSet;
                                   }
                                  );

                                  return {
                                   ...p,
                                   ad_sets: updatedAdSets,
                                  };
                                 }
                                 return p;
                                }),
                               };
                              }
                             }
                             return ch;
                            }
                           );

                           return {
                            ...prevData,
                            channel_mix: updatedChannelMix,
                           };
                          });
                         }}
                        />
                        {campaignFormData?.campaign_budget?.currency}
                       </div>
                      </div>
                      <div className="flex items-start flex-col gap-3">
                       <h2 className="text-center font-bold">Percentage</h2>
                       <div className="flex items-center gap-4">
                        <div className=" bg-[#FFFFFF] rounded-[10px] min-w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
                         <div className="flex items-center gap-2">
                          <p>
                           {getAdSetExtraBudgetPercentage(ad_set, iid)}
                          </p>
                          <span> %</span>
                         </div>
                        </div>
                        <p className="whitespace-nowrap tracking-tight">
                         of {platform?.outlet} budget
                        </p>
                       </div>
                      </div>
                     </div>
                    );
                   })}
                 </div>
                );
               })}
             </div>
             <hr className="text-gray-200 w-full p-1" />
            </div>
           );
          })}
         </div>

         <div className="flex w-full my-6 justify-end items-center">
          <Button
           text={validatedStages[stage.name] ? "Edit" : "Validate"}
           onClick={
            validatedStages[stage.name]
             ? () =>
              setValidatedStages((prev) => ({
               ...prev,
               [stage.name]: false,
              }))
             : () => handleValidateClick(stage.name)
           }
           disabled={!isButtonEnabled(stage.name)}
           variant="primary"
           className="h-[52px] rounded-md px-6 py-2"
          />
         </div>
        </div>
       </>
      )}
     </div>
    );
   })}
  </div>
 );
};

export default ConfiguredSetPage;