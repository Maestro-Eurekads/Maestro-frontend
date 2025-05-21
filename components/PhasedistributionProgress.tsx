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

// Define interfaces for type safety
interface Platform {
  img: any;
  name: string;
  value: number;
  color: string;
}

interface Phase {
  img?: any;
  name: string;
  amount: string;
  platforms: Platform[];
}

// Define default funnels with their icons
const defaultFunnels = [
  { name: "Awareness", icon: speaker },
  { name: "Consideration", icon: zoom },
  { name: "Conversion", icon: credit },
];

export default function PlatformSpending() {
  const [phaseData, setPhaseData] = useState<Phase[]>([]);
  const { campaignFormData } = useCampaigns();

  const extractPhasesData = (channel_data: any[] | undefined): Phase[] => {
    const phases: Phase[] = [];
    const customFunnels = campaignFormData?.custom_funnels || [];

    if (!channel_data?.length) {
      // console.log("No channel data provided");
      return phases;
    }

    channel_data.forEach((stage) => {
      const stageName = stage?.funnel_stage;
      if (!stageName) {
        // console.log("Skipping stage with no funnel_stage");
        return;
      }

      // Find the custom funnel data for this stage
      const customFunnel = customFunnels.find((cc: any) => cc?.name === stageName);
      const defaultFunnel = defaultFunnels.find((df) => df.name === stageName);
      // Only use icon if it's a default funnel
      const stageIcon = defaultFunnel?.icon || null;

      const platformMap: { [key: string]: Platform } = {};

      // Process all channel types
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

        stage[channelType].forEach((platform: any) => {
          if (!platform?.platform_name) return;

          const platformName = platform.platform_name;
          const budget = Number(platform?.budget?.fixed_value) || 0;
          if (budget <= 0) return;

          if (!platformMap[platformName]) {
            const style =
              platformStyles.find((style) => style.name === platformName) ||
              platformStyles[Math.floor(Math.random() * platformStyles.length)] || { color: "#000000" };

            platformMap[platformName] = {
              img: getPlatformIcon(platformName) || null,
              name: platformName,
              value: budget,
              color: style.color || "#000000",
            };
          } else {
            platformMap[platformName].value += budget;
          }
        });
      });

      const totalBudget = Object.values(platformMap).reduce(
        (sum, p) => sum + p.value,
        0
      );

      const platformList = Object.values(platformMap)
        .filter((p) => p.value > 0)
        .map((p) => ({
          ...p,
          value: totalBudget > 0 ? Math.round((p.value / totalBudget) * 100) : 0,
        }))
        .sort((a, b) => b.value - a.value);

      const stageBudgetValue = stage?.stage_budget?.fixed_value
        ? Number(stage.stage_budget.fixed_value)
        : totalBudget;

      phases.push({
        img: stageIcon,
        name: stageName,
        amount: `${stageBudgetValue.toLocaleString("en-EU", { currency: "EUR" })} €`,
        platforms: platformList,
      });
    });

    return phases;
  };

  useEffect(() => {
    if (campaignFormData?.channel_mix) {
      const data = extractPhasesData(campaignFormData.channel_mix);
      // console.log("Updated phaseData:", data);
      setPhaseData(data);
    }
  }, [campaignFormData]);

  return (
    <div className="flex flex-col gap-6">
      {phaseData.map((phase, index) => {
        const values = phase.platforms.map((p) => p.value);
        const colors = phase.platforms.map((p) => p.color);
        const isDefaultFunnel = defaultFunnels.some((df) => df.name === phase.name);

        return (
          <div key={index} className="flex flex-col gap-4">
            {/* Phase Name & Amount */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                {isDefaultFunnel && phase.img && (
                  <Image
                    src={phase.img}
                    alt={`${phase.name} icon`}
                    width={24}
                    height={24}
                    className="shrink-0"
                  />
                )}
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
                  {platform.img && (
                    <Image
                      src={platform.img}
                      alt={`${platform.name} icon`}
                      width={20}
                      height={20}
                      className="shrink-0 w-[20px] h-[20px]"
                    />
                  )}
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