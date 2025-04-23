import type React from "react";
import { SummarySection } from "./SummarySection";
import { useEditing } from "app/utils/EditingContext";
import MapFunnelStages from "../MapFunnelStages";

interface FunnelStagesSectionProps {
  stages?: string[];
}

export const FunnelStagesSection: React.FC<FunnelStagesSectionProps> = ({
  stages = [],
}) => {
  const { midcapEditing, setMidcapEditing } = useEditing();
  return (
    <SummarySection title="Your funnel stages" number={1}>
      <div>
        {midcapEditing.isEditing && midcapEditing.step === "Your funnel stages"
          ? <MapFunnelStages/>
          : stages?.map((stage: string) => (
              <div
                className="relative w-full max-w-[685px] mx-auto text-black rounded-lg py-4 flex items-center justify-center gap-2"
                key={stage}
              >
                {stage}
              </div>
            ))}
      </div>
    </SummarySection>
  );
};
