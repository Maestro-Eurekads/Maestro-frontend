"use client";
import { useCampaigns } from "../../utils/CampaignsContext";

// Helper to check if a string is a valid hex color
const isHexColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);

const CampaignPhases = ({ campaignPhases }) => {
  const { campaignFormData } = useCampaigns();

  // Map campaignPhases to include the color from custom_funnels
  const phasesWithColors = campaignPhases?.map((phase) => {
    const funnel = campaignFormData?.custom_funnels?.find(
      (f) => f.name === phase.name
    );
    return {
      ...phase,
      color: funnel?.color || "bg-gray-500", // Fallback to gray if no color is found
    };
  });

  // Helper to get the style for the color box (Tailwind class or hex)
  const getColorStyle = (color: string) => {
    if (isHexColor(color)) {
      return { className: "", style: { backgroundColor: color } };
    }
    return { className: color, style: {} };
  };

  return (
    <div className="campaign_phases_container_two flex flex-col gap-[28px]">
      {phasesWithColors?.map((phase, index) => {
        const { className, style } = getColorStyle(phase.color);
        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`w-[12px] h-[12px] rounded-[4px] ${className}`}
              style={style}
            ></div>
            <div className="flex items-center gap-[2px]">
              <p className="font-medium text-[16px] leading-[22px] flex items-center text-[rgba(6,18,55,0.8)]">
                {phase?.name}
              </p>
              <span className="font-semibold text-[16px] leading-[22px] flex items-center text-[#061237]">
                ({Number(phase?.percentage) ? Math.round(Number(phase.percentage)) : 0}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampaignPhases;