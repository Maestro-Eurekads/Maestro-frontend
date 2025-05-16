import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { SummarySection } from "./SummarySection";
import { OutletType } from "types/types";
import { useEditing } from "app/utils/EditingContext";
import FormatSelection from "../FormatSelection";
import { useCampaigns } from "app/utils/CampaignsContext";

interface FormatSelectionsSectionProps {
  platforms: Record<string, OutletType[]>;
}

const FormatSelectionsSection: React.FC<FormatSelectionsSectionProps> = ({
  platforms,
}) => {
  const { midcapEditing, setMidcapEditing } = useEditing();
  const { campaignFormData } = useCampaigns();

  // Helper function to determine file type based on URL extension
  const getFileType = (url: string): "image" | "video" | "pdf" | "unknown" => {
    const extension = url?.split(".").pop()?.toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const videoExtensions = ["mp4", "webm", "ogg"];
    const pdfExtensions = ["pdf"];

    if (extension && imageExtensions.includes(extension)) return "image";
    if (extension && videoExtensions.includes(extension)) return "video";
    if (extension && pdfExtensions.includes(extension)) return "pdf";
    return "unknown";
  };

  // Helper component to render format details (shared between channel and ad-set views)
  const RenderFormatDetails = ({
    format,
    formatIndex,
  }: {
    format: { format_type: string; num_of_visuals: string; previews?: Array<{ id: string; url: string }> };
    formatIndex: number;
  }) => (
    <div key={formatIndex} className="mb-2">
      <div className="font-semibold text-xs">{format.format_type}</div>
      <div className="font-semibold text-xs">Number of visuals - {format.num_of_visuals}</div>
      {format?.previews?.length > 0 ? (
        <div className="mt-2">
          <h4 className="font-medium text-xs mb-1">Previews:</h4>
          <div className="grid grid-cols-2 gap-2">
            {format.previews.map((preview, idx) => {
              const fileType = getFileType(preview.url);
              return (
                <div key={idx} className="flex flex-col">
                  {fileType === "image" && preview.url ? (
                    <div className="relative aspect-square w-full">
                      <Image
                        src={preview.url || "/placeholder.svg"}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : fileType === "video" && preview.url ? (
                    <div className="relative aspect-square w-full">
                      <video
                        controls
                        className="object-cover rounded w-full h-full"
                      >
                        <source src={preview.url} type={`video/${preview.url.split(".").pop()?.toLowerCase()}`} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : fileType === "pdf" && preview.url ? (
                    <div className="relative aspect-square w-full">
                      <iframe
                        src={preview.url}
                        title={`Preview ${idx + 1}`}
                        className="w-full h-full rounded"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-200 aspect-square flex items-center justify-center rounded">
                      <span className="text-xs">Unsupported or missing preview</span>
                    </div>
                  )}
                  <Link
                    href={preview.url || "#"}
                    target="_blank"
                    className="text-xs text-blue-500 mt-1"
                  >
                    View {idx + 1}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-500 mt-2">No previews uploaded</div>
      )}
    </div>
  );

  return (
    <SummarySection title="Your format selections" number={4}>
      <div>
        {midcapEditing.isEditing &&
        midcapEditing.step === "Your format selections" ? (
          <FormatSelection />
        ) : (
          <>
            {Object.keys(platforms).map((stage) => (
              <div key={stage} className="mb-6">
                <h2 className="font-semibold text-lg mb-2">{stage}</h2>
                <div className="flex flex-wrap gap-4">
                  {platforms[stage]?.map((platform) => (
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

                      {/* Channel-Level Formats */}
                      {platform?.formats?.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-sm mb-2">Channel Formats</h3>
                          <div className="text-sm text-gray-600">
                            {platform.formats.map((format, index) => (
                              <RenderFormatDetails key={index} format={{
                                format_type: format.format_type,
                                num_of_visuals: format.num_of_visuals,
                                previews: format.previews?.map(preview => ({
                                  id: preview.url, // Using url as id since it's missing
                                  url: preview.url
                                }))
                              }} formatIndex={index} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ad-Set-Level Formats */}
                      {platform?.adSets?.some((adSet) => adSet?.format?.length > 0) && (
                        <div>
                          <h3 className="font-semibold text-sm mb-2">Ad Set Formats</h3>
                          {platform.adSets
                            ?.filter((adSet) => adSet?.format?.length > 0)
                            .map((adSet, adSetIndex) => (
                              <div
                                key={adSetIndex}
                                className="mt-3 p-2 bg-white rounded border border-gray-200"
                              >
                                <div className="font-medium text-sm">
                                  {adSet.name || "Unnamed Ad Set"}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  {adSet.audience_type} • Size: {adSet.size}
                                </div>
                                {adSet.format?.length > 0 ? (
                                  <div className="text-sm text-gray-600">
                                    {adSet.format.map((format, formatIndex) => (
                                      <RenderFormatDetails
                                        key={formatIndex}
                                        format={format}
                                        formatIndex={formatIndex}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-500">
                                    No formats configured
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </SummarySection>
  );
};

export default FormatSelectionsSection;