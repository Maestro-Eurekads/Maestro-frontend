import type React from "react";
import Image from "next/image";
import { SummarySection } from "./SummarySection";
import { useEditing } from "app/utils/EditingContext";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon } from "components/data";
import { StaticImageData } from "next/image";
import ObjectiveSelection from "../ObjectiveSelection";

// Define a type for the platform data to ensure type safety
interface PlatformData {
  platform_name: string;
  buy_type?: string;
  objective_type?: string;
}

// Update OutletType to include buy_type and objective_type if not already defined
interface OutletType {
  id: number;
  outlet: string;
  icon?: string | StaticImageData;
  buy_type?: string;
  objective_type?: string;
  adSets: any[];
  formats: any[];
}

interface BuyingObjectivesSectionProps {
  platforms: Record<string, OutletType[]>;
}

const BuyingObjectivesSection: React.FC<BuyingObjectivesSectionProps> = ({
  platforms,
}) => {
  const { midcapEditing, setMidcapEditing } = useEditing();
  const { campaignFormData } = useCampaigns();

  // Function to extract platforms with buy_type or objective_type from channel_mix
  const getPlatformsWithObjectives = (stage: string): OutletType[] => {
    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix.find((ch) => ch.funnel_stage === stage)
      : null;

    if (!channelMix) return platforms[stage] || [];

    const allPlatforms: OutletType[] = [];
    const categories = [
      "social_media",
      "display_networks", 
      "search_engines",
      "streaming",
      "mobile",
      "messaging",
      "in_game",
      "e_commerce",
      "broadcast",
      "print",
      "ooh",
    ];

    categories.forEach((category) => {
      const categoryPlatforms = channelMix[category] || [];
      categoryPlatforms.forEach((platform: PlatformData) => {
        if (platform.buy_type || platform.objective_type) {
          allPlatforms.push({
            id: parseInt(Math.floor(Math.random() * 1000000).toString()),
            outlet: platform.platform_name,
            icon: getPlatformIcon(platform.platform_name),
            buy_type: platform.buy_type,
            objective_type: platform.objective_type,
            adSets: [],
            formats: []
          });
        }
      });
    });

    return allPlatforms;
  };

  return (
    <SummarySection title="Your buying objectives" number={5}>
      <div>
        {midcapEditing.isEditing &&
        midcapEditing.step === "Your buying objectives" ? (
          <ObjectiveSelection />
        ) : (
          <>
            {Object.keys(platforms).map((stage) => {
              const stagePlatforms = getPlatformsWithObjectives(stage);
              if (stagePlatforms.length === 0) return null;

              return (
                <div key={stage} className="mb-6">
                  <h2 className="font-semibold text-lg mb-2">{stage}</h2>
                  <div className="flex flex-wrap gap-4">
                    {stagePlatforms.map((platform) => (
                      <div
                        key={platform.id}
                        className="p-4 bg-gray-100 rounded-lg shadow-sm w-full max-w-[300px]"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {platform.icon && (
                            <Image
                              src={platform.icon || "/placeholder.svg"}
                              alt={platform.outlet}
                              width={24}
                              height={24}
                            />
                          )}
                          <span className="font-medium">{platform.outlet}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {platform.objective_type && (
                            <div className="mb-2">
                              <div className="font-semibold text-xs">Objective Type</div>
                              <div className="text-xs">{platform.objective_type}</div>
                            </div>
                          )}
                          {platform.buy_type && (
                            <div className="mb-2">
                              <div className="font-semibold text-xs">Buy Type</div>
                              <div className="text-xs">{platform.buy_type}</div>
                            </div>
                          )}
                          {!platform.objective_type && !platform.buy_type && (
                            <div className="text-xs text-gray-500">
                              No objectives configured
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </SummarySection>
  );
};

export default BuyingObjectivesSection;