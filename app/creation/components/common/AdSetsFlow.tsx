"use client";

import type React from "react";
import {
  memo,
  useState,
  useCallback,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import Image, { type StaticImageData } from "next/image";
import { FaAngleRight, FaSpinner } from "react-icons/fa";
import { MdDelete, MdAdd } from "react-icons/md";
import { useEditing } from "../../../utils/EditingContext";
import { useCampaigns } from "../../../utils/CampaignsContext";
import facebook from "../../../../public/facebook.svg";
import ig from "../../../../public/ig.svg";
import youtube from "../../../../public/youtube.svg";
import TheTradeDesk from "../../../../public/TheTradeDesk.svg";
import Quantcast from "../../../../public/quantcast.svg";
import google from "../../../../public/social/google.svg";
import x from "../../../../public/x.svg";
import linkedin from "../../../../public/linkedin.svg";
import Display from "../../../../public/Display.svg";
import yahoo from "../../../../public/yahoo.svg";
import bing from "../../../../public/bing.svg";
import tictok from "../../../../public/tictok.svg";
import { Plus } from "lucide-react";
import { useActive } from "app/utils/ActiveContext";
import { removeKeysRecursively } from "utils/removeID";
import { getPlatformIcon, mediaTypes } from "components/data";
import axios from "axios";
import toast from "react-hot-toast";

// --- Custom Audience Types Context (Global, for all stages) ---
const CustomAudienceTypesContext = createContext<{
  customAudienceTypes: string[];
  addCustomAudienceType: (type: string) => void;
}>({
  customAudienceTypes: [],
  addCustomAudienceType: () => {},
});

// Helper for thousand separator
function formatWithThousandSeparator(value: string | number) {
  if (value === undefined || value === null) return "";
  const cleaned = String(value).replace(/,/g, "");
  if (cleaned === "") return "";
  if (!isNaN(Number(cleaned))) {
    if (cleaned.includes(".")) {
      const [int, dec] = cleaned.split(".");
      return (
        Number(int).toLocaleString("en-US") +
        "." +
        dec.replace(/[^0-9]/g, "")
      );
    }
    return Number(cleaned).toLocaleString("en-US");
  }
  return value;
}

// Types
interface AdSetType {
  id: number;
  addsetNumber: number;
}

interface OutletType {
  id: number;
  outlet: string;
  icon: StaticImageData;
}

interface AdSetFlowProps {
  stageName: string;
  onInteraction?: () => void;
  onValidate?: () => void;
  isValidateDisabled?: boolean;
  onEditStart?: () => void;
  platformName?: any;
  modalOpen?: boolean;
}

interface AudienceData {
  audience_type: string;
  name?: string;
  size?: string;
  description?: string;
}

interface AdSetData {
  id?: number;
  name: string;
  audience_type: string;
  size?: string;
  description?: string;
  extra_audiences?: AudienceData[];
}

interface Format {
  id: number;
  format_type: string;
  num_of_visuals: string;
}

interface Platform {
  id: number;
  platform_name: string;
  buy_type: string | null;
  objective_type: string | null;
  campaign_start_date: string | null;
  campaign_end_date: string | null;
  format: Format[];
  ad_sets: AdSetData[];
}

interface FunnelStage {
  id: number;
  funnel_stage: string;
  funnel_stage_timeline_start_date: string | null;
  funnel_stage_timeline_end_date: string | null;
  search_engines: Platform[];
  display_networks: Platform[];
  social_media: Platform[];
}

// Platform icons mapping
const platformIcons: Record<string, StaticImageData> = {
  Facebook: facebook,
  Instagram: ig,
  YouTube: youtube,
  Youtube: youtube,
  TheTradeDesk: TheTradeDesk,
  Quantcast: Quantcast,
  Google: google,
  "Twitter/X": x,
  LinkedIn: linkedin,
  Linkedin: linkedin,
  TikTok: tictok,
  "Display & Video": Display,
  Yahoo: yahoo,
  Bing: bing,
  "Apple Search": google,
  "The Trade Desk": TheTradeDesk,
  QuantCast: Quantcast,
};

// Context for dropdown management
const DropdownContext = createContext<{
  openDropdownId: number | null | string;
  setOpenDropdownId: (id: number | null | string) => void;
}>({
  openDropdownId: null,
  setOpenDropdownId: () => {},
});

// Utility functions
const findPlatform = (
  campaignData: FunnelStage[],
  stageName: string,
  platformName: string
): { platform: Platform; channelType: string } | null => {
  const stage = campaignData.find((stage) => stage.funnel_stage === stageName);
  if (!stage) return null;

  const channelTypes = mediaTypes;
  for (const channelType of channelTypes) {
    const platform = stage[channelType].find(
      (p) => p.platform_name === platformName
    );
    if (platform) return { platform, channelType };
  }
  return null;
};

const updateMultipleAdSets = (
  campaignData: FunnelStage[],
  stageName: string,
  platformName: string,
  adSets: AdSetData[]
): FunnelStage[] => {
  const updatedCampaignData = JSON.parse(JSON.stringify(campaignData));
  const stageIndex = updatedCampaignData.findIndex(
    (stage: FunnelStage) => stage.funnel_stage === stageName
  );

  if (stageIndex === -1) {
    console.error(`Stage "${stageName}" not found`);
    return campaignData;
  }

  const stage = updatedCampaignData[stageIndex];
  const channelTypes = mediaTypes;
  let platformFound = false;

  for (const channelType of channelTypes) {
    const platformIndex = stage[channelType].findIndex(
      (platform: Platform) => platform.platform_name === platformName
    );
    if (platformIndex !== -1) {
      const platform = stage[channelType][platformIndex];
      platform.ad_sets = adSets;
      platformFound = true;
      break;
    }
  }

  if (!platformFound) {
    console.error(
      `Platform "${platformName}" not found in stage "${stageName}"`
    );
    return campaignData;
  }
  return updatedCampaignData;
};

// AdSet Component
const AdSet = memo(function AdSet({
  adset,
  index,
  isEditing,
  onDelete,
  onUpdate,
  audienceType,
  adSetName,
  adSetSize,
  adSetDescription,
  onInteraction,
  adsets,
  extra_audiences,
  onUpdateExtraAudiences,
}: {
  adset: AdSetType;
  index: number;
  isEditing: boolean;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<AdSetData>) => void;
  audienceType?: string;
  adSetName?: string;
  adSetSize?: string;
  adSetDescription?: string;
  onInteraction: () => void;
  adsets: AdSetType[];
  extra_audiences?: AudienceData[];
  onUpdateExtraAudiences: (audiences: AudienceData[]) => void;
}) {
  const [audience, setAudience] = useState<string>(audienceType || "");
  const [name, setName] = useState<string>(adSetName || "");
  const [size, setSize] = useState<string>(adSetSize || "");
  const [description, setDescription] = useState<string>(adSetDescription || "");
  const [extraAudience, setExtraAudience] = useState<AudienceData[]>(
    extra_audiences || []
  );

  useEffect(() => {
    if (audienceType !== undefined) setAudience(audienceType);
    if (adSetName !== undefined) setName(adSetName);
    if (adSetSize !== undefined) setSize(adSetSize);
    if (adSetDescription !== undefined) setDescription(adSetDescription);
  }, [audienceType, adSetName, adSetSize, adSetDescription]);

  const updateExtraAudienceMap = (
    updatedList: AudienceData[]
  ) => {
    setExtraAudience(updatedList);
    const cleaned = updatedList.filter((item) => item.audience_type?.trim());
    onUpdateExtraAudiences(cleaned);
    onInteraction();
  };

  const handleAudienceSelect = useCallback(
    (selectedAudience: string) => {
      setAudience(selectedAudience);
      onUpdate(adset.id, { audience_type: selectedAudience });
      onInteraction();
    },
    [adset.id, onUpdate, onInteraction]
  );

  const handleExtraAudienceSelect = (selected: string, idx: number) => {
    if (!selected) return;
    const updated = [...extraAudience];
    updated[idx] = {
      ...updated[idx],
      audience_type: selected,
    };
    updateExtraAudienceMap(updated);
  };

  const handleDeleteExtraAudience = (idx: number) => {
    const updated = [...extraAudience];
    updated.splice(idx, 1);
    updateExtraAudienceMap(updated);
  };

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setName(newName);
      onUpdate(adset.id, { name: newName });
      onInteraction();
    },
    [adset.id, onUpdate, onInteraction]
  );

  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value.replace(/,/g, "");
      if (!/^\d*\.?\d*$/.test(inputValue)) {
        return;
      }
      setSize(inputValue);
      onUpdate(adset.id, { size: inputValue });
      onInteraction();
    },
    [adset.id, onUpdate, onInteraction]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDescription = e.target.value;
      setDescription(newDescription);
      onUpdate(adset.id, { description: newDescription });
      onInteraction();
    },
    [adset.id, onUpdate, onInteraction]
  );

  const handleExtraAudienceSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    let inputValue = e.target.value.replace(/,/g, "");
    if (!/^\d*\.?\d*$/.test(inputValue)) {
      return;
    }
    const updated = [...extraAudience];
    updated[index].size = inputValue;
    updateExtraAudienceMap(updated);
  };

  const handleExtraAudienceDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const updated = [...extraAudience];
    updated[index].description = e.target.value;
    updateExtraAudienceMap(updated);
  };

  const isParentFilled =
    name.trim() !== "" && audience.trim() !== "" && size.trim() !== "";

  const canAddNewAudience =
    isParentFilled &&
    (extraAudience.length === 0 ||
      (extraAudience.length > 0 &&
        extraAudience[extraAudience.length - 1]?.audience_type?.trim()));

  return (
    <div className="flex gap-2 items-start w-full px-4">
      <div className="relative">
        <p className="relative z-[1] text-[#3175FF] text-sm whitespace-nowrap font-bold flex gap-4 items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
          {`Ad set n°${adset.addsetNumber}`}
        </p>
      </div>
      <div className="w-[200px]">
        <AudienceDropdownWithCallback
          onSelect={handleAudienceSelect}
          initialValue={audience}
          dropdownId={adset.id}
        />
        <div className="mt-4 space-y-2">
          <div>
            {extraAudience?.map((audi, index) => (
              <div
                key={`${adset.id}-${index}`}
                className="flex items-center justify-between gap-4 mb-2"
              >
                <AudienceDropdownWithCallback
                  onSelect={(value: string) =>
                    handleExtraAudienceSelect(value, index)
                  }
                  initialValue={audi?.audience_type}
                  dropdownId={`${adset.id}-${index}`}
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={audi.name || ""}
                  onChange={(e) => {
                    const updated = [...extraAudience];
                    updated[index].name = e.target.value;
                    updateExtraAudienceMap(updated);
                  }}
                  disabled={!isEditing}
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[160px]"
                />
                <input
                  type="text"
                  placeholder="Size"
                  value={formatWithThousandSeparator(audi.size || "")}
                  onChange={(e) => handleExtraAudienceSizeChange(e, index)}
                  disabled={!isEditing}
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[100px]"
                  inputMode="numeric"
                  pattern="[0-9,]*"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={audi.description || ""}
                  onChange={(e) => handleExtraAudienceDescriptionChange(e, index)}
                  disabled={!isEditing}
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[180px]"
                />
                <button
                  disabled={!isEditing}
                  onClick={() => handleDeleteExtraAudience(index)}
                  className={`flex items-center justify-center rounded-full px-6 py-2 bg-[#FF5955] text-white ${
                    !isEditing ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <MdDelete /> <span className="text-white font-bold">Delete</span>
                </button>
              </div>
            ))}
          </div>
          <button
            className={`text-[14px] mt-2 font-semibold flex items-center gap-1 ${
              canAddNewAudience && extraAudience?.length < 10
                ? "text-[#3175FF] cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
            onClick={() => {
              if (canAddNewAudience) {
                const updated = [
                  ...extraAudience,
                  { audience_type: "", name: "", size: "", description: "" },
                ];
                updateExtraAudienceMap(updated);
              }
            }}
            disabled={extraAudience?.length >= 10}
          >
            <Plus size={14} />
            <p>Add new audience</p>
          </button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Enter ad set name"
        value={name}
        onChange={handleNameChange}
        disabled={!isEditing}
        className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[160px] ${
          !isEditing ? "cursor-not-allowed" : ""
        }`}
      />
      <input
        type="text"
        placeholder="Enter size"
        value={formatWithThousandSeparator(size)}
        onChange={handleSizeChange}
        disabled={!isEditing}
        className={`text-black text-sm font-semibold flex gap-4 items-center border border-[#D0D5DD] py-4 px-2 rounded-[10px] h-[52px] w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isEditing ? "cursor-not-allowed" : ""
        }`}
        inputMode="numeric"
        pattern="[0-9,]*"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={handleDescriptionChange}
        disabled={!isEditing}
        className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[180px] ${
          !isEditing ? "cursor-not-allowed" : ""
        }`}
      />
      <button
        disabled={!isEditing}
        onClick={() => onDelete(adset.id)}
        className={`flex items-center gap-2 rounded-full px-4 py-2 bg-[#FF5955] text-white text-sm font-bold ${
          !isEditing ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <MdDelete /> <span>Delete</span>
      </button>
    </div>
  );
});

// AudienceDropdownWithCallback Component
const AudienceDropdownWithCallback = memo(
  function AudienceDropdownWithCallback({
    onSelect,
    initialValue,
    dropdownId,
  }: {
    onSelect: (option: string) => void;
    initialValue?: string;
    dropdownId: number | string;
  }) {
    const { openDropdownId, setOpenDropdownId } = useContext(DropdownContext);
    const { customAudienceTypes, addCustomAudienceType } = useContext(CustomAudienceTypesContext);
    const { jwt } = useCampaigns();

    // Default options
    const defaultOptions = [
      "Lookalike audience",
      "Retargeting audience",
      "Broad audience",
      "Behavioral audience",
    ];

    // Merge default and custom, deduped
    const mergedAudienceOptions = Array.from(
      new Set([...defaultOptions, ...customAudienceTypes])
    );

    const [selected, setSelected] = useState<string>(initialValue || "");
    const [searchTerm, setSearchTerm] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customValue, setCustomValue] = useState("");
    const [loading, setLoading] = useState(false);
    const isOpen = openDropdownId === dropdownId;

    useEffect(() => {
      if (initialValue) setSelected(initialValue);
    }, [initialValue]);

    // If a custom value is selected but not in options, add it to context
    useEffect(() => {
      if (
        selected &&
        !defaultOptions.includes(selected) &&
        !customAudienceTypes.includes(selected)
      ) {
        addCustomAudienceType(selected);
      }
      // eslint-disable-next-line
    }, [selected]);

    const filteredOptions = mergedAudienceOptions.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = useCallback(
      (option: string) => {
        setSelected(option);
        setOpenDropdownId(null);
        setSearchTerm("");
        onSelect(option);
      },
      [onSelect, setOpenDropdownId]
    );

    const toggleOpen = useCallback(() => {
      setOpenDropdownId(isOpen ? null : dropdownId);
      setSearchTerm("");
      setShowCustomInput(false);
      setCustomValue("");
    }, [isOpen, setOpenDropdownId, dropdownId]);

    const handleSaveCustomAudience = async () => {
      if (!customValue.trim()) {
        toast.error("Please enter a custom audience type", {
          id: "custom-audience-error",
        });
        return;
      }

      setLoading(true);
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/audience-types`,
          { data: { text: customValue } },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        const data = res?.data?.data;
        addCustomAudienceType(data.text);
        setSelected(data.text);
        onSelect(data.text);
        setCustomValue("");
        setShowCustomInput(false);
        setOpenDropdownId(null);
        setSearchTerm("");
        toast.success("Custom audience type saved successfully");
      } catch (error) {
        console.error("Error saving custom audience type:", error);
        toast.error("Failed to save custom audience type");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (isOpen && !target.closest(`[data-dropdown-id="${dropdownId}"]`)) {
          setOpenDropdownId(null);
          setShowCustomInput(false);
          setSearchTerm("");
          setCustomValue("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, dropdownId, setOpenDropdownId]);

    return (
      <div>
        <div
          className="relative border-2 border-[#0000001A] rounded-[10px]"
          data-dropdown-id={dropdownId}
        >
          <button
            onClick={toggleOpen}
            className="relative z-10 w-[172px] bg-white text-left border border-[#0000001A] rounded-lg text-[#656565] text-sm flex items-center justify-between py-4 px-4"
          >
            <span className="truncate">{selected || "Your audience type"}</span>
            <svg
              className={`h-4 w-4 flex-shrink-0 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isOpen && (
            <div className="absolute mt-1 top-full z-50 w-full bg-white border-2 border-[#0000001A] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              <ul>
                <li className="px-2 py-2">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-[5px] outline-none"
                    placeholder="Search audiences..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </li>
                {filteredOptions.length === 0 && (
                  <li className="px-4 py-2 text-gray-400">No audiences found</li>
                )}
                {filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(option)}
                    className="p-4 cursor-pointer text-[#656565] text-sm text-center whitespace-nowrap hover:bg-gray-100"
                  >
                    {option}
                  </li>
                ))}
                {!showCustomInput ? (
                  <li
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-[#656565] text-sm text-center"
                    onClick={() => setShowCustomInput(true)}
                  >
                    Add Custom
                  </li>
                ) : (
                  <div className="w-[90%] mx-auto mb-2">
                    <input
                      className="w-full p-2 border rounded-[5px] outline-none"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder="Enter custom audience"
                    />
                    <div className="flex gap-[10px] w-full justify-between items-center my-[5px]">
                      <button
                        className="w-full p-[5px] border rounded-[5px]"
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomValue("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="w-full p-[5px] bg-blue-500 text-white rounded-[5px] flex justify-center items-center"
                        onClick={handleSaveCustomAudience}
                        disabled={loading}
                      >
                        {loading ? <FaSpinner className="animate-spin" /> : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
);

// NonFacebookOutlet Component
const NonFacebookOutlet = memo(function NonFacebookOutlet({
  outlet,
  setSelected,
  onInteraction,
}: {
  outlet: OutletType;
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  onInteraction: () => void;
}) {
  const handleSelect = useCallback(() => {
    setSelected((prev) => [...prev, outlet.outlet]);
    onInteraction();
  }, [outlet.outlet, setSelected, onInteraction]);

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative border border-[#0000001A] rounded-[10px]"
        onClick={handleSelect}
      >
        <button className="relative min-w-[150px] w-fit max-w-[300px] z-20 flex gap-4 justify-between items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
          <Image
            src={outlet.icon || "/placeholder.svg"}
            alt={outlet.outlet}
            className="w-[22px] h-[22px]"
          />
          <span className="text-[#061237] font-medium whitespace-nowrap">
            {outlet.outlet}
          </span>
          <FaAngleRight />
        </button>
      </div>
    </div>
  );
});

// AdsetSettings Component
const AdsetSettings = memo(function AdsetSettings({
  outlet,
  stageName,
  onInteraction,
  defaultOpen,
  isCollapsed,
  setCollapsed,
}: {
  outlet: OutletType;
  stageName: string;
  onInteraction: () => void;
  defaultOpen?: boolean;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  const { isEditing } = useEditing();
  const { campaignFormData, setCampaignFormData, updateCampaign, getActiveCampaign } = useCampaigns();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [adsets, setAdSets] = useState<AdSetType[]>([]);
  const [adSetDataMap, setAdSetDataMap] = useState<Record<number, AdSetData>>({});
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!campaignFormData?.channel_mix) return;
    if (initialized.current) return;
    initialized.current = true;

    const result = findPlatform(campaignFormData.channel_mix, stageName, outlet.outlet);
    const platform = result?.platform;

    if (defaultOpen && !selectedPlatforms.includes(outlet.outlet)) {
      setSelectedPlatforms((prev) => [...prev, outlet.outlet]);
    }

    if (!platform) {
      const newAdSetId = Date.now();
      setAdSets([{ id: newAdSetId, addsetNumber: 1 }]);
      setAdSetDataMap({
        [newAdSetId]: { name: "", audience_type: "", size: "", description: "" },
      });
      return;
    }

    if (platform.ad_sets && platform.ad_sets.length > 0) {
      const newAdSets = platform.ad_sets.map((adSet, index) => ({
        id: adSet.id || Date.now() + index,
        addsetNumber: index + 1,
      }));
      const newAdSetDataMap: Record<number, AdSetData> = {};
      platform.ad_sets.forEach((adSet, index) => {
        const id = newAdSets[index].id;
        newAdSetDataMap[id] = {
          name: adSet.name || "",
          audience_type: adSet.audience_type || "",
          size: adSet.size || "",
          description: adSet.description || "",
          extra_audiences: adSet?.extra_audiences,
        };
      });
      setAdSets(newAdSets);
      setAdSetDataMap(newAdSetDataMap);
    } else {
      const newAdSetId = Date.now();
      setAdSets([{ id: newAdSetId, addsetNumber: 1 }]);
      setAdSetDataMap({
        [newAdSetId]: { name: "", audience_type: "", size: "", description: "" },
      });
    }
  }, [stageName, outlet.outlet, selectedPlatforms, defaultOpen]);

  const addNewAddset = useCallback(() => {
    if (adsets.length >= 10) {
      console.warn("Maximum limit of 10 ad sets reached");
      return;
    }

    const newAdSetId = Date.now();
    setAdSets((prev) => [
      ...prev,
      { id: newAdSetId, addsetNumber: prev.length + 1 },
    ]);
    setAdSetDataMap((prev) => ({
      ...prev,
      [newAdSetId]: { name: "", audience_type: "", size: "", description: "" },
    }));
    onInteraction && onInteraction();
  }, [onInteraction, adsets.length]);

  const deleteAdSet = useCallback(async (id: number) => {
    try {
      setAdSets((prev) => {
        const newAdSets = prev.filter((adset) => adset.id !== id);
        if (newAdSets.length === 0) {
          setSelectedPlatforms((prevPlatforms) =>
            prevPlatforms.filter((p) => p !== outlet.outlet)
          );
          const newAdSetId = Date.now();
          setTimeout(() => {
            setAdSets([{ id: newAdSetId, addsetNumber: 1 }]);
            setAdSetDataMap({
              [newAdSetId]: { name: "", audience_type: "", size: "", description: "" },
            });
          }, 0);
        }
        return newAdSets;
      });

      setAdSetDataMap((prev) => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });

      const adSetsToSave = adsets
        .filter((adset) => adset.id !== id)
        .map((adset) => {
          const data = adSetDataMap[adset.id] || {
            name: "",
            audience_type: "",
            size: "",
            description: "",
          };
          return {
            id: adset.id,
            name: data.name,
            audience_type: data.audience_type,
            size: data.size,
            description: data.description,
            extra_audiences: data.extra_audiences || [],
          };
        })
        .filter((data) => data.name || data.audience_type);

      const updatedChannelMix = updateMultipleAdSets(
        campaignFormData.channel_mix,
        stageName,
        outlet.outlet,
        adSetsToSave
      );

      setCampaignFormData((prevData) => ({
        ...prevData,
        channel_mix: updatedChannelMix,
      }));

      const cleanData = removeKeysRecursively(campaignFormData, [
        "id",
        "documentId",
        "createdAt",
        "publishedAt",
        "updatedAt",
      ]);

      await updateCampaign({
        ...cleanData,
        channel_mix: removeKeysRecursively(updatedChannelMix, [
          "id",
          "isValidated",
          "validatedStages",
        ]),
      });

      await getActiveCampaign(campaignFormData);

      onInteraction && onInteraction();
    } catch (error) {
      console.error("Failed to delete ad set:", error);
    }
  }, [
    adsets,
    adSetDataMap,
    campaignFormData,
    stageName,
    outlet.outlet,
    setCampaignFormData,
    updateCampaign,
    getActiveCampaign,
    onInteraction,
  ]);

  const updateAdSetData = useCallback(
    (id: number, data: Partial<AdSetData>) => {
      setAdSetDataMap((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...data },
      }));
      onInteraction && onInteraction();
    },
    [onInteraction]
  );

  useEffect(() => {
    if (isEditing && selectedPlatforms.includes(outlet.outlet)) {
      if (!campaignFormData?.channel_mix) return;

      const adSetsToSave = adsets
        .map((adset) => {
          const data = adSetDataMap[adset.id] || {
            name: "",
            audience_type: "",
            size: "",
            description: "",
          };
          return {
            id: adset.id,
            name: data.name,
            audience_type: data.audience_type,
            size: data.size,
            description: data.description,
            extra_audiences: data.extra_audiences || [],
          };
        })
        .filter((data) => data.name || data.audience_type);

      if (adSetsToSave.length === 0) return;

      const updatedChannelMix = updateMultipleAdSets(
        campaignFormData.channel_mix,
        stageName,
        outlet.outlet,
        adSetsToSave
      );

      setCampaignFormData((prevData) => ({
        ...prevData,
        channel_mix: updatedChannelMix,
      }));
    }
  }, [
    isEditing,
    selectedPlatforms,
    outlet.outlet,
    adsets,
    adSetDataMap,
    setCampaignFormData,
    stageName,
  ]);

  const handleSelectOutlet = useCallback(() => {
    setSelectedPlatforms((prev) => [...prev, outlet.outlet]);
    onInteraction();
  }, [outlet.outlet, onInteraction]);

  const recapRows: {
    type: string;
    name: string;
    size: string;
    description?: string;
    adSetNumber: number;
    isExtra: boolean;
  }[] = [];

  adsets.forEach((adset, idx) => {
    const adSetData = adSetDataMap[adset.id] || {
      name: "",
      audience_type: "",
      size: "",
      description: "",
      extra_audiences: [],
    };
    if (adSetData.audience_type || adSetData.name || adSetData.size || adSetData.description) {
      recapRows.push({
        type: adSetData.audience_type || "",
        name: adSetData.name || "",
        size: adSetData.size || "",
        description: adSetData.description || "",
        adSetNumber: adset.addsetNumber,
        isExtra: false,
      });
    }
    if (Array.isArray(adSetData.extra_audiences)) {
      adSetData.extra_audiences.forEach((ea, eidx) => {
        if (ea.audience_type || ea.name || ea.size || ea.description) {
          recapRows.push({
            type: ea.audience_type || "",
            name: ea.name || "",
            size: ea.size || "",
            description: ea.description || "",
            adSetNumber: adset.addsetNumber,
            isExtra: true,
          });
        }
      });
    }
  });

  if (!selectedPlatforms.includes(outlet.outlet)) {
    return (
      <NonFacebookOutlet
        outlet={outlet}
        setSelected={setSelectedPlatforms}
        onInteraction={onInteraction}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-[1024px]">
      <div className="flex items-center gap-8">
        <div className="relative">
          <button
            className="relative min-w-[150px] max-w-[300px] w-fit z-20 flex gap-4 justify-between cursor-pointer items-center bg-[#F9FAFB] border border-[#0000001A] border-solid py-4 px-4 rounded-[10px]"
            onClick={() => setCollapsed(!isCollapsed)}
            type="button"
          >
            <Image
              src={outlet.icon || "/placeholder.svg"}
              alt={outlet.outlet}
              className="w-[22px] h-[22px]"
            />
            <span className="text-[#061237] font-medium">{outlet.outlet}</span>
            <FaAngleRight
              className={`transition-transform duration-200 ${
                isCollapsed ? "" : "rotate-90"
              }`}
            />
          </button>
        </div>
        {!isCollapsed && (
          <DropdownContext.Provider value={{ openDropdownId, setOpenDropdownId }}>
            <div
              className="relative w-full"
              style={{ minHeight: `${Math.max(194, (adsets.length + 1) * 80)}px` }}
            >
              {adsets.length > 0 && (
                <>
                  <div className="absolute top-0 left-0 mb-4">
                    <button
                      onClick={addNewAddset}
                      disabled={adsets.length >= 10}
                      className={`flex gap-2 items-center text-white ${
                        adsets.length >= 10 ? "bg-gray-400" : "bg-[#3175FF]"
                      } px-4 py-2 rounded-full text-sm font-bold z-10 relative`}
                    >
                      <MdAdd />
                      <span>
                        {adsets.length >= 10 ? "Max limit reached" : "New ad set"}
                      </span>
                    </button>
                  </div>

                  {adsets.map((adset, index) => {
                    const adSetData = adSetDataMap[adset.id] || {
                      name: "",
                      audience_type: "",
                      size: "",
                      description: "",
                    };
                    return (
                      <div
                        key={adset.id}
                        className="relative"
                        style={{
                          marginTop: index === 0 ? "60px" : "0px",
                          marginBottom: "20px",
                        }}
                      >
                        <AdSet
                          adset={adset}
                          index={index}
                          isEditing={isEditing}
                          onDelete={deleteAdSet}
                          onUpdate={updateAdSetData}
                          audienceType={adSetData.audience_type}
                          adSetName={adSetData.name}
                          adSetSize={adSetData.size}
                          adSetDescription={adSetData.description}
                          extra_audiences={
                            (adSetData.extra_audiences as AudienceData[]) || []
                          }
                          onUpdateExtraAudiences={(extraAudienceArray) =>
                            updateAdSetData(adset.id, {
                              extra_audiences: extraAudienceArray,
                            })
                          }
                          onInteraction={onInteraction}
                          adsets={adsets}
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </DropdownContext.Provider>
        )}
      </div>
      {isCollapsed && recapRows.length > 0 && (
        <div className="mt-2 mb-4">
          <div className="bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg px-4 py-3">
            <div className="font-semibold text-[#061237] mb-2 text-sm">
              Audience Recap
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-[#061237]">
                <thead>
                  <tr>
                    <th className="text-left pr-4 py-1">Ad Set</th>
                    <th className="text-left pr-4 py-1">Audience Type</th>
                    <th className="text-left pr-4 py-1">Audience Name</th>
                    <th className="text-left pr-4 py-1">Audience Size</th>
                    <th className="text-left pr-4 py-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {recapRows.map((row, idx) => (
                    <tr key={idx} className={row.isExtra ? "bg-[#F9FAFB]" : ""}>
                      <td className="pr-4 py-1">
                        {row.isExtra
                          ? `Ad set n°${row.adSetNumber} (Extra)`
                          : `Ad set n°${row.adSetNumber}`}
                      </td>
                      <td className="pr-4 py-1">{row.type}</td>
                      <td className="pr-4 py-1">{row.name}</td>
                      <td className="pr-4 py-1">
                        {formatWithThousandSeparator(row.size)}
                      </td>
                      <td className="pr-4 py-1">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Main AdSetFlow Component
const globalCustomAudienceTypes: string[] = [];
let globalSetCustomAudienceTypes: ((types: string[]) => void) | null = null;

const AdSetFlow = memo(function AdSetFlow({
  stageName,
  onInteraction,
  onValidate,
  isValidateDisabled,
  onEditStart,
  platformName,
  modalOpen,
}: AdSetFlowProps) {
  const { isEditing, setIsEditing } = useEditing();
  const { active } = useActive();
  const { campaignFormData, updateCampaign, getActiveCampaign, campaignData } =
    useCampaigns();
  const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({});
  const [hasInteraction, setHasInteraction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoOpen, setAutoOpen] = useState<Record<string, string[]>>({});
  const [collapsedOutlets, setCollapsedOutlets] = useState<
    Record<string, boolean>
  >({});

  // --- Custom Audience Types State (global, in-memory for session, and cross-stage) ---
  const [customAudienceTypes, setCustomAudienceTypes] = useState<string[]>(() => {
    // Try to get from global variable first
    if (globalCustomAudienceTypes.length > 0) {
      return [...globalCustomAudienceTypes];
    }
    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem("customAudienceTypes");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {}
    }
    return [];
  });

  // Keep global reference in sync
  useEffect(() => {
    globalCustomAudienceTypes.length = 0;
    customAudienceTypes.forEach((t) => globalCustomAudienceTypes.push(t));
    if (globalSetCustomAudienceTypes !== setCustomAudienceTypes) {
      globalSetCustomAudienceTypes = setCustomAudienceTypes;
    }
  }, [customAudienceTypes]);

  // Persist custom audience types to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "customAudienceTypes",
        JSON.stringify(customAudienceTypes)
      );
    }
  }, [customAudienceTypes]);

  // Listen for global changes (from other AdSetFlow instances)
  useEffect(() => {
    // Custom event for cross-component update
    function handleCustomAudienceUpdate(e: any) {
      if (Array.isArray(e.detail)) {
        setCustomAudienceTypes(e.detail);
      }
    }
    window.addEventListener("customAudienceTypesUpdated", handleCustomAudienceUpdate);
    return () => {
      window.removeEventListener("customAudienceTypesUpdated", handleCustomAudienceUpdate);
    };
  }, []);

  // Add custom audience type globally and broadcast to all AdSetFlow instances
  const addCustomAudienceType = useCallback((type: string) => {
    setCustomAudienceTypes((prev) => {
      if (!prev.includes(type)) {
        const updated = [...prev, type];
        // Update global variable
        globalCustomAudienceTypes.length = 0;
        updated.forEach((t) => globalCustomAudienceTypes.push(t));
        // Broadcast to all AdSetFlow instances
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("customAudienceTypes", JSON.stringify(updated));
          window.dispatchEvent(
            new CustomEvent("customAudienceTypesUpdated", { detail: updated })
          );
        }
        // If another AdSetFlow is mounted, update its state
        if (globalSetCustomAudienceTypes && globalSetCustomAudienceTypes !== setCustomAudienceTypes) {
          globalSetCustomAudienceTypes(updated);
        }
        return updated;
      }
      return prev;
    });
  }, []);

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {};
    const channelMix = campaignFormData?.channel_mix || [];

    channelMix.forEach((stage: any) => {
      const {
        funnel_stage,
        search_engines,
        display_networks,
        social_media,
        streaming,
        mobile,
        ooh,
        broadcast,
        in_game,
        e_commerce,
        messaging,
        print,
      } = stage;
      if (!platformsByStage[funnel_stage]) platformsByStage[funnel_stage] = [];
      [
        search_engines,
        display_networks,
        social_media,
        streaming,
        mobile,
        ooh,
        broadcast,
        in_game,
        e_commerce,
        messaging,
        print,
      ].forEach((platforms) => {
        if (Array.isArray(platforms)) {
          platforms.forEach((platform: any) => {
            const icon = getPlatformIcon(platform?.platform_name);
            platformsByStage[funnel_stage].push({
              id: Math.floor(Math.random() * 1000000),
              outlet: platform.platform_name,
              icon: icon,
            });
          });
        }
      });
    });
    return platformsByStage;
  }, [campaignFormData, modalOpen]);

  useEffect(() => {
    if (campaignFormData) {
      const data = getPlatformsFromStage();
      setPlatforms(data);

      const autoOpenPlatforms = {};

      for (const stage of campaignFormData.channel_mix) {
        const platformsWithAdsets = [
          ...stage.search_engines,
          ...stage.display_networks,
          ...stage.social_media,
          ...stage.streaming,
          ...stage.ooh,
          ...stage.broadcast,
          ...stage.messaging,
          ...stage.print,
          ...stage.e_commerce,
          ...stage.in_game,
          ...stage.mobile,
        ]
          .filter((p) => p.ad_sets && p.ad_sets.length > 0)
          .map((p) => p.platform_name);

        if (platformsWithAdsets.length > 0) {
          autoOpenPlatforms[stage.funnel_stage] = platformsWithAdsets;
        }
      }

      setAutoOpen(autoOpenPlatforms);
    }
  }, [modalOpen]);

  const handleInteraction = useCallback(() => {
    setHasInteraction(true);
    onInteraction && onInteraction();
  }, [onInteraction]);

  const updateCampaignData = async (data) => {
    const calcPercent = Math.ceil((active / 10) * 100);
    try {
      await updateCampaign({
        ...data,
        progress_percent:
          campaignFormData?.progress_percent > calcPercent
            ? campaignFormData?.progress_percent
            : calcPercent,
      });
      await getActiveCampaign(data);
    } catch (error) {
      throw error;
    }
  };

  const cleanData = campaignData
    ? removeKeysRecursively(campaignData, [
        "id",
        "documentId",
        "createdAt",
        "publishedAt",
        "updatedAt",
      ])
    : {};

  const handleStepThree = async () => {
    await updateCampaignData({
      ...cleanData,
      channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
        "id",
        "isValidated",
        "validatedStages",
      ]),
    })
      .then(() => {
        setIsEditing(false);
        onValidate();
      })
      .catch((err) => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isEditing) {
      onEditStart && onEditStart();
    }
  }, [isEditing]);

  useEffect(() => {
    if (platformName) {
      setIsEditing(true);
    }
  }, []);

  useEffect(() => {
    if (platforms[stageName]) {
      const initialCollapsed: Record<string, boolean> = {};
      platforms[stageName].forEach((outlet) => {
        initialCollapsed[outlet.outlet] = false;
      });
      setCollapsedOutlets(initialCollapsed);
    }
  }, [platforms, stageName]);

  const handleToggleCollapsed = (outletName: string) => {
    setCollapsedOutlets((prev) => ({
      ...prev,
      [outletName]: !prev[outletName],
    }));
  };

  return (
    <CustomAudienceTypesContext.Provider
      value={{
        customAudienceTypes,
        addCustomAudienceType,
      }}
    >
      <div className="w-full space-y-4 p-4">
        {platformName
          ? platforms[stageName]
              ?.filter((outlet) =>
                Array.isArray(platformName)
                  ? platformName.includes(outlet.outlet)
                  : outlet.outlet === platformName
              )
              .map((outlet) => (
                <AdsetSettings
                  key={outlet.id}
                  outlet={outlet}
                  stageName={stageName}
                  onInteraction={handleInteraction}
                  defaultOpen={autoOpen[stageName]?.includes(outlet.outlet)}
                  isCollapsed={collapsedOutlets[outlet.outlet] ?? false}
                  setCollapsed={(collapsed) => handleToggleCollapsed(outlet.outlet)}
                />
              ))
          : platforms[stageName]?.map((outlet) => (
              <AdsetSettings
                key={outlet.id}
                outlet={outlet}
                stageName={stageName}
                onInteraction={handleInteraction}
                defaultOpen={autoOpen[stageName]?.includes(outlet.outlet)}
                isCollapsed={collapsedOutlets[outlet.outlet] ?? false}
                setCollapsed={(collapsed) => handleToggleCollapsed(outlet.outlet)}
              />
            ))}
      </div>
    </CustomAudienceTypesContext.Provider>
  );
});

export default AdSetFlow;