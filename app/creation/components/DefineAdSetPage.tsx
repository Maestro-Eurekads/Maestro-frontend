"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import speaker from "../../../public/mdi_megaphone.svg";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import orangecredit from "../../../public/orangecredit-card.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import facebook from "../../../public/facebook.svg";
import ig from "../../../public/ig.svg";
import youtube from "../../../public/youtube.svg";
import TheTradeDesk from "../../../public/TheTradeDesk.svg";
import Quantcast from "../../../public/quantcast.svg";
import AdSetsFlow from "./common/AdSetsFlow";
import { useCampaigns } from "../../utils/CampaignsContext";
import { funnelStages } from "components/data";

const DefineAdSetPage = () => {
  const [openItems, setOpenItems] = useState({});
  const [stageStatuses, setStageStatuses] = useState<Record<string, string>>({});
  const [hasInteracted, setHasInteracted] = useState<Record<string, boolean>>({});
  const { campaignFormData } = useCampaigns();

  // Initialize statuses and interaction tracking
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      const initialStatuses = campaignFormData.funnel_stages.reduce((acc, stageName) => {
        acc[stageName] = "Not started";
        return acc;
      }, {} as Record<string, string>);
      setStageStatuses(initialStatuses);

      const initialInteractions = campaignFormData.funnel_stages.reduce((acc, stageName) => {
        acc[stageName] = false;
        return acc;
      }, {} as Record<string, boolean>);
      setHasInteracted(initialInteractions);
    }
  }, [campaignFormData]);

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => {
      const newOpenItems = { ...prev, [stage]: !prev[stage] };
      // Reset status to "Not started" when opening, regardless of previous state
      if (newOpenItems[stage] && !hasInteracted[stage]) {
        setStageStatuses((prev) => ({ ...prev, [stage]: "Not started" }));
      }
      return newOpenItems;
    });
  };

  const handleInteraction = (stageName: string) => {
    // Only update status to "In progress" when user has actually interacted
    setStageStatuses((prev) => ({ ...prev, [stageName]: "In progress" }));
    setHasInteracted((prev) => ({ ...prev, [stageName]: true }));
  };

  const handleValidate = (stageName: string) => {
    setStageStatuses((prev) => ({ ...prev, [stageName]: "Completed" }));
    setOpenItems((prev) => ({ ...prev, [stageName]: false }));
  };

  const resetInteraction = (stageName: string) => {
    setHasInteracted((prev) => ({ ...prev, [stageName]: false }));
    setStageStatuses((prev) => ({ ...prev, [stageName]: "Not started" }));
  };

  return (
    <div className="mt-12 flex items-start flex-col cursor-pointer mx-auto gap-12 w-full">
      {campaignFormData?.funnel_stages.map((stageName, index) => {
        const stage = funnelStages.find((s) => s.name === stageName);
        if (!stage) return null;

        const currentStatus = stageStatuses[stageName] || "Not started";
        const isCompleted = currentStatus === "Completed";
        const isInProgress = currentStatus === "In progress";

        return (
          <div key={index} className="w-full">
            <div
              className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
                ${openItems[stage.name] ? "rounded-t-[10px]" : "rounded-[10px]"}`}
              onClick={() => toggleItem(stage.name)}
            >
              <div className="flex items-center gap-4">
                <Image src={stage.icon} alt={stage.name} width={24} height={24} />
                <p className="text-md font-semibold text-[#061237]">{stage.name}</p>
              </div>

              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-green-500 font-semibold text-base">Completed</p>
                  </div>
                ) : isInProgress ? (
                  <p className="text-[#3175FF] font-semibold text-base">In progress</p>
                ) : (
                  <p className="text-[#061237] opacity-50 text-base">Not started</p>
                )}
              </div>

              <div>
                <Image
                  src={openItems[stage.name] ? up : down2}
                  alt={openItems[stage.name] ? "collapse" : "expand"}
                  width={24}
                  height={24}
                />
              </div>
            </div>
            {openItems[stage.name] && (
              <div
                className={`card_bucket_container_main_sub flex flex-col pb-6 w-full cursor-pointer min-h-[300px] overflow-x-scroll`}
              >
                <AdSetsFlow
                  stageName={stage.name}
                  onInteraction={() => handleInteraction(stage.name)}
                  onValidate={() => handleValidate(stage.name)}
                  isValidateDisabled={!hasInteracted[stage.name]}
                  onEditStart={() => resetInteraction(stage.name)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DefineAdSetPage;