"use client";
import { useCampaigns } from "../../utils/CampaignsContext";

const CampaignPhases = ({ campaignPhases }) => {
  const { campaignFormData } = useCampaigns();

  // Map campaignPhases to include the color from custom_funnels
  const phasesWithColors = campaignPhases?.map((phase) => {
    const funnel = campaignFormData?.custom_funnels?.find(
      (f) => f.name === phase.name
    );
    return {
      ...phase,
      colorClass: funnel?.color || "bg-gray-500", // Fallback to gray if no color is found
    };
  });

  return (
    <div className="campaign_phases_container_two flex flex-col gap-[28px]">
      {phasesWithColors?.map((phase, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`w-[12px] h-[12px] rounded-[4px] ${phase?.colorClass}`}
          ></div>
          <div className="flex items-center gap-[2px]">
            <p className="font-medium text-[16px] leading-[22px] flex items-center text-[rgba(6,18,55,0.8)]">
              {phase?.name}
            </p>
            <span className="font-semibold text-[16px] leading-[22px] flex items-center text-[#061237]">
              ({phase?.percentage}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CampaignPhases;