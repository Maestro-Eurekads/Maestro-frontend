import type React from "react";
import Image from "next/image";
import { SummarySection } from "./SummarySection";
import { OutletType } from "types/types";
import { useEditing } from "app/utils/EditingContext";
import SelectChannelMix from "../SelectChannelMix";

interface ChannelMixSectionProps {
  stages?: string[];
  platforms: Record<string, OutletType[]>;
}

export const ChannelMixSection: React.FC<ChannelMixSectionProps> = ({
  stages = [],
  platforms,
}) => {
  const { midcapEditing, setMidcapEditing } = useEditing();
  return (
    <SummarySection title="Your channel mix" number={2}>
      {midcapEditing.isEditing &&
      midcapEditing.step === "Your channel mix" ? (
        <SelectChannelMix />
      ) : (
        stages?.map((stage: string) => (
          <div
            className="relative w-full text-black rounded-lg py-4 gap-2"
            key={stage}
          >
            <div className="font-medium">{stage}</div>
            <div className="flex flex-wrap gap-2 mt-4">
              {platforms[stage]?.map((platform) => (
                <div
                  key={platform.id}
                  className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg"
                >
                  <Image
                    src={platform.icon || "/placeholder.svg"}
                    alt={platform.outlet}
                    width={20}
                    height={20}
                  />
                  <span>{platform.outlet}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </SummarySection>
  );
};
