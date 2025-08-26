"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { FaCheck, FaSpinner } from "react-icons/fa";
import {
  getPlatformIcon,
  platformIcons,
  renderUploadedFile,
} from "../../../components/data";
import { useCampaigns } from "../../utils/CampaignsContext";
import UploadModal from "../../../components/UploadModal/UploadModal";
import { Trash } from "lucide-react";
import { removeKeysRecursively } from "utils/removeID";
import { toast } from "sonner";
import { debounce } from "lodash";

import Switch from "react-switch";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useComments } from "app/utils/CommentProvider";
import { useActive } from "app/utils/ActiveContext";
import SaveAllProgressButton from "./SaveProgres/SaveAllProgressButton";
import { CHANNEL_TYPES, DEFAULT_MEDIA_OPTIONS } from "components/Options";
import axios from "axios";

// Types
type FormatType = {
  format_type: string;
  num_of_visuals: string;
  previews: Array<{ id: string; url: string }>;
};

type PlatformType = {
  id: number;
  platform_name: string;
  buy_type: string | null;
  objective_type: string | null;
  campaign_start_date: string | null;
  campaign_end_date: string | null;
  format: FormatType[];
  ad_sets: Array<{
    id: number;
    audience_type: string;
    name: string;
    size: string;
    format?: FormatType[];
  }>;
  budget: string | null;
  kpi: string | null;
};

type ChannelType = {
  id: number;
  funnel_stage: string;
  funnel_stage_timeline_start_date: string | null;
  funnel_stage_timeline_end_date: string | null;
  social_media: PlatformType[];
  display_networks: PlatformType[];
  search_engines: PlatformType[];
  streaming: PlatformType[];
  ooh: PlatformType[];
  broadcast: PlatformType[];
  messaging: PlatformType[];
  print: PlatformType[];
  e_commerce: PlatformType[];
  in_game: PlatformType[];
  mobile: PlatformType[];
};

type MediaOptionType = {
  name: string;
  icon: any;
};

type QuantitiesType = {
  [platformName: string]: {
    [formatName: string]: number;
  };
};

// Helper functions
const getLocalStorageItem = (key: string, defaultValue: any = null) => {
  if (typeof window === "undefined") return defaultValue;

  // Get campaign ID from URL or use default
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get("campaignId") || "default";
  const storageKey = `${campaignId}_${key}`;

  const item = localStorage.getItem(storageKey);
  return item ? JSON.parse(item) : defaultValue;
};

const setLocalStorageItem = (key: string, value: any) => {
  if (typeof window === "undefined") return;

  // Get campaign ID from URL or use default
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get("campaignId") || "default";
  const storageKey = `${campaignId}_${key}`;

  localStorage.setItem(storageKey, JSON.stringify(value));
};

// Helper function to format audience display name like in ad-set-flow
const formatAudienceDisplayName = (audienceType: string, name: string) => {
  if (!audienceType && !name) return "";
  if (!audienceType) return name;
  if (!name) return audienceType;
  return `${audienceType} + ${name}`;
};

// Creatives Modal Component
const CreativesModal = ({
  isOpen,
  onClose,
  stageName,
  campaignFormData,
  view,
}: {
  isOpen: boolean;
  onClose: () => void;
  stageName: string;
  campaignFormData: any;
  view: "channel" | "adset";
}) => {
  if (!isOpen) return null;
  const { change, setChange, showModal, setShowModal } = useActive();
  const stage = campaignFormData?.channel_mix?.find(
    (chan: any) => chan?.funnel_stage === stageName
  );
  if (!stage) return null;

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

  // Render format details
  const RenderFormatDetails = ({
    format,
    formatIndex,
  }: {
    format: {
      format_type: string;
      num_of_visuals: string;
      previews?: Array<{ id: string; url: string }>;
    };
    formatIndex: number;
  }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const handleVideoClick = useCallback(() => {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play().catch((error) => {});
        } else {
          videoRef.current.pause();
        }
      }
    }, []);

    return (
      <div key={formatIndex} className="mb-4">
        <div className="font-semibold text-base">{format.format_type}</div>
        <div className="font-semibold text-sm">
          Number of visuals - {format.num_of_visuals}
        </div>
        {format?.previews?.length > 0 ? (
          <div className="mt-3">
            <h4 className="font-medium text-sm mb-2">Previews:</h4>
            <div className="grid grid-cols-4 gap-2">
              {format.previews.map((preview, idx) => {
                const fileType = getFileType(preview.url);
                return (
                  <div key={idx} className="flex flex-col">
                    {fileType === "image" && preview.url ? (
                      <div className="relative aspect-square w-[155px]">
                        <Image
                          src={preview.url || "/placeholder.svg"}
                          alt={`Preview ${idx + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ) : fileType === "video" && preview.url ? (
                      <div
                        className="relative aspect-square w-[150px] cursor-pointer"
                        onClick={handleVideoClick}>
                        <video
                          ref={videoRef}
                          className="object-cover rounded w-full h-full"
                          controls
                          muted
                          playsInline>
                          <source
                            src={preview.url}
                            type={`video/${preview.url
                              .split(".")
                              .pop()
                              ?.toLowerCase()}`}
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : fileType === "pdf" && preview.url ? (
                      <div className="relative aspect-square w-[150px]">
                        <iframe
                          src={preview.url}
                          title={`Preview ${idx + 1}`}
                          className="w-full h-full rounded"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-200 aspect-square w-[150px] flex items-center justify-center rounded">
                        <span className="text-xs">
                          Unsupported or missing preview
                        </span>
                      </div>
                    )}
                    <a
                      href={preview.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 mt-1 hover:underline">
                      View {idx + 1}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 mt-2">No previews uploaded</div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Creatives for {stageName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {CHANNEL_TYPES.map(({ key, title }) => {
          const platforms: PlatformType[] = stage[key] || [];
          const hasFormats = platforms.some((platform) =>
            view === "channel"
              ? platform.format?.length > 0
              : platform.ad_sets?.some((adset) => adset.format?.length > 0)
          );

          if (!hasFormats) return null;

          return (
            <div key={title} className="mb-6">
              <h3 className="font-semibold text-lg mb-3">{title}</h3>
              {platforms.map((platform, idx) => {
                if (view === "channel" && platform.format?.length > 0) {
                  return (
                    <div key={idx} className="p-4 bg-gray-100 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-3">
                        {platformIcons[platform.platform_name] && (
                          <Image
                            src={
                              getPlatformIcon(platform.platform_name) ||
                              "/placeholder.svg"
                            }
                            alt={platform.platform_name}
                            width={24}
                            height={24}
                          />
                        )}
                        <span className="font-medium text-base">
                          {platform.platform_name}
                        </span>
                      </div>
                      {platform.format.map((format, formatIdx) => (
                        <RenderFormatDetails
                          key={formatIdx}
                          format={format}
                          formatIndex={formatIdx}
                        />
                      ))}
                    </div>
                  );
                } else if (
                  view === "adset" &&
                  platform.ad_sets?.some((adset) => adset.format?.length > 0)
                ) {
                  return (
                    <div key={idx} className="p-4 bg-gray-100 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-3">
                        {platformIcons[platform.platform_name] && (
                          <Image
                            src={
                              getPlatformIcon(platform.platform_name) ||
                              "/placeholder.svg"
                            }
                            alt={platform.platform_name}
                            width={24}
                            height={24}
                          />
                        )}
                        <span className="font-medium text-base">
                          {platform.platform_name}
                        </span>
                      </div>
                      {platform.ad_sets
                        .filter((adset) => adset.format?.length > 0)
                        .map((adset, adsetIdx) => (
                          <div
                            key={adsetIdx}
                            className="mt-3 p-3 bg-white rounded border">
                            <div className="font-medium text-base">
                              {formatAudienceDisplayName(
                                adset.audience_type,
                                adset.name
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              Size: {adset.size}
                            </div>
                            {adset.format?.map((format, formatIdx) => (
                              <RenderFormatDetails
                                key={formatIdx}
                                format={format}
                                formatIndex={formatIdx}
                              />
                            ))}
                          </div>
                        ))}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        })}
        {!CHANNEL_TYPES.some(({ key }) =>
          stage[key]?.some((platform: PlatformType) =>
            view === "channel"
              ? platform.format?.length > 0
              : platform.ad_sets?.some((adset) => adset.format?.length > 0)
          )
        ) && (
          <div className="text-center text-gray-500 text-base">
            No creatives uploaded for this stage.
          </div>
        )}
      </div>
    </div>
  );
};

// Components
const MediaOption = ({
  option,
  isSelected,
  quantity,
  onSelect,
  onQuantityChange,
  onOpenModal,
  platformName,
  channelName,
  previews,
  stageName,
  format,
  adSetIndex,
  onPreviewsUpdate,
  onDeletePreview,
  completedDeletions,
  isLoading,
}: {
  option: MediaOptionType;
  isSelected: boolean;
  quantity: number;
  onSelect: () => void;
  onQuantityChange: (change: number) => void;
  onOpenModal: (previews: Array<{ id: string; url: string }>) => void;
  platformName: string;
  channelName: string;
  previews: Array<{ id: string; url: string }>;
  stageName: string;
  format: string;
  adSetIndex?: number;
  onPreviewsUpdate: (previews: Array<{ id: string; url: string }>) => void;
  onDeletePreview: (
    previewId: string,
    format: string,
    adSetIndex?: number
  ) => void;
  completedDeletions: Set<string>;
  isLoading?: boolean;
}) => {
  const [localPreviews, setLocalPreviews] = useState<
    Array<{ id: string; url: string }>
  >([]);
  const [deletingPreviewId, setDeletingPreviewId] = useState<string | null>(
    null
  );

  const { jwt } = useCampaigns();

  const [isHovered, setIsHovered] = useState(false);

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
  const STRAPI_TOKEN = jwt;

  useEffect(() => {
    if (!STRAPI_URL || !STRAPI_TOKEN) {
      toast.error("Server configuration error. Please contact support.");
      return;
    }

    const newPreviews = (previews || []).slice(0, quantity);
    setLocalPreviews((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newPreviews)) {
        return newPreviews;
      }
      return prev;
    });
  }, [previews, quantity, STRAPI_URL, STRAPI_TOKEN]);

  useEffect(() => {
    onPreviewsUpdate(localPreviews);
  }, [localPreviews, onPreviewsUpdate]);

  useEffect(() => {
    if (
      deletingPreviewId &&
      !localPreviews.some((prv) => prv.id === deletingPreviewId)
    ) {
      setDeletingPreviewId(null);
      toast.success("Preview deleted successfully!");
    }
  }, [localPreviews, deletingPreviewId]);

  useEffect(() => {
    if (deletingPreviewId && completedDeletions.has(deletingPreviewId)) {
      setDeletingPreviewId(null);
    }
  }, [completedDeletions, deletingPreviewId]);

  const handleDelete = useCallback(
    (previewId: string) => {
      if (!previewId || !STRAPI_URL || !STRAPI_TOKEN || deletingPreviewId) {
        if (deletingPreviewId) {
          toast.error("Please wait until the current deletion is complete.");
        } else {
          toast.error("Invalid preview ID or server configuration.");
        }
        return;
      }

      setDeletingPreviewId(previewId);
      onDeletePreview(previewId, format, adSetIndex);
    },
    [
      STRAPI_URL,
      STRAPI_TOKEN,
      format,
      adSetIndex,
      onDeletePreview,
      deletingPreviewId,
    ]
  );

  const isDecreaseDisabled = quantity === 1 || localPreviews.length >= quantity;

  return (
    <div>
      <div className="flex gap-6 min-w-fit">
        <div className="flex flex-col items-center">
          <div
            onClick={onSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative text-center p-2 rounded-lg border transition 
              ${
                isSelected
                  ? "border-blue-500 shadow-lg"
                  : isHovered
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300"
              } 
              cursor-pointer
              ${isHovered && !isSelected ? "shadow-md" : ""}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
            style={{
              transition:
                "background 0.15s, border-color 0.15s, box-shadow 0.15s",
            }}>
            <Image
              src={option.icon || "/placeholder.svg"}
              width={168}
              height={132}
              alt={option.name}
            />
            <p className="text-sm font-medium text-gray-700 mt-2">
              {option.name}
            </p>
            {isSelected && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                <FaCheck />
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <FaSpinner className="animate-spin text-blue-500" size={20} />
                  <p className="text-xs text-gray-600">Processing...</p>
                </div>
              </div>
            )}
          </div>
          {isSelected && (
            <div className="flex items-center bg-[#F6F6F6] gap-2 mt-4 border rounded-[8px]">
              <button
                className={`px-2 py-1 text-[#000000] text-lg font-semibold ${
                  isDecreaseDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => !isDecreaseDisabled && onQuantityChange(-1)}
                disabled={isDecreaseDisabled}>
                -
              </button>
              <span className="px-2">{quantity || 1}</span>
              <button
                className="px-2 py-1 text-[#000000] text-lg font-semibold"
                onClick={() => onQuantityChange(1)}>
                +
              </button>
            </div>
          )}
        </div>
        {isSelected && (
          <div
            onClick={() => onOpenModal(localPreviews)}
            className="w-[225px] h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
            <div className="flex flex-col items-center gap-2 text-center">
              <svg
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z"
                  fill="#3175FF"
                />
              </svg>
              <p className="text-md font-lighter text-black mt-2">
                Upload your previews
              </p>
            </div>
          </div>
        )}
      </div>
      {isSelected && localPreviews.length > 0 && (
        <div className="mt-8">
          <p className="font-semibold text-lg mb-4">
            Uploaded Previews ({localPreviews.length}/{quantity})
          </p>
          <div className="grid grid-cols-2 gap-3 flex-wrap">
            {localPreviews.map((prv, index) => (
              <div key={prv?.id || index} className="relative">
                <a
                  href={prv?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[225px] h-[150px] rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors border border-gray-500 cursor-pointer">
                  {renderUploadedFile(
                    localPreviews?.map((lp) => lp?.url),
                    option?.name,
                    index
                  )}
                </a>
                <button
                  className={`absolute right-2 top-2 bg-red-500 w-[20px] h-[20px] rounded-full flex justify-center items-center ${
                    deletingPreviewId === prv.id
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={() => handleDelete(prv?.id)}
                  disabled={deletingPreviewId === prv?.id}>
                  {deletingPreviewId === prv?.id ? (
                    <FaSpinner
                      color="white"
                      className="animate-spin"
                      size={10}
                    />
                  ) : (
                    <Trash color="white" size={10} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MediaSelectionGrid = ({
  mediaOptions,
  platformName,
  channelName,
  stageName,
  quantities,
  onFormatSelect,
  onQuantityChange,
  onOpenModal,
  adSetIndex,
  view,
  onDeletePreview,
  completedDeletions,
  isFormatLoading,
  setChange,
}: {
  mediaOptions: MediaOptionType[];
  platformName: string;
  channelName: string;
  stageName: string;
  quantities: { [key: string]: number };
  onFormatSelect: (index: number, adSetIndex?: number) => void;
  onQuantityChange: (modes: string, change: number) => void;
  onOpenModal: (
    platform: string,
    channel: string,
    format: string,
    previews: any[],
    quantities: any,
    adSetIndex?: number
  ) => void;
  adSetIndex?: number;
  view: "channel" | "adset";
  onDeletePreview: (
    previewId: string,
    format: string,
    adSetIndex?: number
  ) => void;
  completedDeletions: Set<string>;
  isFormatLoading: { [key: string]: boolean };
  setChange: (value: boolean) => void;
}) => {
  const { campaignFormData, setPlatformName } = useCampaigns();
  const channelKey = channelName.toLowerCase().replace(/\s+/g, "_");

  const stage = campaignFormData?.channel_mix?.find(
    (ch) => ch?.funnel_stage === stageName
  );
  const platform = stage?.[channelKey]?.find(
    (pl) => pl?.platform_name === platformName
  );
  const adSet =
    adSetIndex !== undefined ? platform?.ad_sets?.[adSetIndex] : null;
  const platformformat = platform?.format?.length ?? 0;
  const adsetformat = adSet?.format?.length ?? 0;
  const isSelected = adSet === null ? platformformat : adsetformat;

  useEffect(() => {
    if (adSet === null) {
      setPlatformName(platformformat);
    } else {
      setPlatformName(adsetformat);
    }
  }, [isSelected, adSet, platform]);

  const [previewsMap, setPreviewsMap] = useState<{
    [format: string]: Array<{ id: string; url: string }>;
  }>({});

  const handlePreviewsUpdate = useCallback(
    (format: string, previews: Array<{ id: string; url: string }>) => {
      setPreviewsMap((prev) => {
        if (JSON.stringify(prev[format]) !== JSON.stringify(previews)) {
          return { ...prev, [format]: previews };
        }
        return prev;
      });
    },
    []
  );

  const memoizedOnOpenModal = useCallback(
    (
      platform: string,
      channel: string,
      format: string,
      previews: any[],
      quantities: any,
      adSetIndex?: number
    ) => {
      onOpenModal(platform, channel, format, previews, quantities, adSetIndex);
    },
    [onOpenModal]
  );

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-clip">
      <div className="flex gap-4" style={{ minWidth: "max-content" }}>
        {mediaOptions?.map((option, index) => {
          const isSelected =
            adSet && view === "adset"
              ? adSet.format?.some((f) => f?.format_type === option?.name)
              : platform?.format?.some((f) => f?.format_type === option?.name);

          const previews =
            adSet && view === "adset"
              ? adSet.format?.find((f) => f?.format_type === option?.name)
                  ?.previews || []
              : platform?.format?.find((f) => f?.format_type === option?.name)
                  ?.previews || [];

          const q =
            adSet && view === "adset"
              ? adSet.format?.find((f) => f?.format_type === option?.name)
                  ?.num_of_visuals
              : platform?.format?.find((f) => f?.format_type === option?.name)
                  ?.num_of_visuals;

          return (
            <div key={index}>
              <MediaOption
                option={option}
                isSelected={!!isSelected}
                quantity={quantities[option?.name] || Number.parseInt(q) || 1}
                onSelect={() => onFormatSelect(index, adSetIndex)}
                onQuantityChange={(change) =>
                  onQuantityChange(option?.name, change)
                }
                onOpenModal={(previews) =>
                  memoizedOnOpenModal(
                    platformName,
                    channelName,
                    option?.name,
                    previews,
                    quantities[option?.name] || Number.parseInt(q) || 1,
                    adSetIndex
                  )
                }
                platformName={platformName}
                channelName={channelName}
                previews={previews}
                stageName={stageName}
                format={option?.name}
                adSetIndex={adSetIndex}
                onPreviewsUpdate={(previews) =>
                  handlePreviewsUpdate(option?.name, previews)
                }
                onDeletePreview={onDeletePreview}
                completedDeletions={completedDeletions}
                isLoading={
                  isFormatLoading[
                    `${platformName}-${option?.name}${
                      adSetIndex !== undefined ? `-adset-${adSetIndex}` : ""
                    }`
                  ]
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PlatformItem = ({
  platform,
  channelTitle,
  stageName,
  quantities,
  onQuantityChange,
  onOpenModal,
  view,
  onDeletePreview,
  completedDeletions,
  setChange,
}: {
  platform: PlatformType;
  channelTitle: string;
  stageName: string;
  quantities: QuantitiesType;
  onQuantityChange: (
    platformName: string,
    formatName: string,
    change: number
  ) => void;
  onOpenModal: (
    platform: string,
    channel: string,
    format: string,
    previews: any[],
    quantities: any,
    adSetIndex?: number
  ) => void;
  view: "channel" | "adset";
  onDeletePreview: (
    previewId: string,
    format: string,
    adSetIndex?: number
  ) => void;
  completedDeletions: Set<string>;
  setChange: (value: boolean) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState<{ [key: string]: boolean }>({});
  const [expandedAdsets, setExpandedAdsets] = useState<{
    [key: string]: boolean;
  }>({});
  const [isFormatLoading, setIsFormatLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const { campaignFormData, setCampaignFormData, jwt } = useCampaigns();

  useEffect(() => {
    if (platform.format?.length > 0 && view === "channel") {
      setIsExpanded((prev) => ({
        ...prev,
        [`${platform.platform_name}-${platform.id}`]: true,
      }));
    }
    if (
      view === "adset" &&
      platform.ad_sets?.some((adset) => adset.format?.length > 0)
    ) {
      platform.ad_sets?.forEach((_, index) => {
        setExpandedAdsets((prev) => ({
          ...prev,
          [`${platform.platform_name}-${index}`]: true,
        }));
      });
    }
  }, [
    platform.format,
    platform.platform_name,
    platform.id,
    platform.ad_sets,
    view,
  ]);

  const toggleExpansion = useCallback((id: string) => {
    setIsExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const toggleAdsetExpansion = useCallback((adsetId: string) => {
    setExpandedAdsets((prev) => ({
      ...prev,
      [adsetId]: !prev[adsetId],
    }));
  }, []);

  const handleFormatSelection = useCallback(
    async (index: number, adsetIndex?: number) => {
      const formatName = DEFAULT_MEDIA_OPTIONS[index].name;
      const copy = [...campaignFormData?.channel_mix];

      const stageIndex = copy.findIndex(
        (item) => item?.funnel_stage === stageName
      );
      if (stageIndex === -1) return;

      const channelKey = channelTitle.toLowerCase().replace(/\s+/g, "_");
      const channel = copy[stageIndex][channelKey];
      const platformIndex = channel?.findIndex(
        (item) => item.platform_name === platform.platform_name
      );
      if (platformIndex === -1) return;

      const platformCopy = channel[platformIndex];

      // Create a unique key for this format selection
      const formatKey = `${platform.platform_name}-${formatName}${
        adsetIndex !== undefined ? `-adset-${adsetIndex}` : ""
      }`;

      // Set loading state for this specific format
      setIsFormatLoading((prev) => ({ ...prev, [formatKey]: true }));

      if (
        view === "adset" &&
        typeof adsetIndex === "number" &&
        platformCopy.ad_sets?.length > 0
      ) {
        const adset = platformCopy.ad_sets[adsetIndex];
        if (!adset) return;

        if (!adset.format) adset.format = [];

        const adsetFormatIndex = adset.format.findIndex(
          (f) => f.format_type === formatName
        );

        if (adsetFormatIndex !== -1) {
          // Format is being deselected - delete all previews first
          const formatToRemove = adset.format[adsetFormatIndex];
          if (formatToRemove.previews && formatToRemove.previews.length > 0) {
            // Delete all previews from database first, then remove format
            const deletePromises = formatToRemove.previews.map((preview) => {
              if (preview.id) {
                return fetch(
                  `${process.env.NEXT_PUBLIC_STRAPI_URL}/upload/files/${preview.id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${jwt}`,
                    },
                  }
                );
              }
              return Promise.resolve();
            });

            try {
              await Promise.all(deletePromises);
            } catch (error) {}
          }
          adset.format.splice(adsetFormatIndex, 1);
        } else {
          adset.format.push({
            format_type: formatName,
            num_of_visuals: "1",
            previews: [],
          });
        }
      } else if (view === "channel") {
        if (!platformCopy.format) platformCopy.format = [];

        const formatIndex = platformCopy.format.findIndex(
          (f) => f.format_type === formatName
        );

        if (formatIndex !== -1) {
          // Format is being deselected - delete all previews first
          const formatToRemove = platformCopy.format[formatIndex];
          if (formatToRemove.previews && formatToRemove.previews.length > 0) {
            // Delete all previews from database first, then remove format
            const deletePromises = formatToRemove.previews.map((preview) => {
              if (preview.id) {
                return fetch(
                  `${process.env.NEXT_PUBLIC_STRAPI_URL}/upload/files/${preview.id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${jwt}`,
                    },
                  }
                );
              }
              return Promise.resolve();
            });

            try {
              await Promise.all(deletePromises);
            } catch (error) {}
          }
          platformCopy.format.splice(formatIndex, 1);
        } else {
          platformCopy.format.push({
            format_type: formatName,
            num_of_visuals: "1",
            previews: [],
          });
        }
      }

      setChange(true); // Mark that changes have been made
      setCampaignFormData((prev) => ({
        ...prev,
        channel_mix: copy,
      }));

      // Clear loading state
      setIsFormatLoading((prev) => ({ ...prev, [formatKey]: false }));
    },
    [
      campaignFormData,
      setCampaignFormData,
      setChange,
      channelTitle,
      stageName,
      platform.platform_name,
      view,
      jwt,
    ]
  );

  return (
    <div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-[8px] font-[500] border p-3 rounded-[10px] min-w-[150px] max-w-[180px] w-full">
          {platformIcons[platform.platform_name] && (
            <Image
              src={
                getPlatformIcon(platform.platform_name) || "/placeholder.svg"
              }
              alt={platform.platform_name}
              width={20}
              height={20}
            />
          )}
          <p>{platform.platform_name}</p>
        </div>
        {view !== "adset" && (
          <div
            className="flex gap-3 items-center font-semibold cursor-pointer"
            onClick={() =>
              toggleExpansion(`${platform.platform_name}-${platform.id}`)
            }>
            {isExpanded[`${platform.platform_name}-${platform.id}`] ? (
              <span className="text-gray-500">
                Choose the number of visuals for this format
              </span>
            ) : (
              <>
                <p className="font-bold text-[18px] text-[#3175FF]">
                  <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                    <path
                      d="M5.87891 5.16675V0.166748H7.54557V5.16675H12.5456V6.83342H7.54557V11.8334H5.87891V6.83342H0.878906V5.16675H5.87891Z"
                      fill="#3175FF"
                    />
                  </svg>
                </p>
                <h3 className="text-[#3175FF]">Add format</h3>
              </>
            )}
          </div>
        )}
      </div>

      {view === "channel" &&
        isExpanded[`${platform.platform_name}-${platform.id}`] && (
          <div className="py-6">
            <MediaSelectionGrid
              mediaOptions={DEFAULT_MEDIA_OPTIONS}
              platformName={platform.platform_name}
              channelName={channelTitle}
              stageName={stageName}
              quantities={quantities[platform.platform_name] || {}}
              onFormatSelect={handleFormatSelection}
              onQuantityChange={(formatName, change) =>
                onQuantityChange(platform.platform_name, formatName, change)
              }
              onOpenModal={onOpenModal}
              view={view}
              onDeletePreview={onDeletePreview}
              completedDeletions={completedDeletions}
              isFormatLoading={isFormatLoading}
              setChange={setChange}
            />
          </div>
        )}

      {view === "adset" && platform.ad_sets?.length > 0 && (
        <>
          {platform.ad_sets.map((adset, index) => {
            const adsetKey = `${adset.id}-${index}`;
            const isAdsetExpanded =
              expandedAdsets[`${platform.platform_name}-${index}`];

            return (
              <div key={adsetKey}>
                <div className="my-3 flex items-center gap-8">
                  <div className="p-3 border w-fit rounded-md">
                    {formatAudienceDisplayName(adset.audience_type, adset.name)}
                  </div>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() =>
                      toggleAdsetExpansion(`${platform.platform_name}-${index}`)
                    }>
                    {isAdsetExpanded ? (
                      <span className="text-gray-500">
                        Choose the number of visuals for this format
                      </span>
                    ) : (
                      <>
                        <p className="font-bold text-[18px] text-[#3175FF]">
                          <svg
                            width="13"
                            height="12"
                            viewBox="0 0 13 12"
                            fill="none">
                            <path
                              d="M5.87891 5.16675V0.166748H7.54557V5.16675H12.5456V6.83342H7.54557V11.8334H5.87891V6.83342H0.878906V5.16675H5.87891Z"
                              fill="#3175FF"
                            />
                          </svg>
                        </p>
                        <h3 className="text-[#3175FF] font-semibold">
                          Add format
                        </h3>
                      </>
                    )}
                  </div>
                </div>

                {isAdsetExpanded && (
                  <div className="py-6">
                    <MediaSelectionGrid
                      mediaOptions={DEFAULT_MEDIA_OPTIONS}
                      platformName={platform.platform_name}
                      channelName={channelTitle}
                      stageName={stageName}
                      quantities={
                        quantities[
                          `${platform.platform_name}_adset_${index}`
                        ] || {}
                      }
                      onFormatSelect={handleFormatSelection}
                      onQuantityChange={(formatName, change) =>
                        onQuantityChange(
                          `${platform.platform_name}_adset_${index}`,
                          formatName,
                          change
                        )
                      }
                      onOpenModal={onOpenModal}
                      adSetIndex={index}
                      view={view}
                      onDeletePreview={onDeletePreview}
                      completedDeletions={completedDeletions}
                      isFormatLoading={isFormatLoading}
                      setChange={setChange}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

const ChannelSection = ({
  channelTitle,
  platforms,
  stageName,
  quantities,
  onQuantityChange,
  onOpenModal,
  view,
  onDeletePreview,
  completedDeletions,
  setChange,
}: {
  channelTitle: string;
  platforms: PlatformType[];
  stageName: string;
  quantities: QuantitiesType;
  onQuantityChange: (
    platformName: string,
    formatName: string,
    change: number
  ) => void;
  onOpenModal: (
    platform: string,
    channel: string,
    format: string,
    previews: any[],
    quantities: any,
    adSetIndex?: number
  ) => void;
  view: "channel" | "adset";
  onDeletePreview: (
    previewId: string,
    format: string,
    adSetIndex?: number
  ) => void;
  completedDeletions: Set<string>;
  setChange: (value: boolean) => void;
}) => {
  const filteredPlatforms =
    view === "adset"
      ? platforms.filter((platform) => platform.ad_sets?.length > 0)
      : platforms;

  if (!filteredPlatforms || filteredPlatforms.length === 0) return null;

  return (
    <>
      <h3 className="font-[600] my-[24px] text-lg">{channelTitle}</h3>
      <div className="flex flex-col gap-[24px]">
        {filteredPlatforms.map((platform, index) => (
          <PlatformItem
            key={`${platform.platform_name}-${index}`}
            platform={platform}
            channelTitle={channelTitle}
            stageName={stageName}
            quantities={quantities}
            onQuantityChange={onQuantityChange}
            onOpenModal={onOpenModal}
            view={view}
            onDeletePreview={onDeletePreview}
            completedDeletions={completedDeletions}
            setChange={setChange}
          />
        ))}
      </div>
    </>
  );
};

// Recap line component
const StageRecapLine = ({
  stageName,
  campaignFormData,
  view,
  onOpenCreativesModal,
}: {
  stageName: string;
  campaignFormData: any;
  view: "channel" | "adset";
  onOpenCreativesModal: (stageName: string) => void;
}) => {
  const stage = campaignFormData?.channel_mix?.find(
    (chan: any) => chan?.funnel_stage === stageName
  );

  if (!stage) return null;

  const grouped: {
    [channel: string]: Array<{ platform: string; formats: string[] }>;
  } = {};

  CHANNEL_TYPES.forEach(({ key, title }) => {
    const platforms: PlatformType[] = stage[key] || [];
    platforms.forEach((platform) => {
      if (view === "channel") {
        if (platform.format && platform.format.length > 0) {
          if (!grouped[title]) grouped[title] = [];
          grouped[title].push({
            platform: platform.platform_name,
            formats: platform.format.map((f) => f.format_type),
          });
        }
      } else if (
        view === "adset" &&
        platform.ad_sets &&
        platform.ad_sets.length > 0
      ) {
        platform.ad_sets.forEach((adset) => {
          if (adset.format && adset.format.length > 0) {
            if (!grouped[title]) grouped[title] = [];
            grouped[title].push({
              platform: `${platform.platform_name} (${formatAudienceDisplayName(
                adset.audience_type,
                adset.name
              )})`,
              formats: adset.format.map((f) => f.format_type),
            });
          }
        });
      }
    });
  });

  const hasAny = Object.values(grouped).some((arr) => arr.length > 0);

  if (!hasAny) {
    return (
      <div className="text-base text-gray-700 bg-[#f7f7fa] border border-[#e5e5e5] rounded-b-[10px] px-6 py-3">
        <span className="font-semibold">Recap:</span>{" "}
        <span className="font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237] opacity-50">
          No selection
        </span>
      </div>
    );
  }

  const recapString = Object.entries(grouped)
    .map(([channel, items]) => {
      if (!items.length) return null;
      const platformsStr = items
        .map((item) => {
          return (
            <span key={item?.platform}>
              <span className="font-medium">{item?.platform}</span>
              {": "}
              <span>
                {item?.formats?.length > 0 ? (
                  item?.formats?.join(", ")
                ) : (
                  <span className="italic text-gray-400">No formats</span>
                )}
              </span>
            </span>
          );
        })
        .reduce((acc: any[], curr, idx, arr) => {
          acc.push(curr);
          if (idx < arr?.length - 1)
            acc.push(<span key={`sep-${idx}`}> | </span>);
          return acc;
        }, []);
      return (
        <span key={channel}>
          <span className="font-medium">{channel}</span>
          {" - "}
          {platformsStr}
        </span>
      );
    })
    .reduce((acc: any[], curr, idx, arr) => {
      acc.push(curr);
      if (idx < arr.length - 1)
        acc.push(<span key={`ch-sep-${idx}`}> | </span>);
      return acc;
    }, []);

  return (
    <div className="text-base text-gray-700 bg-[#f7f7fa] border border-[#e5e5e5] rounded-b-[10px] px-6 py-3 flex justify-between items-center">
      <div>
        <span className="font-semibold">Selection:</span> {recapString}
      </div>
      <button
        onClick={() => onOpenCreativesModal(stageName)}
        className="text-blue-500 hover:underline text-base font-medium">
        See Creatives
      </button>
    </div>
  );
};

export const Platforms = ({
  stageName,
  view = "channel",
  platformName,
  setChange,
}: {
  stageName: string;
  view?: "channel" | "adset";
  platformName?: string;
  setChange?: (value: boolean) => void;
}) => {
  const [quantities, setQuantities] = useState<QuantitiesType>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<{
    platform: string;
    channel: string;
    format: string;
    previews: any[];
    quantities: any;
    adSetIndex?: number;
  } | null>(null);
  const [deleteQueue, setDeleteQueue] = useState<
    Array<{
      previewId: string;
      format: string;
      adSetIndex?: number;
      platformName: string;
      channelName: string;
    }>
  >([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isUpdatingStrapi, setIsUpdatingStrapi] = useState(false);
  const [completedDeletions, setCompletedDeletions] = useState<Set<string>>(
    new Set()
  );

  const {
    campaignFormData,
    setCampaignFormData,
    updateCampaign,
    campaignData,
    jwt,
  } = useCampaigns();

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
  const STRAPI_TOKEN = jwt;

  useEffect(() => {
    const quantitiesKey = `quantities_${stageName}_${view}`;
    setQuantities(getLocalStorageItem(quantitiesKey, {}));
  }, [stageName, view]);

  useEffect(() => {
    const stage = campaignFormData?.channel_mix?.find(
      (chan) => chan.funnel_stage === stageName
    );

    if (stage) {
      const initialQuantities: QuantitiesType = {};

      CHANNEL_TYPES.forEach(({ key }) => {
        stage[key]?.forEach((platform) => {
          if (
            view === "channel" &&
            platform.format &&
            platform.format.length > 0
          ) {
            initialQuantities[platform.platform_name] = {};
            platform.format.forEach((f) => {
              initialQuantities[platform.platform_name][f.format_type] =
                Number.parseInt(f.num_of_visuals || "1");
            });
          }

          if (view === "adset") {
            platform.ad_sets?.forEach((adset, adsetIndex) => {
              if (adset.format && adset.format.length > 0) {
                const adsetKey = `${platform.platform_name}_adset_${adsetIndex}`;
                initialQuantities[adsetKey] = {};
                adset.format.forEach((f) => {
                  initialQuantities[adsetKey][f.format_type] = Number.parseInt(
                    f.num_of_visuals || "1"
                  );
                });
              }
            });
          }
        });
      });

      if (Object.keys(initialQuantities).length > 0) {
        setQuantities((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(initialQuantities)) {
            return initialQuantities;
          }
          return prev;
        });
        setLocalStorageItem(
          `quantities_${stageName}_${view}`,
          initialQuantities
        );
      }
    }
  }, [campaignFormData, stageName, view]);

  const uploadUpdatedCampaignToStrapi = useCallback(
    async (data: any) => {
      if (isUpdatingStrapi) {
        return;
      }

      // Check if campaign exists before attempting to save
      if (!campaignData?.id && !campaignFormData?.cId) {
        toast.warning(
          "Please save your campaign first (Step 0) to persist file uploads."
        );
        return;
      }

      setIsUpdatingStrapi(true);
      try {
        // Use the same robust data handling approach as SaveAllProgressButton
        const cleanedData = JSON.parse(JSON.stringify(data));

        // Clean channel mix data using the same approach as SaveAllProgressButton
        let channelMixCleaned = cleanedData?.channel_mix
          ? removeKeysRecursively(cleanedData.channel_mix, [
              "id",
              "isValidated",
              "formatValidated",
              "validatedStages",
              "documentId",
              "_aggregated",
              "user",
              "publishedAt",
              "createdAt",
              "updatedAt",
            ])
          : [];

        // Build a structured payload similar to SaveAllProgressButton
        const payload = {
          data: {
            channel_mix: channelMixCleaned,
            // Include other essential fields if they exist
            ...(cleanedData.funnel_stages && {
              funnel_stages: cleanedData.funnel_stages,
            }),
            ...(cleanedData.funnel_type && {
              funnel_type: cleanedData.funnel_type,
            }),
            ...(cleanedData.ad_sets_granularity && {
              ad_sets_granularity: cleanedData.ad_sets_granularity,
            }),
            ...(cleanedData.granularity && {
              granularity: cleanedData.granularity,
            }),
          },
        };

        // Use the same axios approach as SaveAllProgressButton
        const config = {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        };

        // Use the same campaign ID logic as SaveAllProgressButton
        const campaignId = campaignFormData?.cId;

        if (!campaignId) {
          console.warn("No campaign ID found, cannot save file uploads");
          toast.warning(
            "Please save your campaign first (Step 0) to persist file uploads."
          );
          return;
        }

        console.log("Attempting to save with campaign ID:", campaignId);
        console.log("Payload:", payload);

        await axios.put(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignId}`,
          payload,
          config
        );
        toast.success("File upload saved successfully!");
      } catch (error: any) {
        // Log the specific validation errors if available
        if (error?.response?.data?.details?.errors) {
        }

        // Provide more specific error messages based on the error type
        if (error?.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        } else if (error?.response?.status === 404) {
          toast.error("Campaign not found. Please save your campaign first.");
        } else if (error?.response?.status === 400) {
          if (error?.response?.data?.message === "Invalid relations") {
            toast.error(
              "Data validation error: Invalid relations detected. Please check your campaign data."
            );
          } else {
            toast.error(
              "Invalid data format. Please check your campaign data."
            );
          }
        } else {
          toast.error(`Failed to save campaign data: ${error.message}`);
        }
        throw error;
      } finally {
        setIsUpdatingStrapi(false);
      }
    },
    [isUpdatingStrapi, campaignData, campaignFormData, jwt]
  );

  const updateGlobalState = useCallback(
    async (
      platformName: string,
      channelName: string,
      format: string,
      updatedPreviews: Array<{ id: string; url: string }>,
      adSetIndex?: number
    ) => {
      if (!campaignFormData?.channel_mix) {
        throw new Error("campaignFormData or channel_mix is undefined");
      }

      const updatedChannelMix = JSON.parse(
        JSON.stringify(campaignFormData.channel_mix)
      );
      const stage = updatedChannelMix.find(
        (ch: any) => ch.funnel_stage === stageName
      );
      if (!stage) {
        throw new Error(`Stage "${stageName}" not found`);
      }

      const platformKey = channelName.toLowerCase().replace(/\s+/g, "_");
      const platforms = stage[platformKey];
      if (!platforms) {
        throw new Error(`Platform key "${platformKey}" not found`);
      }

      const targetPlatform = platforms.find(
        (pl: any) => pl.platform_name === platformName
      );
      if (!targetPlatform) {
        throw new Error(`Target platform "${platformName}" not found`);
      }

      const updatedPlatform = JSON.parse(JSON.stringify(targetPlatform));

      if (adSetIndex !== undefined) {
        if (!updatedPlatform.ad_sets?.[adSetIndex]) {
          throw new Error(`Ad set not found at index ${adSetIndex}`);
        }

        const adSet = updatedPlatform.ad_sets[adSetIndex];
        adSet.format = adSet.format || [];

        let targetFormatIndex = adSet.format.findIndex(
          (fo: any) => fo.format_type === format
        );
        if (targetFormatIndex === -1) {
          adSet.format.push({
            format_type: format,
            num_of_visuals:
              quantities[`${platformName}_adset_${adSetIndex}`]?.[
                format
              ]?.toString() || "1",
            previews: [],
          });
          targetFormatIndex = adSet.format.length - 1;
        }

        adSet.format[targetFormatIndex].previews = [...updatedPreviews];
      } else {
        updatedPlatform.format = updatedPlatform.format || [];

        let targetFormatIndex = updatedPlatform.format.findIndex(
          (fo: any) => fo.format_type === format
        );
        if (targetFormatIndex === -1) {
          updatedPlatform.format.push({
            format_type: format,
            num_of_visuals:
              quantities[platformName]?.[format]?.toString() || "1",
            previews: [],
          });
          targetFormatIndex = updatedPlatform.format.length - 1;
        }

        updatedPlatform.format[targetFormatIndex].previews = [
          ...updatedPreviews,
        ];
      }

      const platformIndex = platforms.findIndex(
        (pl: any) => pl.platform_name === platformName
      );
      platforms[platformIndex] = updatedPlatform;

      // Validate the updated data structure before sending

      // Ensure all required fields are present and valid
      const validateChannelMix = (channelMix: any[]) => {
        return channelMix.every((channel: any) => {
          if (!channel.funnel_stage) {
            return false;
          }

          // Validate each channel type
          return CHANNEL_TYPES.every(({ key }) => {
            if (channel[key] && Array.isArray(channel[key])) {
              return channel[key].every((platform: any) => {
                if (!platform.platform_name) {
                  return false;
                }

                // Validate format arrays
                if (platform.format && Array.isArray(platform.format)) {
                  const validFormats = platform.format.every((fmt: any) => {
                    if (!fmt.format_type || !fmt.num_of_visuals) {
                      return false;
                    }
                    return true;
                  });
                  if (!validFormats) return false;
                }

                // Validate ad_sets arrays
                if (platform.ad_sets && Array.isArray(platform.ad_sets)) {
                  const validAdSets = platform.ad_sets.every((adSet: any) => {
                    if (adSet.format && Array.isArray(adSet.format)) {
                      return adSet.format.every((fmt: any) => {
                        if (!fmt.format_type || !fmt.num_of_visuals) {
                          return false;
                        }
                        return true;
                      });
                    }
                    return true;
                  });
                  if (!validAdSets) return false;
                }

                return true;
              });
            }
            return true;
          });
        });
      };

      if (!validateChannelMix(updatedChannelMix)) {
        throw new Error("Invalid channel mix data structure detected");
      }

      setCampaignFormData((prev) => ({
        ...prev,
        channel_mix: updatedChannelMix,
      }));

      // Use campaignFormData instead of campaignData to ensure consistent structure
      try {
        await uploadUpdatedCampaignToStrapi({
          ...campaignFormData,
          channel_mix: updatedChannelMix,
        });
      } catch (uploadError: any) {
        // Don't fail the deletion if the campaign update fails
      }
    },
    [
      campaignFormData,
      campaignData,
      stageName,
      quantities,
      setCampaignFormData,
      uploadUpdatedCampaignToStrapi,
    ]
  );

  const debouncedUpdateGlobalState = useCallback(
    debounce(
      (
        platformName: string,
        channelName: string,
        format: string,
        previews: Array<{ id: string; url: string }>,
        adSetIndex?: number
      ) => {
        updateGlobalState(
          platformName,
          channelName,
          format,
          previews,
          adSetIndex
        ).catch((error) => {});
      },
      500,
      { leading: false, trailing: true }
    ),
    [updateGlobalState]
  );

  const processDeleteQueue = useCallback(async () => {
    if (deleteQueue.length === 0 || isProcessingQueue) return;

    setIsProcessingQueue(true);
    const { previewId, format, adSetIndex, platformName, channelName } =
      deleteQueue[0];

    try {
      // PATCH: Validate previewId before making the request
      if (
        !previewId ||
        (typeof previewId !== "string" && typeof previewId !== "number")
      ) {
        toast.error("Invalid file ID for deletion.");
        setDeleteQueue((prev) => prev.slice(1));
        setCompletedDeletions((prev) => new Set(prev).add(previewId));
        setIsProcessingQueue(false);
        return;
      }

      const deleteUrl = `${STRAPI_URL}/upload/files/${previewId}`;

      const deleteResponse = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      });

      if (!deleteResponse.ok) {
        // PATCH: If file is already deleted, treat as soft success
        if (deleteResponse.status === 400) {
          setDeleteQueue((prev) => prev.slice(1));
          setCompletedDeletions((prev) => new Set(prev).add(previewId));
          setIsProcessingQueue(false);
          return;
        }
        throw new Error(
          `Failed to delete file from Strapi: ${deleteResponse.statusText}`
        );
      }

      const updatedChannelMix = JSON.parse(
        JSON.stringify(campaignFormData.channel_mix)
      );
      const stage = updatedChannelMix.find(
        (ch: any) => ch.funnel_stage === stageName
      );
      if (!stage) {
        throw new Error(`Stage "${stageName}" not found`);
      }

      const platformKey = channelName.toLowerCase().replace(/\s+/g, "_");
      const platforms = stage[platformKey];
      if (!platforms) {
        throw new Error(`Platform key "${platformKey}" not found`);
      }

      const targetPlatform = platforms.find(
        (pl: any) => pl.platform_name === platformName
      );
      if (!targetPlatform) {
        throw new Error(`Target platform "${platformName}" not found`);
      }

      const updatedPlatform = JSON.parse(JSON.stringify(targetPlatform));

      let updatedPreviews: Array<{ id: string; url: string }>;
      let originalPreviewsCount = 0;

      if (adSetIndex !== undefined) {
        if (!updatedPlatform.ad_sets?.[adSetIndex]) {
          throw new Error(`Ad set not found at index ${adSetIndex}`);
        }

        const adSet = updatedPlatform.ad_sets[adSetIndex];
        adSet.format = adSet.format || [];
        const targetFormat = adSet.format.find(
          (fo: any) => fo.format_type === format
        );
        if (!targetFormat) {
          throw new Error(`Format "${format}" not found in ad set`);
        }

        originalPreviewsCount = targetFormat.previews.length;
        updatedPreviews = targetFormat.previews.filter(
          (prv: any) => prv.id !== previewId
        );
        targetFormat.previews = updatedPreviews;
      } else {
        updatedPlatform.format = updatedPlatform.format || [];
        const targetFormat = updatedPlatform.format.find(
          (fo: any) => fo.format_type === format
        );
        if (!targetFormat) {
          throw new Error(`Format "${format}" not found`);
        }

        originalPreviewsCount = targetFormat.previews.length;
        updatedPreviews = targetFormat.previews.filter(
          (prv: any) => prv.id !== previewId
        );
        targetFormat.previews = updatedPreviews;
      }

      const platformIndex = platforms.findIndex(
        (pl: any) => pl.platform_name === platformName
      );
      platforms[platformIndex] = updatedPlatform;

      setCampaignFormData((prev) => ({
        ...prev,
        channel_mix: updatedChannelMix,
      }));

      // Only call uploadUpdatedCampaignToStrapi if we have valid previews or if this was the last preview
      // This prevents "Invalid data format" errors when all previews are deleted
      const hasValidPreviews = updatedPreviews && updatedPreviews.length > 0;
      const wasLastPreview = originalPreviewsCount === 1;

      if (hasValidPreviews || wasLastPreview) {
        // Use campaignFormData instead of campaignData to ensure consistent structure
        try {
          await uploadUpdatedCampaignToStrapi({
            ...campaignFormData,
            channel_mix: updatedChannelMix,
          });
        } catch (uploadError: any) {
          // Don't fail the deletion if the campaign update fails
          console.warn(
            "Campaign update failed after preview deletion:",
            uploadError
          );
        }
      } else {
        console.log(
          "No previews left after deletion, skipping campaign update"
        );
      }

      setDeleteQueue((prev) => prev.slice(1));
      setCompletedDeletions((prev) => new Set(prev).add(previewId));
    } catch (error: any) {
      toast.error(`Failed to delete preview: ${error.message}`);
      setCompletedDeletions((prev) => new Set(prev).add(previewId));
      setDeleteQueue((prev) => prev.slice(1));
    } finally {
      setIsProcessingQueue(false);
    }
  }, [
    deleteQueue,
    isProcessingQueue,
    STRAPI_URL,
    STRAPI_TOKEN,
    campaignFormData,
    campaignData,
    stageName,
    setCampaignFormData,
    uploadUpdatedCampaignToStrapi,
  ]);

  useEffect(() => {
    processDeleteQueue();
  }, [deleteQueue, processDeleteQueue]);

  const handleDeletePreview = useCallback(
    (
      previewId: string,
      format: string,
      adSetIndex?: number,
      platformName?: string,
      channelName?: string
    ) => {
      if (!previewId || !platformName || !channelName) {
        toast.error("Invalid preview ID or context.");
        return;
      }

      setDeleteQueue((prev) => [
        ...prev,
        { previewId, format, adSetIndex, platformName, channelName },
      ]);
    },
    []
  );

  const handleQuantityChange = useCallback(
    (key: string, formatName: string, change: number) => {
      const newQuantity = Math.max(
        1,
        (quantities[key]?.[formatName] || 1) + change
      );
      const newQuantities = {
        ...quantities,
        [key]: {
          ...quantities[key],
          [formatName]: newQuantity,
        },
      };

      setQuantities(newQuantities);
      setLocalStorageItem(`quantities_${stageName}_${view}`, newQuantities);

      const copy = [...campaignFormData.channel_mix];
      const stageIndex = copy.findIndex(
        (item) => item.funnel_stage === stageName
      );
      if (stageIndex === -1) return;

      for (const channelType of CHANNEL_TYPES) {
        const platforms = copy[stageIndex][channelType.key];
        if (!platforms) continue;

        let platformName = key;
        let adSetIndex: number | undefined;

        if (view === "adset") {
          const match = key.match(/^(.*)_adset_(\d+)$/);
          if (match) {
            platformName = match[1];
            adSetIndex = Number.parseInt(match[2]);
          }
        }

        const platform = platforms.find(
          (p) => p.platform_name === platformName
        );
        if (!platform) continue;

        if (view === "channel") {
          if (platform.format) {
            const format = platform.format.find(
              (f) => f.format_type === formatName
            );
            if (format) {
              format.num_of_visuals = newQuantity.toString();
              if (format.previews && format.previews.length > newQuantity) {
                format.previews = format.previews.slice(0, newQuantity);
              }
            }
          }
        } else if (view === "adset" && adSetIndex !== undefined) {
          const adSet = platform.ad_sets?.[adSetIndex];
          if (adSet && adSet.format) {
            const adSetFormat = adSet.format.find(
              (f) => f.format_type === formatName
            );
            if (adSetFormat) {
              adSetFormat.num_of_visuals = newQuantity.toString();
              if (
                adSetFormat.previews &&
                adSetFormat.previews.length > newQuantity
              ) {
                adSetFormat.previews = adSetFormat.previews.slice(
                  0,
                  newQuantity
                );
              }
            }
          }
        }
      }

      setCampaignFormData((prev) => ({
        ...prev,
        channel_mix: copy,
      }));
    },
    [quantities, campaignFormData, setCampaignFormData, stageName, view]
  );

  const openModal = useCallback(
    (
      platform: string,
      channel: string,
      format: string,
      previews: any[],
      quantities: any,
      adSetIndex?: number
    ) => {
      setModalContext({
        platform,
        channel,
        format,
        previews,
        quantities,
        adSetIndex,
      });
      setIsModalOpen(true);
    },
    []
  );

  const getChannelPlatforms = useCallback(() => {
    const stage = campaignFormData?.channel_mix?.find(
      (chan) => chan?.funnel_stage === stageName
    );

    if (!stage) return [];

    return CHANNEL_TYPES.map(({ key, title }) => ({
      title,
      platforms: stage[key]?.filter((p: PlatformType) => p.platform_name) || [],
    })).filter((channel) => channel?.platforms?.length > 0);
  }, [campaignFormData, stageName]);

  const channelSections = getChannelPlatforms();

  return (
    <div className="text-[16px] overflow-x-hidden">
      {channelSections.map((channel, index) => (
        <ChannelSection
          key={`${channel?.title}-${index}`}
          channelTitle={channel?.title}
          platforms={
            platformName
              ? channel?.platforms?.filter(
                  (fdj) => fdj?.platform_name === platformName
                )
              : channel?.platforms
          }
          stageName={stageName}
          quantities={quantities}
          onQuantityChange={handleQuantityChange}
          onOpenModal={openModal}
          view={view}
          onDeletePreview={(previewId, format, adSetIndex) =>
            handleDeletePreview(
              previewId,
              format,
              adSetIndex,
              channel.platforms[0]?.platform_name,
              channel.title
            )
          }
          completedDeletions={completedDeletions}
          setChange={setChange}
        />
      ))}

      {isModalOpen && modalContext && (
        <UploadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalContext(null);
          }}
          platform={modalContext.platform}
          channel={modalContext.channel}
          format={modalContext.format}
          previews={modalContext.previews}
          quantities={modalContext.quantities}
          stageName={stageName}
          adSetIndex={modalContext.adSetIndex}
          onUploadSuccess={() => {
            setIsModalOpen(false);
            setModalContext(null);
          }}
        />
      )}
    </div>
  );
};

export const FormatSelection = ({
  stageName,
  platformName,
  view: openView,
}: {
  stageName?: string;
  platformName?: string;
  view?: "channel" | "adset";
}) => {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [view, setView] = useState<"channel" | "adset">("channel");
  const [isCreativesModalOpen, setIsCreativesModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const { campaignFormData, setCampaignFormData, campaignData } =
    useCampaigns();
  const { setIsDrawerOpen, setClose } = useComments();
  const { active, setChange } = useActive();

  useEffect(() => {
    // First check if there's an openView prop
    if (openView) {
      setView(openView);
      setCampaignFormData((prev) => ({
        ...prev,
        goal_level: openView === "channel" ? "Channel level" : "Adset level",
      }));
    } else {
      // Check if granularity is already set in campaign data
      if (campaignFormData?.ad_sets_granularity) {
        // Use existing granularity setting
        setView(campaignFormData.ad_sets_granularity);
        setCampaignFormData((prev) => ({
          ...prev,
          goal_level:
            campaignFormData.ad_sets_granularity === "channel"
              ? "Channel level"
              : "Adset level",
        }));
      } else {
        // Only default to channel if no granularity is set
        setView("channel");
        setCampaignFormData((prev) => ({
          ...prev,
          goal_level: "Channel level",
        }));
      }
    }

    setIsDrawerOpen(false);
    !openView && setClose(false);
  }, [
    setIsDrawerOpen,
    setClose,
    openView,
    campaignFormData?.ad_sets_granularity,
  ]);

  // Watch for changes in ad_sets_granularity from campaign data
  useEffect(() => {
    if (campaignFormData?.ad_sets_granularity && !openView) {
      // Only update if no openView prop is provided and granularity is explicitly set
      // Also check if the view is different to avoid unnecessary updates
      if (view !== campaignFormData.ad_sets_granularity) {
        setView(campaignFormData.ad_sets_granularity);
        setCampaignFormData((prev) => ({
          ...prev,
          goal_level:
            campaignFormData.ad_sets_granularity === "channel"
              ? "Channel level"
              : "Adset level",
        }));
      }
    }
  }, [campaignFormData?.ad_sets_granularity, openView, view]);

  useEffect(() => {
    const savedOpenTabs = getLocalStorageItem("formatSelectionOpenTabs");

    if (savedOpenTabs) {
      setOpenTabs(savedOpenTabs);
    } else if (campaignFormData?.channel_mix?.length > 0) {
      const initialTab = [campaignFormData.channel_mix[0]?.funnel_stage];
      setOpenTabs(initialTab);
      setLocalStorageItem("formatSelectionOpenTabs", initialTab);
    }
  }, [campaignFormData]);

  const toggleTab = useCallback(
    (stageName: string) => {
      const newOpenTabs = openTabs.includes(stageName)
        ? openTabs.filter((tab) => tab !== stageName)
        : [...openTabs, stageName];

      setOpenTabs(newOpenTabs);
      setLocalStorageItem("formatSelectionOpenTabs", newOpenTabs);
    },
    [openTabs]
  );

  const hasSelectedFormatsForStage = useCallback(
    (stageName: string) => {
      const stage = campaignFormData?.channel_mix?.find(
        (chan) => chan?.funnel_stage === stageName
      );

      return (
        stage &&
        CHANNEL_TYPES.some(({ key }) =>
          stage[key]?.some((platform: PlatformType) =>
            view === "channel"
              ? platform?.format?.length > 0
              : platform?.ad_sets?.some((adset) => adset?.format?.length > 0)
          )
        )
      );
    },
    [campaignFormData, view]
  );

  const getStageStatus = useCallback(
    (stageName: string) => {
      const hasFormats = hasSelectedFormatsForStage(stageName);

      if (hasFormats) return "";
      return "Not started";
    },
    [hasSelectedFormatsForStage]
  );

  const handleToggleChange = useCallback(
    (checked: boolean) => {
      const newView = checked ? "adset" : "channel";
      setView(newView);
      setCampaignFormData((prev) => ({
        ...prev,
        goal_level: checked ? "Adset level" : "Channel level",
        ad_sets_granularity: newView, // Update the granularity field when user makes a choice
      }));
    },
    [setCampaignFormData]
  );

  const openCreativesModal = useCallback((stageName: string) => {
    setSelectedStage(stageName);
    setIsCreativesModalOpen(true);
  }, []);

  const closeCreativesModal = useCallback(() => {
    setIsCreativesModalOpen(false);
    setSelectedStage(null);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center gap-5">
        {!stageName && (
          <PageHeaderWrapper
            t1="Select formats for each channel"
            t2="Select the creative formats you want to use for your campaign. Specify the number of visuals for each format. Multiple formats can be selected per channel or Ad set"
          />
        )}
        {active === 4 && <SaveAllProgressButton />}
      </div>
      <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
        {!stageName &&
          (campaignFormData?.ad_sets_granularity === "adset" ||
            view === "adset") && (
            <div className="flex justify-center gap-3">
              <p className="font-medium">Channel Granularity</p>
              <Switch
                checked={view === "adset"}
                onChange={handleToggleChange}
                onColor="#5cd08b"
                offColor="#3175FF"
                handleDiameter={18}
                uncheckedIcon={false}
                checkedIcon={false}
                height={24}
                width={48}
                borderRadius={24}
                activeBoxShadow="0 0 2px 3px rgba(37, 99, 235, 0.2)"
                className="react-switch"
              />
              <p className="font-medium">Ad Set Granularity</p>
            </div>
          )}

        {campaignFormData?.funnel_stages
          ?.filter((ff) => !stageName || ff === stageName)
          ?.map((stageName, index) => {
            const stage = campaignFormData?.custom_funnels?.find(
              (s) => s?.name === stageName
            );
            if (!stage) return null;

            const status = getStageStatus(stageName);
            const isOpen = openTabs.includes(stage?.name);

            return (
              <div key={index}>
                <div
                  className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] ${
                    isOpen ? "rounded-t-[10px]" : "rounded-[10px]"
                  }`}
                  onClick={() => toggleTab(stage?.name)}>
                  <div className="flex items-center gap-2">
                    {stage?.icon && (
                      <Image
                        loading="lazy"
                        src={stage?.icon || "/placeholder.svg"}
                        alt={`${stage?.name} icon`}
                        width={24}
                        height={24}
                      />
                    )}
                    <p className="w-full max-w-[1500px] h-[24px] font-[General Sans] font-semibold text-[18px] leading-[24px] text-black">
                      {stage?.name}
                    </p>
                  </div>
                  {status && (
                    <p className="font-[General Sans] font-medium text-[16px] leading-[22px] text-black">
                      {status}
                    </p>
                  )}
                  <Image
                    src={isOpen ? "/arrow-down.svg" : "/arrow-down-2.svg"}
                    alt={isOpen ? "up" : "down"}
                    width={24}
                    height={24}
                  />
                </div>
                {!isOpen && (
                  <StageRecapLine
                    stageName={stage.name}
                    campaignFormData={campaignFormData}
                    view={view}
                    onOpenCreativesModal={openCreativesModal}
                  />
                )}
                {isOpen && (
                  <div className="card-body bg-white border border-[#E5E5E5]">
                    <Platforms
                      stageName={stage?.name}
                      view={view}
                      platformName={platformName}
                      setChange={setChange}
                    />
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {isCreativesModalOpen && selectedStage && (
        <CreativesModal
          isOpen={isCreativesModalOpen}
          onClose={closeCreativesModal}
          stageName={selectedStage}
          campaignFormData={campaignFormData}
          view={view}
        />
      )}
    </div>
  );
};

export default FormatSelection;
