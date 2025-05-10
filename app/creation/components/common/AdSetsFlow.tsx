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

// Import platform icons
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
  modalOpen?:boolean
}

interface AdSetData {
  id?: number;
  name: string;
  audience_type: string;
  size?: string;
  extra_audiences?: {
    audience_type: string;
    name?: string;
    size?: string;
  }[];
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
  onInteraction: () => void;
  adsets: AdSetType[];
  extra_audiences?: {
    audience_type: string;
    name?: string;
    size?: string;
  }[];

  onUpdateExtraAudiences: (
    audiences: {
      audience_type: string;
      name?: string;
      size?: string;
    }[]
  ) => void;
}) {
  const [audience, setAudience] = useState<string>(audienceType || "");
  const [name, setName] = useState<string>(adSetName || "");
  const [size, setSize] = useState<string>(adSetSize || "");
  const [extraAudience, setExtraAudience] = useState<
    { audience_type: string; name?: string; size?: string }[]
  >(extra_audiences || []);

  useEffect(() => {
    if (audienceType !== undefined) setAudience(audienceType);
    if (adSetName !== undefined) setName(adSetName);
    if (adSetSize !== undefined) setSize(adSetSize);
  }, [audienceType, adSetName, adSetSize]);

  const updateExtraAudienceMap = (
    updatedList: { audience_type: string; name?: string; size?: string }[]
  ) => {
    setExtraAudience(updatedList);
    const cleaned = updatedList.filter((item) => item.audience_type?.trim());
    onUpdateExtraAudiences(cleaned);
    onInteraction(); // notify form system
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
    console.log(selected);
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
      const newSize = e.target.value;
      setSize(newSize);
      onUpdate(adset.id, { size: newSize });
      onInteraction();
    },
    [adset.id, onUpdate, onInteraction]
  );

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
          setExtraAudience={setExtraAudience}
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
                  value={audi.size || ""}
                  onChange={(e) => {
                    const updated = [...extraAudience];
                    updated[index].size = e.target.value;
                    updateExtraAudienceMap(updated);
                  }}
                  disabled={!isEditing}
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[100px]"
                />

                <button
                  disabled={!isEditing}
                  onClick={() => handleDeleteExtraAudience(index)}
                  className={`text-sm font-bold ${
                    !isEditing ? "cursor-not-allowed" : ""
                  }`}
                >
                  <MdDelete color="red" size={18} />
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
                const updated = [...extraAudience, { audience_type: "" }];
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
        value={size}
        onChange={handleSizeChange}
        disabled={!isEditing}
        className={`text-black text-sm font-semibold flex gap-4 items-center border border-[#D0D5DD] py-4 px-2 rounded-[10px] h-[52px] w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isEditing ? "cursor-not-allowed" : ""
        }`}
      />
      <button
        disabled={!isEditing}
        onClick={() => onDelete(adset.id)}
        className={`flex items-center gap-2 rounded-full px-4 py-2 bg-[#FF5955] text-white text-sm font-bold ${
          !isEditing ? "cursor-not-allowed" : ""
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
    setExtraAudience,
  }: {
    onSelect: (option: string) => void;
    initialValue?: string;
    dropdownId: number | string;
    setExtraAudience?: any;
  }) {
    const { openDropdownId, setOpenDropdownId } = useContext(DropdownContext);
    const [selected, setSelected] = useState<string>(initialValue || "");
    const isOpen = openDropdownId === dropdownId;

    useEffect(() => {
      if (initialValue) setSelected(initialValue);
    }, [initialValue]);

    const options = [
      "Lookalike audience",
      "Retargeting audience",
      "Broad audience",
      "Behavioral audience",
    ];

    const handleSelect = useCallback(
      (option: string) => {
        setSelected(option);
        setOpenDropdownId(null);
        onSelect(option);
      },
      [onSelect, setOpenDropdownId]
    );

    const toggleOpen = useCallback(() => {
      setOpenDropdownId(isOpen ? null : dropdownId);
    }, [isOpen, setOpenDropdownId, dropdownId]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (isOpen && !target.closest(`[data-dropdown-id="${dropdownId}"]`)) {
          setOpenDropdownId(null);
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
            <ul className="absolute mt-1 top-full z-50 w-full bg-white border-2 border-[#0000001A] rounded-lg shadow-lg overflow-hidden">
              {options.map((option, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(option)}
                  className="p-4 cursor-pointer text-[#656565] text-sm text-center whitespace-nowrap hover:bg-gray-100"
                >
                  {option}
                </li>
              ))}
            </ul>
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
}: {
  outlet: OutletType;
  stageName: string;
  onInteraction: () => void;
  defaultOpen?: boolean;
}) {
  const { isEditing } = useEditing();
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [adsets, setAdSets] = useState<AdSetType[]>([]);
  const [adSetDataMap, setAdSetDataMap] = useState<Record<number, AdSetData>>(
    {}
  );

  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(
    null
  );
  const initialized = useRef(false);

  useEffect(() => {
    if (!campaignFormData?.channel_mix) return;
    if (initialized.current) return;
    initialized.current = true;

    const result = findPlatform(
      campaignFormData.channel_mix,
      stageName,
      outlet.outlet
    );

    const platform = result?.platform;

    // 🟢 Open this platform (outlet) by default if requested
    if (defaultOpen && !selectedPlatforms.includes(outlet.outlet)) {
      setSelectedPlatforms((prev) => [...prev, outlet.outlet]);
    }

    if (!platform) {
      const newAdSetId = Date.now();
      setAdSets([{ id: newAdSetId, addsetNumber: 1 }]);
      setAdSetDataMap({
        [newAdSetId]: { name: "", audience_type: "", size: "" },
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
          extra_audiences: adSet?.extra_audiences,
        };
      });
      setAdSets(newAdSets);
      setAdSetDataMap(newAdSetDataMap);
    } else {
      const newAdSetId = Date.now();
      setAdSets([{ id: newAdSetId, addsetNumber: 1 }]);
      setAdSetDataMap({
        [newAdSetId]: { name: "", audience_type: "", size: "" },
      });
    }
  }, [
    // campaignFormData,
    stageName,
    outlet.outlet,
    selectedPlatforms,
    defaultOpen,
  ]);

  const addNewAddset = useCallback(() => {
    // Check if we've reached the maximum limit of 10 ad sets
    if (adsets.length >= 10) {
      // You could add a toast notification here if you have a toast system
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
      [newAdSetId]: { name: "", audience_type: "", size: "" },
    }));
    onInteraction &&onInteraction();
  }, [onInteraction &&onInteraction, adsets.length]);

  const deleteAdSet = useCallback((id: number) => {
    setAdSets((prev) => {
      const newAdSets = prev.filter((adset) => adset.id !== id);
      if (newAdSets.length === 0) {
        setSelectedPlatforms([]);
        setAdSetDataMap({});
        initialized.current = false;
      }
      return newAdSets;
    });
    setAdSetDataMap((prev) => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });
  }, []);

  const updateAdSetData = useCallback(
    (id: number, data: Partial<AdSetData>) => {
      setAdSetDataMap((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...data },
      }));
      onInteraction && onInteraction();
    },
    [onInteraction && onInteraction]
  );

  const saveChangesToCampaign = useCallback(() => {
    console.log("hrere");
    if (!campaignFormData?.channel_mix) return;
    const adSetsToSave = adsets
      .map((adset) => {
        const data = adSetDataMap[adset.id] || { name: "", audience_type: "" };
        return {
          id: adset.id,
          name: data.name,
          audience_type: data.audience_type,
          size: data.size,
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
  }, [
    adsets,
    adSetDataMap,
    campaignFormData,
    stageName,
    outlet.outlet,
    setCampaignFormData,
  ]);

  useEffect(() => {
    if (isEditing && selectedPlatforms.includes(outlet.outlet)) {
      if (!campaignFormData?.channel_mix) return;

      const adSetsToSave = adsets
        .map((adset) => {
          const data = adSetDataMap[adset.id] || {
            name: "",
            audience_type: "",
          };
          return {
            id: adset.id,
            name: data.name,
            audience_type: data.audience_type,
            size: data.size,
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

  if (!selectedPlatforms.includes(outlet.outlet)) {
    return (
      <NonFacebookOutlet
        outlet={outlet}
        setSelected={setSelectedPlatforms}
        onInteraction={onInteraction}
      />
    );
  }

  const adsetAmount = adsets.length;
  const buttonPositionClass = `top-[${adsets.length * 70}px]`;
  const linePositionClass =
    adsetAmount === 1
      ? "top-1/2 rounded-tl-[10px] border-t-2"
      : adsetAmount === 2
      ? "bottom-1/2 rounded-bl-[10px] border-b-2"
      : "";

  return (
    <div className="flex items-center gap-8 w-full max-w-[1024px]">
      <div className="relative">
        <button className="relative min-w-[150px] max-w-[300px] w-fit z-20 flex gap-4 justify-between cursor-pointer items-center bg-[#F9FAFB] border border-[#0000001A] border-solid py-4 px-4 rounded-[10px]">
          <Image
            src={outlet.icon || "/placeholder.svg"}
            alt={outlet.outlet}
            className="w-[22px] h-[22px]"
          />
          <span className="text-[#061237] font-medium">{outlet.outlet}</span>
          <FaAngleRight />
        </button>
        {/* <hr className="border border-[#0000001A] w-[100px] absolute bottom-1/2 translate-y-1/2 -right-0 translate-x-3/4" /> */}
      </div>
      <DropdownContext.Provider value={{ openDropdownId, setOpenDropdownId }}>
        <div
          className="relative w-full"
          style={{ minHeight: `${Math.max(194, (adsets.length + 1) * 80)}px` }}
        >
          {adsets.length > 0 && (
            <>
              {/* Position the "New ad set" button at the top, before any ad sets */}
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

              {/* Position ad sets with proper spacing, starting below the "New ad set" button */}
              {adsets.map((adset, index) => {
                const adSetData = adSetDataMap[adset.id] || {
                  name: "",
                  audience_type: "",
                  size: "",
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
                      extra_audiences={
                        (adSetData.extra_audiences as {
                          audience_type: string;
                          name?: string;
                          size?: string;
                        }[]) || []
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
    </div>
  );
});

// Main AdSetFlow Component
const AdSetFlow = memo(function AdSetFlow({
  stageName,
  onInteraction,
  onValidate,
  isValidateDisabled,
  onEditStart,
  platformName,
  modalOpen
}: AdSetFlowProps) {
  const { isEditing, setIsEditing } = useEditing();
  const { active } = useActive();
  const { campaignFormData, updateCampaign, getActiveCampaign, campaignData } =
    useCampaigns();
  const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({});
  const [hasInteraction, setHasInteraction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoOpen, setAutoOpen] = useState<Record<string, string[]>>({});

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
  }, [campaignFormData, modalOpen && modalOpen]);

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

      setAutoOpen(autoOpenPlatforms); // 👈 create a new state for this
    }
  }, [modalOpen && modalOpen]);

  const handleInteraction = useCallback(() => {
    setHasInteraction(true);
    onInteraction &&onInteraction();
  }, [onInteraction]);

  const updateCampaignData = async (data) => {
    const calcPercent = Math.ceil((active / 10) * 100);
    try {
      console.log("herer", data);
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
      .catch((err) => {
        console.log(err);
      })
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

  return (
    <div className="w-full space-y-4 p-4">
    {platformName
      ? platforms[stageName]
          ?.filter((outlet) =>
            Array.isArray(platformName) ? platformName.includes(outlet.outlet) : outlet.outlet === platformName,
          )
          .map((outlet) => (
            <AdsetSettings
              key={outlet.id}
              outlet={outlet}
              stageName={stageName}
              onInteraction={handleInteraction}
              defaultOpen={autoOpen[stageName]?.includes(outlet.outlet)}
            />
          ))
      : platforms[stageName]?.map((outlet) => (
          <AdsetSettings
            key={outlet.id}
            outlet={outlet}
            stageName={stageName}
            onInteraction={handleInteraction}
            defaultOpen={autoOpen[stageName]?.includes(outlet.outlet)}
          />
        ))}
  </div>
  );
});

export default AdSetFlow;
