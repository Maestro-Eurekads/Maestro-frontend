import Image from "next/image";
import PhasedistributionProgressChat from "./PhasedistributionProgressChat";
import Google from "../public/Google.svg";
import facebook from "../public/facebook.svg";
import ig from "../public/ig.svg";
import quantcast from "../public/quantcast.svg";
import youtube from "../public/youtube.svg";
import tradedesk from "../public/tradedesk.svg";
import speaker from "../public/mdi_megaphone.svg";
import zoom from "../public/tabler_zoom-filled.svg";
import credit from "../public/mdi_credit-card.svg";
import { useEffect, useState } from "react";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon, platformStyles } from "./data";
import moment from "moment";

// Define phases with unique platform data
const phases = [
  {
    img: speaker,
    name: "Awareness",
    amount: "6,000 €",
    platforms: [
      // { img: Google, name: "Google", value: 50, color: "#4285F4" },
      { img: facebook, name: "Facebook", value: 30, color: "#1877F2" },
      { img: ig, name: "Instagram", value: 25, color: "#C13584" },
      { img: youtube, name: "YouTube", value: 20, color: "#FF0000" },
      { img: tradedesk, name: "TheTradeDesk", value: 15, color: "#0099FA" },
      { img: quantcast, name: "Quantcast", value: 10, color: "#1A1A1A" },
    ],
  },
  {
    img: zoom,
    name: "Consideration",
    amount: "5,250 €",
    platforms: [
      // { img: Google, name: "Google", value: 45, color: "#4285F4" },
      { img: facebook, name: "Facebook", value: 40, color: "#1877F2" },
      { img: ig, name: "Instagram", value: 30, color: "#C13584" },
      { img: Google, name: "Google", value: 15, color: "#4285F4" },
      // { img: youtube, name: "YouTube", value: 15, color: "#FF0000" },
      { img: tradedesk, name: "TheTradeDesk", value: 10, color: "#0099FA" },
      { img: quantcast, name: "Quantcast", value: 10, color: "#1A1A1A" },
    ],
  },
  {
    img: credit,
    name: "Conversion",
    amount: "3,750 €",
    platforms: [
      { img: Google, name: "Google", value: 45, color: "#4285F4" },
      { img: facebook, name: "Facebook", value: 30, color: "#1877F2" },
      { img: ig, name: "Instagram", value: 20, color: "#C13584" },
      // { img: youtube, name: "YouTube", value: 30, color: "#FF0000" },
      { img: tradedesk, name: "TheTradeDesk", value: 10, color: "#0099FA" },
    ],
  },
];

export default function PlatformSpending() {
  const [phaseData, setPhaseData] = useState([]);
  const { campaignFormData } = useCampaigns();

  const extractPhasesData = (channel_data) => {
    console.log("fbjfdf", channel_data);
    const phases = [];

    // Get custom funnels data from the campaign form data
    const customFunnels = campaignFormData?.custom_funnels || [];

    channel_data?.forEach((stage) => {
      const stageName = stage?.funnel_stage;
      if (!stageName) return; // Skip if no stage name

      // Find the custom funnel data for this stage
      const customFunnel = customFunnels.find((cc) => cc?.name === stageName);

      // Get the stage icon from custom_funnels or use default
      const stageIcon = customFunnel?.icon || speaker;

      // Create a map to aggregate platform budgets
      const platformMap = {};

      // Process all channel types to extract platform data
      [
        "social_media",
        "display_networks",
        "search_engines",
        "streaming",
        "ooh",
        "broadcast",
        "messaging",
        "print",
        "e_commerce",
        "in_game",
        "mobile",
      ].forEach((channelType) => {
        if (!Array.isArray(stage[channelType])) return;

        stage[channelType].forEach((platform) => {
          if (!platform) return;

          const platformName = platform.platform_name;
          if (!platformName) return;

          const budget = Number(platform?.budget?.fixed_value) || 0;
          if (budget <= 0) return; // Skip platforms with no budget

          if (!platformMap[platformName]) {
            // Find platform style or use a default
            const style =
              platformStyles.find((style) => style.name === platformName) ||
              platformStyles[Math.floor(Math.random() * platformStyles.length)];

            platformMap[platformName] = {
              img: getPlatformIcon(platformName), // Use the function to get platform icon
              name: platformName,
              value: budget,
              color: style?.color || "#000000",
            };
          } else {
            platformMap[platformName].value += budget;
          }
        });
      });

      // Calculate total budget for this stage
      const totalBudget = Object.values(platformMap).reduce(
        //@ts-ignore
        (sum, p) => sum + p.value,
        0
      );

      // Format platforms as percentage of total budget
      let platformList = Object.values(platformMap)
        //@ts-ignore
        .filter((p) => p.value > 0)
        .map((p) => ({
          ...(typeof p === "object" && p !== null ? p : {}),
          //@ts-ignore
          value: Math.round((p.value / totalBudget) * 100), // Convert to % share
        }))
        .sort((a, b) => b.value - a.value); // Sort by percentage (descending)

      // Use stage_budget if available, otherwise use calculated total
      const stageBudgetValue = stage?.stage_budget?.fixed_value
        ? Number(stage.stage_budget.fixed_value)
        : totalBudget;

      phases.push({
        img: stageIcon,
        name: stageName,
        amount: `${stageBudgetValue.toLocaleString()} €`,
        platforms: platformList,
      });
    });

    return phases;
  };

  useEffect(() => {
    if (campaignFormData?.channel_mix) {
      const data = extractPhasesData(campaignFormData?.channel_mix);
      // console.log("data", data);
      setPhaseData(data);
    }
  }, [campaignFormData]);

  return (
    <div className="flex flex-col gap-6">
      {phaseData?.map((phase, index) => {
        const values = phase?.platforms?.map((p) => p?.value);
        const colors = phase?.platforms?.map((p) => p?.color);

        return (
          <div key={index} className="flex flex-col gap-4">
            {/* Phase Name & Amount */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <Image
                  src={phase.img}
                  alt={phase.name}
                  width={24}
                  height={24}
                />
                <p className="text-[#061237] font-semibold text-lg">
                  {phase.name}
                </p>
              </div>
              <div className="h-[29px] flex justify-center items-center px-4 bg-[#E8F6FF] border border-[rgba(49,117,255,0.1)] rounded-full">
                <p className="font-semibold text-[14px] text-[#3175FF]">
                  {phase.amount}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <PhasedistributionProgressChat values={values} colors={colors} />

            {/* Legend (Platform Name & Icon) */}
            <div className="flex flex-wrap gap-4 mt-2">
              {phase.platforms.map((platform, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {/* <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }}></div> */}
                  <Image
                    src={platform.img}
                    alt={platform.name}
                    width={20}
                    height={20}
                    className="shrink-0 w-[20px] h-[20px]"
                  />
                  <p className="font-semibold text-[14px] leading-[19px] flex items-center text-[#061237]">
                    {platform.value}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
