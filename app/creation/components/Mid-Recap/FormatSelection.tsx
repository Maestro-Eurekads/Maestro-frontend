import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { SummarySection } from "./SummarySection";
import { OutletType } from "types/types";
import { useEditing } from "app/utils/EditingContext";
import FormatSelection from "../FormatSelection";

interface FormatSelectionsSectionProps {
  platforms: Record<string, OutletType[]>;
}

export const FormatSelectionsSection: React.FC<
  FormatSelectionsSectionProps
> = ({ platforms }) => {
  const { midcapEditing, setMidcapEditing } = useEditing();
  return (
    <SummarySection title="Your format selections" number={4}>
      <div>
        {midcapEditing.isEditing &&
        midcapEditing.step === "Your format selections" ? (
          <FormatSelection />
        ) : (
          Object.keys(platforms).map((stage) => (
            <div key={stage} className="mb-6">
              <h2 className="font-semibold text-lg mb-2">{stage}</h2>
              <div className="flex flex-wrap gap-4">
                {platforms[stage]?.map(
                  (platform) =>
                    platform?.formats?.length > 0 && (
                      <div
                        key={platform.id}
                        className="p-4 bg-gray-100 rounded-lg shadow-sm w-full max-w-[300px]"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Image
                            src={platform.icon || "/placeholder.svg"}
                            alt={platform.outlet}
                            width={24}
                            height={24}
                          />
                          <span className="font-medium">{platform.outlet}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {platform.formats.map((format, index) => (
                            <div key={index} className="mb-1">
                              <div className="font-semibold">
                                {format.format_type}
                              </div>
                              <div className="font-semibold">
                                Number of visuals - {format.num_of_visuals}
                              </div>
                              {format?.previews?.length > 0 &&
                                format?.previews?.map((preview, idx) => (
                                  <div key={idx} className="mb-1 flex gap-3">
                                    <Link
                                      href={preview?.url}
                                      target="_blank"
                                      className="font-semibold underline"
                                    >
                                      Preview {idx + 1}
                                    </Link>
                                  </div>
                                ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </SummarySection>
  );
};
