import { useCampaigns } from "app/utils/CampaignsContext";
import ThreeValuesProgress from "../ThreeValuesProgress";

// Map Tailwind classes to hex for consistency in components that need hex values
const colorClassToHex: Record<string, string> = {
  "bg-blue-500": "#3B82F6",
  "bg-green-500": "#22C55E",
  "bg-orange-500": "#F59E42",
  "bg-red-500": "#EF4444",
  "bg-purple-500": "#A855F7",
  "bg-teal-500": "#14B8A6",
  "bg-pink-500": "#EC4899",
  "bg-indigo-500": "#6366F1",
  "bg-yellow-500": "#FACC15",
  "bg-cyan-500": "#06B6D4",
  "bg-lime-500": "#84CC16",
  "bg-amber-500": "#F59E42",
  "bg-fuchsia-500": "#D946EF",
  "bg-emerald-500": "#10B981",
  "bg-violet-600": "#7C3AED",
  "bg-rose-600": "#F43F5E",
  "bg-sky-500": "#0EA5E9",
  "bg-gray-800": "#1F2937",
  "bg-blue-800": "#1E40AF",
  "bg-green-800": "#166534",
};

const isHexColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);

const ChannelDistributionChatTwo = ({ channelData, currency }) => {
  const { campaignFormData } = useCampaigns();

  // Map funnel names to their colors from campaignFormData.custom_funnels
  const getFunnelColor = (stageName: string) => {
    const funnel = campaignFormData?.custom_funnels?.find(
      (f) => f.name === stageName
    );
    const color = funnel?.color || "bg-gray-500"; // Fallback color
    // Return hex color for components that need it, otherwise return original color
    return isHexColor(color) ? color : colorClassToHex[color] || "#6B7280"; // Fallback to gray-500 hex
  };

  return (
    <div className="flex flex-col gap-[20px] w-full">
      {channelData?.map((platform, index) => (
        <div key={index} className="flex flex-col gap-[10px]">
          {/* Platform Name & Amount */}
          <div className="flex justify-between items-center mt-[24px] w-full">
            <div className="flex items-center gap-2">
              <p>{platform.platform_name}</p>
            </div>
            <div className="w-[72px] h-[29px] flex flex-row justify-center items-center p-[5px] px-[12px] gap-[8px] bg-[#E8F6FF] border border-[rgba(49,117,255,0.1)] rounded-[50px]">
              <p className="font-semibold text-[14px] leading-[19px] text-[#3175FF] whitespace-nowrap">
                {((platform.platform_budegt || platform.platform_budget) &&
                  parseInt(
                    platform.platform_budegt || platform.platform_budget
                  ).toLocaleString()) ||
                  0}{" "}
                {(platform.platform_budegt || platform.platform_budget) > 0 &&
                  currency}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <ThreeValuesProgress
              values={platform?.stages_it_was_found
                ?.filter((c) => Number(c?.percentage) > 0)
                ?.map((st) => st?.percentage ?? 0)}
              color={platform?.stages_it_was_found?.map((ch) =>
                getFunnelColor(ch.stage_name)
              )}
              showpercent={false}
            />
          </div>

          {/* Legend */}
          <div className="flex gap-[16px] items-center mt-[10px] flex-wrap">
            {platform?.stages_it_was_found
              ?.filter((c) => Number(c?.percentage) > 0)
              ?.map((platform, index) => {
                const color = getFunnelColor(platform.stage_name);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-[12px] h-[12px] rounded-[4px]"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="flex items-center gap-[2px]">
                      <p className="font-medium text-[14px] leading-[19px] text-[rgba(6,18,55,0.8)]">
                        {platform?.stage_name}
                      </p>
                      <span className="font-semibold text-[16px] leading-[22px] text-[#061237]">
                        ({platform?.percentage?.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChannelDistributionChatTwo;