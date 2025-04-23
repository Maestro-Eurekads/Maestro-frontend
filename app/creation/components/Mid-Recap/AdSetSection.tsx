import type React from "react"
import Image from "next/image"
import { SummarySection } from "./SummarySection"
import { OutletType } from "types/types"
import { useEditing } from "app/utils/EditingContext"
import DefineAdSetPage from "../DefineAdSetPage"

interface AdSetsSectionProps {
  platforms: Record<string, OutletType[]>
}

export const AdSetsSection: React.FC<AdSetsSectionProps> = ({ platforms }) => {
    const { midcapEditing, setMidcapEditing } = useEditing();
  return (
    <SummarySection title="Your Adset and Audiences" number={3}>
      <div>
        {midcapEditing.isEditing && midcapEditing.step === "Your Adset and Audiences" ? <DefineAdSetPage/> : Object.keys(platforms).map((stage) => (
          <div key={stage} className="mb-6">
            <h2 className="font-semibold text-lg mb-2">{stage}</h2>
            <div className="flex flex-wrap gap-4">
              {platforms[stage]?.map(
                (platform) =>
                  platform?.adSets?.length > 0 && (
                    <div key={platform.id} className="p-4 bg-gray-100 rounded-lg shadow-sm w-full max-w-[300px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Image src={platform.icon || "/placeholder.svg"} alt={platform.outlet} width={24} height={24} />
                        <span className="font-medium">{platform.outlet}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {platform.adSets.map((adSet, index) => (
                          <div key={index} className="mb-1 flex gap-3">
                            <span className="font-semibold">{adSet.name}</span>
                            <span className="font-semibold">{adSet.audience_type}</span>
                            <span className="font-semibold">{adSet.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
        ))}
      </div>
    </SummarySection>
  )
}
