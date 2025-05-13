import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { SummarySection } from "./SummarySection";
import { OutletType } from "types/types";
import { useEditing } from "app/utils/EditingContext";
import FormatSelection from "../FormatSelection";
import { useCampaigns } from "app/utils/CampaignsContext";
import { renderUploadedFile } from "components/data";

interface FormatSelectionsSectionProps {
  platforms: Record<string, OutletType[]>;
}

const FormatSelectionsSection: React.FC<FormatSelectionsSectionProps> = ({
  platforms,
}) => {
  const { midcapEditing, setMidcapEditing } = useEditing();
  const { campaignFormData } = useCampaigns();
  return (
    <SummarySection title="Your format selections" number={4}>
      <div>
        {midcapEditing.isEditing &&
        midcapEditing.step === "Your format selections" ? (
          <FormatSelection />
        ) : campaignFormData?.goal_level === "Adset level" ? (
          <>
            {Object.keys(platforms).map((stage) => (
              <div key={stage} className="mb-6">
                <h2 className="font-semibold text-lg mb-2">{stage}</h2>
                <div className="flex flex-wrap gap-4">
                  {platforms[stage]
                    ?.filter((platform) =>
                      platform.adSets?.some(
                        (adSet) => adSet?.format?.length > 0
                      )
                    )
                    .map((platform) => (
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

                        {platform.adSets
                          .filter((dd) => dd?.format?.length > 0)
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

                              {adSet.format && adSet.format.length > 0 ? (
                                <div className="text-sm text-gray-600">
                                  {adSet.format.map((format, formatIndex) => (
                                    <div key={formatIndex} className="mb-2">
                                      <div className="font-semibold text-xs">
                                        {format.format_type}
                                      </div>
                                      <div className="font-semibold text-xs">
                                        Number of visuals -{" "}
                                        {format.num_of_visuals}
                                      </div>

                                      {format?.previews?.length > 0 && (
                                        <div className="mt-2">
                                          <h4 className="font-medium text-xs mb-1">
                                            Previews:
                                          </h4>
                                          <div className="grid grid-cols-2 gap-2">
                                            {format.previews.map(
                                              (preview, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex flex-col"
                                                >
                                                  {preview.url ? (
                                                    <div className="relative aspect-square w-full">
                                                      {renderUploadedFile(
                                                        format.previews?.map(
                                                          (pr) => pr?.url
                                                        ),
                                                        format?.format_type,
                                                        idx
                                                      )}
                                                      {/* <Image
                                                  src={
                                                    preview.url ||
                                                    "/placeholder.svg"
                                                  }
                                                  alt={`Preview ${idx + 1}`}
                                                  fill
                                                  className="object-cover rounded"
                                                /> */}
                                                    </div>
                                                  ) : (
                                                    <div className="bg-gray-200 aspect-square flex items-center justify-center rounded">
                                                      <span className="text-xs">
                                                        No preview
                                                      </span>
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
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
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
                    ))}
                </div>
              </div>
            ))}
          </>
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
                          {platform.icon && (
                            <Image
                              src={platform.icon}
                              alt={platform.outlet}
                              width={24}
                              height={24}
                            />
                          )}
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
                              {format?.previews?.length > 0 && (
                                <div className="mt-2">
                                  <h4 className="font-medium mb-1">
                                    Previews:
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {format.previews.map((preview, idx) => (
                                      <div key={idx} className="flex flex-col">
                                        {preview.url ? (
                                          <div className="relative aspect-square w-full">
                                            {renderUploadedFile(
                                              format.previews?.map(
                                                (pr) => pr?.url
                                              ),
                                              format?.format_type,
                                              idx
                                            )}
                                          </div>
                                        ) : (
                                          <div className="bg-gray-200 aspect-square flex items-center justify-center rounded">
                                            <span>No preview</span>
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
                                    ))}
                                  </div>
                                </div>
                              )}
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

export default FormatSelectionsSection;
