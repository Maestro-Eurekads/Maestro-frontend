"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Button from "./common/button";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import orangecredit from "../../../public/orangecredit-card.svg";
import instagram from "../../../public/ig.svg";
import trade from "../../../public/TheTradeDesk.svg";
import quantcast from "../../../public/quantcast.svg";

import facebook from "../../../public/facebook.svg";
import ig from "../../../public/ig.svg";
import youtube from "../../../public/youtube.svg";
import TheTradeDesk from "../../../public/TheTradeDesk.svg";
import Quantcast from "../../../public/quantcast.svg";
import speaker from "../../../public/mdi_megaphone.svg";
import google from "../../../public/social/google.svg";
import x from "../../../public/x.svg";
import linkedin from "../../../public/linkedin.svg";
import Display from "../../../public/Display.svg";
import yahoo from "../../../public/yahoo.svg";
import bing from "../../../public/bing.svg";
import tictok from "../../../public/tictok.svg";

import { funnelStages } from "components/data";
import { useCampaigns } from "app/utils/CampaignsContext";
import { toast } from "react-toastify";

interface OutletType {
 id: number;
 outlet: string;
 icon: StaticImageData;
 ad_sets: any;
}

const ConfiguredSetPage = () => {
 const [openItems, setOpenItems] = useState({
  Awareness: false,
  Consideration: false,
  Conversion: false,
 });

 const { campaignFormData, setCampaignFormData } = useCampaigns();
 const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({});

 const platformIcons: Record<string, StaticImageData> = {
  Facebook: facebook,
  Instagram: ig,
  YouTube: youtube,
  Youtube: youtube,
  TheTradeDesk: TheTradeDesk,
  Quantcast: Quantcast,
  Google: google,
  "Twitter/X": x,
  LinkedIn: linkedin,
  Linkedin: linkedin,
  TikTok: tictok,
  "Display & Video": Display,
  Yahoo: yahoo,
  Bing: bing,
  "Apple Search": google,
  "The Trade Desk": TheTradeDesk,
  QuantCast: Quantcast,
 };

 const getPlatformIcon = (platformName: string): StaticImageData | null => {
  return platformIcons[platformName] || null;
 };

 const getPlatformsFromStage = (channelMix) => {
  if (channelMix?.length > 0) {
   const platformsByStage: Record<string, OutletType[]> = {};
   channelMix?.forEach((stage: any) => {
    const { funnel_stage, search_engines, display_networks, social_media } =
     stage;

    if (!platformsByStage[funnel_stage]) {
     platformsByStage[funnel_stage] = [];
    }

    // Process search engines
    if (Array.isArray(search_engines)) {
     search_engines.forEach((platform: any) => {
      const icon = getPlatformIcon(platform?.platform_name);
      if (icon) {
       platformsByStage[funnel_stage].push({
        id: Math.floor(Math.random() * 1000000),
        outlet: platform.platform_name,
        ad_sets: platform?.ad_sets,
        icon,
       });
      }
     });
    }

    // Process display networks
    if (Array.isArray(display_networks)) {
     display_networks.forEach((platform: any) => {
      const icon = getPlatformIcon(platform?.platform_name);
      if (icon) {
       platformsByStage[funnel_stage].push({
        id: Math.floor(Math.random() * 1000000),
        outlet: platform.platform_name,
        icon,
        ad_sets: platform?.ad_sets,
       });
      }
     });
    }

    // Process social media
    if (Array.isArray(social_media)) {
     social_media.forEach((platform: any) => {
      const icon = getPlatformIcon(platform?.platform_name);
      if (icon) {
       platformsByStage[funnel_stage].push({
        id: Math.floor(Math.random() * 1000000),
        outlet: platform.platform_name,
        icon,
        ad_sets: platform?.ad_sets,
       });
      }
     });
    }
   });

   return platformsByStage;
  }
 };

 useEffect(() => {
  if (campaignFormData) {
   if (campaignFormData?.channel_mix) {
    const data = getPlatformsFromStage(campaignFormData?.channel_mix);
    setPlatforms(data);
   }
  }
 }, [campaignFormData]);
 // Individual currency states for each section and stage
 const [currencies, setCurrencies] = useState({
  Awareness: {
   top: "EUR",
   facebook: "EUR",
   instagram: "EUR",
   youtube: "EUR",
   tradeDesk: "EUR",
   quantcast: "EUR",
  },
  Consideration: {
   top: "EUR",
   facebook: "EUR",
   instagram: "EUR",
   youtube: "EUR",
   tradeDesk: "EUR",
   quantcast: "EUR",
  },
  Conversion: {
   top: "EUR",
   facebook: "EUR",
   instagram: "EUR",
   youtube: "EUR",
   tradeDesk: "EUR",
   quantcast: "EUR",
  },
 });

 // Budget states for each section and stage
 const [budgets, setBudgets] = useState({
  Awareness: {
   top: "",
   facebook: "",
   instagram: "",
   youtube: "",
   tradeDesk: "",
   quantcast: "",
  },
  Consideration: {
   top: "",
   facebook: "",
   instagram: "",
   youtube: "",
   tradeDesk: "",
   quantcast: "",
  },
  Conversion: {
   top: "",
   facebook: "",
   instagram: "",
   youtube: "",
   tradeDesk: "",
   quantcast: "",
  },
  Loyalty: {
   top: "",
   facebook: "",
   instagram: "",
   youtube: "",
   tradeDesk: "",
   quantcast: "",
  },
 });

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
  const stageBudgets = budgets[stage];
  return Object.values(stageBudgets).some((budget) => budget);
 };

 const handleValidateClick = (stage) => {
  setValidatedStages((prev) => ({ ...prev, [stage]: true }));

  const newResults = [
   {
    platform: "Top",
    budget: budgets[stage].top,
    currency: currencies[stage].top,
   },
   {
    platform: "Facebook",
    budget: budgets[stage].facebook,
    currency: currencies[stage].facebook,
   },
   {
    platform: "Instagram",
    budget: budgets[stage].instagram,
    currency: currencies[stage].instagram,
   },
   {
    platform: "YouTube",
    budget: budgets[stage].youtube,
    currency: currencies[stage].youtube,
   },
   {
    platform: "TradeDesk",
    budget: budgets[stage].tradeDesk,
    currency: currencies[stage].tradeDesk,
   },
   {
    platform: "Quantcast",
    budget: budgets[stage].quantcast,
    currency: currencies[stage].quantcast,
   },
  ].filter((item) => item.budget);

  setResults((prev) => ({ ...prev, [stage]: newResults }));
 };

 return (
  <div className="mt-12 flex items-start flex-col gap-12 w-full">
   {campaignFormData?.funnel_stages.map((stageName, index) => {
    const totalBudget = campaignFormData?.campaign_budget?.amount || 0;
    const stageBudget =
     campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === stageName
     )?.stage_budget?.fixed_value || 0;
    const percentage = totalBudget ? (stageBudget / totalBudget) * 100 : 0;
    const stage = funnelStages.find((s) => s.name === stageName);
    if (!stage) return null;
    return (
     <div key={index} className="w-full">
      <div
       className="flex items-center justify-between px-6 py-4 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
       onClick={() => toggleItem(stage.name)}
      >
       <div className="flex items-center gap-4">
        <Image src={stage.icon} alt={stage.name} />
        <p className="text-md font-semibold text-[#061237]">
         {stage.name}
        </p>
       </div>
       <div className="flex items-center gap-2">
        <p
         className={`font-semibold text-base ${stage.statusIsActive
          ? "text-[#3175FF]"
          : "text-[#061237] opacity-50"
          }`}
        >
         {stage.status}
        </p>
       </div>
       <div>
        {openItems[stage.name] ? (
         <Image src={up} alt="collapse" />
        ) : (
         <Image src={down2} alt="expand" />
        )}
       </div>
      </div>

      {openItems[stage.name] && (
       <>
        <div className="pt-4 bg-[#FCFCFC] rounded-lg cursor-pointer border px-6 border-[rgba(6,18,55,0.1)]">
         <div className="flex mt-6 flex-col items-start gap-8">
          <div className="flex mb-8 justify-center gap-6">
           {/* top budget */}
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
              value={
               Number(
                campaignFormData?.channel_mix
                 ?.find(
                  (ch) => ch?.funnel_stage === stage.name
                 )
                 ?.stage_budget?.fixed_value?.toLocaleString()
               ) || ""
              }
              onChange={(e) => {
               const newBudget = Number(e.target.value);
               const currentTotal =
                campaignFormData?.channel_mix?.reduce(
                 (acc, stage) => {
                  return (
                   acc +
                   (Number(
                    stage?.stage_budget?.fixed_value
                   ) || 0)
                  );
                 },
                 0
                ) || 0;

               if (
                currentTotal -
                (Number(stageBudget) || 0) +
                newBudget <=
                totalBudget
               ) {
                const updatedChannelMix =
                 campaignFormData.channel_mix.map((ch) => {
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
                 });
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
               <p>{percentage?.toFixed(1)}</p>
               <span> %</span>
              </div>
             </div>

             <p className="tracking-tight">of total budget</p>
            </div>
           </div>
          </div>

          <hr className="text-gray-200 w-full p-1" />

          {/* Second row */}
          {platforms[stage.name].map((platform, index) => {
           const stage = campaignFormData?.channel_mix?.find(
            (stage) => stage.funnel_stage === stageName
           );
           if (!stage) return "";

           const channelTypes = [
            "search_engines",
            "display_networks",
            "social_media",
           ] as const;

           let platformBudget = "";
           for (const channelType of channelTypes) {
            const foundPlatform = stage[channelType]?.find(
             (p) => p.platform_name === platform?.outlet
            );
            if (foundPlatform) {
             platformBudget =
              foundPlatform?.budget?.fixed_value || "";
             break;
            }
           }
           const budgetValue = platformBudget;
           const totalStageBudge = stage?.stage_budget?.fixed_value;
           const platformPercentage = totalStageBudge
            ? Number(Number(budgetValue) / totalStageBudge) * 100
            : 0;
           return (
            <div key={`${stageName}${platform?.outlet}${index}`}>
             <div className="flex mb-8 items-end justify-center gap-3">
              {/* facebook */}
              <div className="flex items-start flex-col gap-2">
               {platform?.ad_sets?.length > 0 && (
                <div className="flex rounded-[50px] bg-[#00A36C1A] border border-[#00A36C1A] w-[82px] h-[29px] items-center gap-2">
                 <span className="text-[#00A36C] pl-2">
                  {platform?.ad_sets?.length} ad sets
                 </span>
                </div>
               )}

               <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[200px] h-[50px] rounded-[10px] items-center gap-2">
                <div className="flex justify-between w-full px-4 items-center">
                 <div className="flex items-center gap-2">
                  <Image
                   src={platform?.icon}
                   className="size-5"
                   alt="facebook"
                  />
                  <span>{platform?.outlet}</span>
                 </div>
                 {platform?.ad_sets?.length > 0 && (
                  <Image
                   src={down2}
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
                 value={budgetValue}
                 onChange={(e) => {
                  const newBudget = e.target.value;
                  setCampaignFormData(
                   (prevData: typeof campaignFormData) => {
                    const updatedChannelMix =
                     prevData.channel_mix.map(
                      (ch: any) => {
                       if (
                        ch.funnel_stage === stageName
                       ) {
                        const updatedChannelType =
                         channelTypes.find((type) =>
                          ch[type]?.some(
                           (p: any) =>
                            p.platform_name ===
                            platform.outlet
                          )
                         );
                        if (updatedChannelType) {
                         const totalPlatformBudget =
                          channelTypes.reduce(
                           (acc, type) => {
                            return (
                             acc +
                             ch[type]?.reduce(
                              (
                               typeAcc: number,
                               p: any
                              ) => {
                               return (
                                typeAcc +
                                (p.platform_name ===
                                 platform.outlet
                                 ? Number(
                                  newBudget
                                 )
                                 : Number(
                                  p?.budget
                                   ?.fixed_value
                                 ) || 0)
                               );
                              },
                              0
                             )
                            );
                           },
                           0
                          );
                         if (
                          totalPlatformBudget <=
                          ch.stage_budget?.fixed_value
                         ) {
                          return {
                           ...ch,
                           [updatedChannelType]: ch[
                            updatedChannelType
                           ].map((p: any) =>
                            p.platform_name ===
                             platform.outlet
                             ? {
                              ...p,
                              budget: {
                               ...p.budget,
                               fixed_value:
                                newBudget?.toString(),
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
                            position:
                             "bottom-right",
                            type: "error",
                            theme: "colored",
                           }
                          );
                         }
                        }
                       }
                       return ch;
                      }
                     );
                    return {
                     ...prevData,
                     channel_mix: updatedChannelMix,
                    };
                   }
                  );
                 }}
                />
                {campaignFormData?.campaign_budget?.currency}
               </div>
              </div>

              <div className="flex items-start flex-col gap-3">
               <h2 className="text-center font-bold">
                Percentage
               </h2>
               <div className="flex items-center gap-4">
                <div className=" bg-[#FFFFFF] rounded-[10px] min-w-[62px] h-[50px] border border-[#D0D5DD] flex items-center px-4">
                 <div className="flex items-center gap-2">
                  <p>{platformPercentage?.toFixed(1)}</p>
                  <span> %</span>
                 </div>
                </div>

                <p className="whitespace-nowrap tracking-tight">
                 of {stage.name} budget
                </p>

                {/* switch */}
                {stageName?.funnel_stage === stage.name &&
                 index === 0 && (
                  <div
                   className="flex items-center gap-2"
                   onClick={(e) => {
                    const stageData =
                     campaignFormData.channel_mix.find(
                      (ch) =>
                       ch.funnel_stage ===
                       stage.funnel_stage
                     );
                    if (stageData) {
                     const totalStageBudget = Number(
                      stageData.stage_budget.fixed_value
                     );
                     const platformCount = platforms[stage.funnel_stage]?.reduce((acc, platform) => {
                      return acc + (platform.ad_sets?.length > 1 ? 2 : 1);
                     }, 0);

                     const totalAdSetCount = platforms[stage.funnel_stage]?.reduce((acc, platform) => {
                      return acc + (platform.ad_sets?.length || 1);
                     }, 0);

                     const splitBudget = (totalStageBudget / totalAdSetCount).toFixed(2);
                     const updatedChannelMix =
                      campaignFormData.channel_mix.map(
                       (ch) => {
                        if (
                         ch.funnel_stage ===
                         stage.funnel_stage
                        ) {
                         channelTypes.forEach((type) => {
                          if (ch[type]) {
                           ch[type] = ch[type].map((p: any) => ({
                            ...p,
                            budget: {
                             ...p.budget,
                             fixed_value: splitBudget,
                            },
                           }));
                          }
                         });
                         return ch;
                        }
                        return ch;
                       }
                      );

                     setCampaignFormData({
                      ...campaignFormData,
                      channel_mix: updatedChannelMix,
                     });
                    }
                   }}
                  >
                   <label
                    htmlFor={`${stage.name}AcceptConditions`}
                    className="relative inline-block h-6 w-12 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-blue-500 peer-checked:bg-blue-500"
                   >
                    <input
                     type="checkbox"
                     id={`${stage.name}AcceptConditions`}
                     className="peer sr-only"
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
             : () => handleValidateClick(stage?.name)
           }
           disabled={!isButtonEnabled(stage?.name)}
           variant="primary"
           className="h-[52px] rounded-md px-6 py-2"
          />
         </div>

         {validatedStages[stage.name] &&
          results[stage.name].length > 0 && (
           <div className="mt-6">
            <h2 className="font-bold">Results:</h2>
            <ul>
             {results[stage.name].map((result, index) => (
              <li key={index}>
               {result.platform}: {result.budget}{" "}
               {getCurrencySymbol(result.currency)}
              </li>
             ))}
            </ul>
           </div>
          )}
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
