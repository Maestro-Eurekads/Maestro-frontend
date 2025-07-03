"use client";
import { useEffect, useState } from "react";
import FunnelStage from "../../app/creation/components/SelectChannelMix";
import { funnelStages, getPlatformIcon, platformStyles } from "../data";
import Image from "next/image";
import up from "../../public/arrow-down.svg";
import down2 from "../../public/arrow-down-2.svg";
import checkmark from "../../public/mingcute_check-fill.svg";
import { useCampaigns } from "app/utils/CampaignsContext";
import customicon from "../../public/social/customicon.png";
import Modal from "./Modal";
import AdSetsFlow from "../../app/creation/components/common/AdSetsFlow";
import SelectChannelMix from "../../app/creation/components/SelectChannelMix";
import { removeKeysRecursively } from "utils/removeID";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const AddNewChennelsModel = ({ isOpen, setIsOpen, selectedStage }) => {
  const [openItems, setOpenItems] = useState({ Awareness: true });
  const [selected, setSelected] = useState({});
  const [validatedStages, setValidatedStages] = useState({});
  const { campaignFormData, setCampaignFormData, setCopy, cId, campaignData, jwt, getActiveCampaign } =
    useCampaigns();
  const [openChannelTypes, setOpenChannelTypes] = useState({});
  const [showMoreMap, setShowMoreMap] = useState({});
  const [stageStatuses, setStageStatuses] = useState({});
  const ITEMS_TO_SHOW = 6;
  const [newlySelected, setNewlySelected] = useState([]);
  const [openAdset, setOpenAdset] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [id, setId] = useState(null);

  const sendUpdatedDataToAPI = async (updatedData) => {
    const { media_plan_details, user, ...rest } = campaignData
    try {
      setDeleting(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        {
          data: {
            ...removeKeysRecursively(rest, [
              "id",
              "documentId",
              "createdAt",
              "publishedAt",
              "updatedAt",
              "_aggregated",
            ]),
            channel_mix: removeKeysRecursively(updatedData?.channel_mix, [
              "id",
              "isValidated",
              "validatedStages",
              "documentId",
              ,
              "_aggregated",
            ]),
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      await getActiveCampaign()
      // //console.log("Campaign data updated successfully", response.data);
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setDeleting(false);
      setId(null);
    }
  };

  useEffect(() => {
    if (
      campaignFormData?.channel_mix?.length > 0 &&
      campaignData?.channel_mix?.length > 0
    ) {
      setNewlySelected(() => {
        const newlySelectedPlatforms = [];

        campaignFormData?.channel_mix?.forEach((formDataItem) => {
          const campaignDataItem = campaignData.channel_mix?.find(
            (item) => item.funnel_stage === formDataItem.funnel_stage
          );

          if (campaignDataItem) {
            Object.keys(formDataItem).forEach((categoryKey) => {
              // //console.log("🚀 ~ Object.keys ~ categoryKey:", categoryKey);
              if (
                categoryKey !== "funnel_stage" &&
                categoryKey !== "id" &&
                categoryKey !== "funnel_stage_timeline_start_date" &&
                categoryKey !== "funnel_stage_timeline_end_date" &&
                categoryKey !== "stage_budget"
              ) {
                const formDataPlatforms =
                  formDataItem[categoryKey]?.map(
                    (platform) => platform.platform_name
                  ) || [];
                const campaignDataPlatforms =
                  campaignDataItem[categoryKey]?.map(
                    (platform) => platform.platform_name
                  ) || [];

                formDataPlatforms.forEach((platformName) => {
                  // if (campaignDataPlatforms.includes(platformName)) {
                  newlySelectedPlatforms.push({
                    stageName: formDataItem.funnel_stage,
                    category: categoryKey,
                    platformName,
                  });
                  // }
                });
              }
            });
          }
        });

        return newlySelectedPlatforms;
      });
    }
  }, [campaignFormData?.channel_mix, campaignData?.channel_mix, openAdset]);

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  // const togglePlatform = async (stageName, category, platformName, type) => {
  //   setSelected((prevSelected) => {
  //     const stageSelection = prevSelected[stageName] || {};
  //     const categorySelection = stageSelection[category] || [];
  //     const isAlreadySelected = categorySelection.includes(platformName);

  //     const newCategorySelection = isAlreadySelected
  //       ? categorySelection.filter((p) => p !== platformName)
  //       : [...categorySelection, platformName];

  //     const updatedStageSelection = {
  //       ...stageSelection,
  //       [category]: newCategorySelection,
  //     };

  //     const updatedSelected = {
  //       ...prevSelected,
  //       [stageName]: updatedStageSelection,
  //     };

  //     // Compute new stage status immediately
  //     const hasSelections = Object.values(updatedStageSelection).some(
  //       (arr) => Array.isArray(arr) && arr.length > 0
  //     );
  //     setStageStatuses((prev) => ({
  //       ...prev,
  //       [stageName]: hasSelections ? "In progress" : "Not started",
  //     }));

  //     return updatedSelected;
  //   });

  //   // const updatedFormData = await setCampaignFormData((prevFormData) => {
  //   //   const categoryKey = category.toLowerCase().replaceAll(" ", "_");
  //   //   const stageSelection = selected[stageName] || {};
  //   //   const categorySelection = stageSelection[category] || [];
  //   //   const isAlreadySelected = categorySelection.includes(platformName);
  //   //   const newCategorySelection = isAlreadySelected
  //   //     ? categorySelection.filter((p) => p !== platformName)
  //   //     : [...categorySelection, platformName];
  //   //   const platformObjects = newCategorySelection.map((name) => {
  //   //     const existingPlatform = prevFormData.channel_mix
  //   //       ?.find((item) => item.funnel_stage === stageName)
  //   //       ?.[categoryKey]?.find((platform) => platform.platform_name === name);

  //   //     return existingPlatform || { platform_name: name };
  //   //   });

  //   //   const existingChannelMixIndex = prevFormData.channel_mix?.findIndex(
  //   //     (item) => item.funnel_stage === stageName
  //   //   );

  //   //   let updatedChannelMix = [...(prevFormData.channel_mix || [])];

  //   //   if (existingChannelMixIndex >= 0) {
  //   //     updatedChannelMix[existingChannelMixIndex] = {
  //   //       ...updatedChannelMix[existingChannelMixIndex],
  //   //       [categoryKey]: platformObjects,
  //   //     };
  //   //   } else {
  //   //     updatedChannelMix.push({
  //   //       funnel_stage: stageName,
  //   //       [categoryKey]: platformObjects,
  //   //     });
  //   //   }

  //   //   return {
  //   //     ...prevFormData,
  //   //     channel_mix: updatedChannelMix,
  //   //   };
  //   // });

  //   // Track newly added platforms
  //   setNewlySelected((prevNewlySelected) => {
  //     const originalPlatforms =
  //       campaignData.channel_mix
  //         ?.find((item) => item.funnel_stage === stageName)
  //         ?.[category.toLowerCase().replaceAll(" ", "_")]?.map(
  //           (platform) => platform.platform_name
  //         ) || [];

  //     const isNewlyAdded = !originalPlatforms.includes(platformName);

  //     if (isNewlyAdded) {
  //       return [...prevNewlySelected, { stageName, category, platformName }];
  //     }

  //     return prevNewlySelected.filter(
  //       (item) =>
  //         !(
  //           item.stageName === stageName &&
  //           item.category === category &&
  //           item.platformName === platformName
  //         )
  //     );
  //   });

  //   // Sync with server
  // };
  const toggleChannelType = (e, stageName, type) => {
    e.stopPropagation();
    setOpenChannelTypes((prev) => ({
      ...prev,
      [`${stageName}-${type}`]: !prev[`${stageName}-${type}`],
    }));
  };

  const isStageValid = (stageName) => {
    const stageSelections = selected[stageName] || {};
    const hasSocialMedia = stageSelections["Social media"]?.length > 0;
    const hasDisplayNetworks = stageSelections["Display networks"]?.length > 0;
    const hasSearchEngines = stageSelections["Search engines"]?.length > 0;

    return hasSocialMedia || hasDisplayNetworks || hasSearchEngines;
  };

  const toggleShowMore = (channelKey) => {
    setShowMoreMap((prev) => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }));
  };

  const handleValidate = (stageName) => {
    if (isStageValid(stageName)) {
      setValidatedStages((prev) => ({
        ...prev,
        [stageName]: true,
      }));
    }
  };

  // const handlePlatformClick = (e, stageName, category, platformName, type) => {
  //   e.stopPropagation();
  //   togglePlatform(stageName, category, platformName, type);
  // };

  return (
    <div className="relative z-[70]">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full z-[70]">
          <div className="flex flex-col items-start p-6 gap-6 bg-white rounded-[10px] w-[65%]">
            <button className="self-end" onClick={() => setIsOpen(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                  stroke="#717680"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <SelectChannelMix selectedStage={selectedStage} />
            <div className="w-fit ml-auto">
              <button
                className="w-fit bg-blue-500 text-white rounded-md p-2 text-[16px]"
                onClick={() => setOpenAdset(true)}
              >
                Configure Adset and Audiences
              </button>
            </div>
          </div>
        </div>
      )}
      {openAdset &&
        <Modal isOpen={(selectedStage && openAdset) ? true : false} onClose={() => setOpenAdset(false)}>
          <div className="bg-white w-[950px] p-2 rounded-lg max-h-[600px] overflow-y-scroll">
            <button
              className="flex justify-end w-fit ml-auto"
              onClick={() => setOpenAdset(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                  stroke="#717680"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <AdSetsFlow
              stageName={selectedStage}
              // onEditStart={() => resetInteraction(stage.name)}
              platformName={newlySelected?.map((nn) => nn?.platformName)}
              modalOpen={openAdset}
            />
            <div className="w-fit ml-auto">
              <button
                className="flex justify-end w-fit ml-auto"
                onClick={() => setOpenAdset(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <path
                    d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                    stroke="#717680"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <AdSetsFlow
                stageName={selectedStage}
                // onEditStart={() => resetInteraction(stage.name)}
                platformName={newlySelected?.map((nn) => nn?.platformName)}
                modalOpen={openAdset}
              />
              <div className="w-fit ml-auto">
                <button
                  className="bg-blue-500 text-white rounded-md p-2"
                  onClick={async () => {
                    await sendUpdatedDataToAPI(campaignFormData)
                    await setOpenAdset(false);
                    await setIsOpen(false);
                  }}
                  disabled={deleting}
                >
                  {deleting ? <FaSpinner className="animate-spin" /> : "Confirm Changes"}
                </button>
              </div>
            </div>
          </div>
          </div>
        </Modal>
      }
    </div>
  );
};

export default AddNewChennelsModel;
