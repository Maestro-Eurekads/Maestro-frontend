"use client";
import React, { useState, useEffect } from "react";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useUserPrivileges } from "utils/userPrivileges";
import { toast } from "sonner";
import { useActive } from "app/utils/ActiveContext";
import axios from "axios";
import { updateUsersWithCampaign } from "app/homepage/functions/clients";
import {
  extractObjectives,
  getFilteredMetrics,
} from "app/creation/components/EstablishedGoals/table-view/data-processor";
import { removeKeysRecursively } from "utils/removeID";
import { SVGLoader } from "./SVGLoader";
import { useAppDispatch } from "store/useStore";
import { useRouter } from "next/navigation";
import { useComments } from "app/utils/CommentProvider";
import { reset } from "features/Client/clientSlice";

interface BackConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (url?: string) => void; // optional navigation handler
}

const BackConfirmModal: React.FC<BackConfirmModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { isClient, loggedInUser } = useUserPrivileges();
  const [loading, setLoading] = useState(false);
  const {
    change,
    setChange,
    showModal,
    setShowModal,
    setActive,
    setSubStep,
    active,
  } = useActive();
  const { setClose, close, setViewcommentsId, setOpportunities } =
    useComments();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const clearAllCampaignData = () => {
    if (typeof window === "undefined") return;
    try {
      // Clear sessionStorage for channel state
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("channelLevelAudienceState_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => sessionStorage.removeItem(key));

      // Clear window channel state
      if ((window as any).channelLevelAudienceState) {
        Object.keys((window as any).channelLevelAudienceState).forEach(
          (stageName) => {
            delete (window as any).channelLevelAudienceState[stageName];
          }
        );
      }

      // Clear all localStorage items related to campaign creation
      const localStorageKeysToRemove = [
        "campaignFormData",
        "filteredClient",
        "selectedOptions",
        "funnelStageStatuses",
        "seenFunnelStages",
        "formatSelectionOpenTabs",
        "step1_validated",
        "active",
        "change",
        "comments",
        "subStep",
        "verifybeforeMove",
      ];

      // Remove campaign-specific localStorage items
      localStorageKeysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Remove quantities-related localStorage items (format selection)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("quantities_")) {
          localStorage.removeItem(key);
        }
      });

      // Remove modal dismissal keys
      Object.keys(localStorage).forEach((key) => {
        if (
          key.includes("modal_dismissed") ||
          key.includes("goalLevelModalDismissed")
        ) {
          localStorage.removeItem(key);
        }
      });

      // Remove format error trigger keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("triggerFormatError_")) {
          localStorage.removeItem(key);
        }
      });

      // Remove channel mix related localStorage items
      Object.keys(localStorage).forEach((key) => {
        if (
          key.includes("openItems") ||
          key.includes("selected") ||
          key.includes("stageStatuses") ||
          key.includes("showMoreMap") ||
          key.includes("openChannelTypes")
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing campaign data:", error);
    }
  };

  const {
    createCampaign,
    updateCampaign,
    campaignData,
    campaignFormData,
    cId,
    getActiveCampaign,
    setCampaignData,
    setCampaignFormData,
    copy,
    isEditingBuyingObjective,
    selectedOption,
    currencySign,
    jwt,
    agencyId,
  } = useCampaigns();

  // Enhanced change detection - monitor form data changes and step changes
  useEffect(() => {
    if (campaignFormData && Object.keys(campaignFormData).length > 0) {
      // Check if there are actual changes in the form data
      const hasChanges = checkForFormChanges();

      // Update the global change state if there are form changes
      if (hasChanges !== change) {
        setChange(hasChanges);
      }
    }
  }, [campaignFormData, active, change, setChange]);

  // Function to check for actual form changes
  const checkForFormChanges = () => {
    if (!campaignFormData || Object.keys(campaignFormData).length === 0) {
      return false;
    }

    // Check for key form fields that indicate changes
    const keyFields = [
      "media_plan",
      "budget_details_currency",
      "funnel_stages",
      "custom_funnels",
      "channel_mix",
      "goal_level",
      "ad_sets_granularity",
      "campaign_timeline_start_date",
      "campaign_timeline_end_date",
      "internal_approver",
      "client_approver",
    ];

    // Check if any key fields have been modified
    for (const field of keyFields) {
      if (
        campaignFormData[field] && Array.isArray(campaignFormData[field])
          ? campaignFormData[field].length > 0
          : campaignFormData[field]
      ) {
        return true;
      }
    }

    // Check for specific step-based changes
    if (active > 0) {
      // If user is on any step beyond step 0, there are likely unsaved changes
      return true;
    }

    // Check for any non-empty form data that indicates user interaction
    const hasAnyFormData = Object.values(campaignFormData).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === "object" && value !== null) {
        return Object.keys(value).length > 0;
      }
      return value && value !== "";
    });

    if (hasAnyFormData) {
      return true;
    }

    return false;
  };

  // Monitor step changes to detect when user moves between steps
  useEffect(() => {
    if (active > 0) {
      // If user is on any step beyond step 0, there are likely unsaved changes
      setChange(true);
    }
  }, [active, setChange]);

  // Monitor form data changes more comprehensively
  useEffect(() => {
    if (campaignFormData && Object.keys(campaignFormData).length > 0) {
      // If we have form data and we're not on step 0, there are likely changes
      if (active > 0) {
        setChange(true);
      }
    }
  }, [campaignFormData, active, setChange]);

  const handleSaveAllSteps = async () => {
    // Use the same validation logic as Bottom component handleContinue
    // Step 0 validation (Setup Screen)
    if (!campaignFormData?.media_plan) {
      toast.error("Media Plan name is required");
      return;
    }
    if (!campaignFormData?.budget_details_currency?.id) {
      toast.error("Currency is required");
      return;
    }
    setLoading(true);

    try {
      const cleanedFormData = {
        ...campaignFormData,
        internal_approver: campaignFormData?.internal_approver || [],
        client_approver: campaignFormData?.client_approver || [],
        approved_by: campaignFormData?.approved_by || [],
      };

      // Validate and format dates
      const validateAndFormatDates = (data) => {
        const isValidDate = (d) => {
          if (!d || d === "" || d === null || d === undefined) {
            return null;
          }
          // Check if it's already in yyyy-MM-dd format
          if (
            typeof d === "string" &&
            d.length === 10 &&
            /^\d{4}-\d{2}-\d{2}$/.test(d)
          ) {
            return d;
          }
          // Try to parse and format the date
          try {
            const date = new Date(d);
            if (isNaN(date.getTime())) {
              return null;
            }
            return date.toISOString().split("T")[0]; // Convert to yyyy-MM-dd format
          } catch (error) {
            return null;
          }
        };

        // Deep clone to avoid mutating original data
        const validatedData = JSON.parse(JSON.stringify(data));

        // Validate main campaign dates
        validatedData.campaign_timeline_start_date = isValidDate(
          data?.campaign_timeline_start_date
        );
        validatedData.campaign_timeline_end_date = isValidDate(
          data?.campaign_timeline_end_date
        );

        // Validate nested dates in channel_mix
        if (Array.isArray(validatedData.channel_mix)) {
          validatedData.channel_mix = validatedData.channel_mix.map((stage) => {
            const validatedStage = { ...stage };

            // Validate stage timeline dates
            validatedStage.funnel_stage_timeline_start_date = isValidDate(
              stage?.funnel_stage_timeline_start_date
            );
            validatedStage.funnel_stage_timeline_end_date = isValidDate(
              stage?.funnel_stage_timeline_end_date
            );

            // Validate dates in all media types
            const mediaTypes = [
              "social_media",
              "display_networks",
              "search_engines",
              "streaming",
              "ooh",
              "broadcast",
              "messaging",
              "print",
              "e_commerce",
              "in_game",
              "mobile",
            ];

            mediaTypes.forEach((mediaType) => {
              if (Array.isArray(validatedStage[mediaType])) {
                validatedStage[mediaType] = validatedStage[mediaType].map(
                  (platform) => ({
                    ...platform,
                    campaign_start_date: isValidDate(
                      platform?.campaign_start_date
                    ),
                    campaign_end_date: isValidDate(platform?.campaign_end_date),
                  })
                );
              }
            });

            return validatedStage;
          });
        }

        return validatedData;
      };

      // Apply date validation and formatting
      const validatedFormData = validateAndFormatDates(cleanedFormData);

      const objectives = await extractObjectives(validatedFormData);
      const selectedMetrics = await getFilteredMetrics(objectives);

      const channelMixCleaned = removeKeysRecursively(
        validatedFormData?.channel_mix,
        [
          "id",
          "isValidated",
          "formatValidated",
          "validatedStages",
          "documentId",
          "_aggregated",
        ]
      );

      const campaignBudgetCleaned = removeKeysRecursively(
        validatedFormData?.campaign_budget,
        ["id"]
      );

      const calcPercent = Math.ceil((active / 10) * 100);

      const payload = {
        data: {
          campaign_builder: loggedInUser?.id,
          client: cleanedFormData?.client_selection?.id,
          client_selection: {
            client: cleanedFormData?.client_selection?.value,
            level_1: cleanedFormData?.level_1,
          },
          media_plan_details: {
            plan_name: cleanedFormData?.media_plan,
            internal_approver: cleanedFormData.internal_approver.map(
              (item: any) => Number(item.id)
            ),
            client_approver: cleanedFormData.client_approver.map((item: any) =>
              Number(item.id)
            ),
            approved_by: cleanedFormData.approved_by.map((item: any) =>
              Number(item.id)
            ),
          },
          budget_details: {
            currency: cleanedFormData?.budget_details_currency?.id || "EUR",
            value: cleanedFormData?.country_details?.id,
          },
          campaign_budget: {
            ...campaignBudgetCleaned,
            currency: cleanedFormData?.budget_details_currency?.id || "EUR",
          },
          funnel_stages: cleanedFormData?.funnel_stages,
          channel_mix: channelMixCleaned,
          custom_funnels: cleanedFormData?.custom_funnels,
          funnel_type: cleanedFormData?.funnel_type,
          table_headers: objectives || {},
          selected_metrics: selectedMetrics || {},
          goal_level: cleanedFormData?.goal_level,
          ad_sets_granularity:
            cleanedFormData?.ad_sets_granularity ||
            cleanedFormData?.granularity,
          campaign_timeline_start_date:
            cleanedFormData?.campaign_timeline_start_date,
          campaign_timeline_end_date:
            cleanedFormData?.campaign_timeline_end_date,
          agency_profile: agencyId,

          progress_percent:
            campaignFormData?.progress_percent > calcPercent
              ? campaignFormData?.progress_percent
              : calcPercent,
          campaign_version: cleanedFormData?.campaign_version || "V1",
        },
      };

      const config = {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      };

      if (campaignFormData.cId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignFormData.cId}`,
          payload,
          config
        );
        toast.success("Campaign updated successfully!");
        setChange(false);
        setShowModal(false);
        dispatch(reset());
        setOpportunities([]);
        setViewcommentsId("");
        setCampaignData(null);
        clearAllCampaignData?.();
        router.push("/");
        // Use onNavigate if provided, otherwise navigate to home
        // if (onNavigate) {
        // 	onNavigate();
        // } else {
        // 	router.push("/");
        // }
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`,
          payload,
          config
        );

        const url = new URL(window.location.href);
        url.searchParams.set(
          "campaignId",
          `${response?.data?.data.documentId}`
        );
        window.history.pushState({}, "", url.toString());

        await updateUsersWithCampaign(
          [
            ...(Array.isArray(loggedInUser?.id)
              ? loggedInUser?.id
              : [loggedInUser?.id]),
            ...cleanedFormData.internal_approver.map((item: any) =>
              String(item.id)
            ),
            ...cleanedFormData.client_approver.map((item: any) =>
              String(item.id)
            ),
          ],
          response?.data?.data?.id,
          jwt
        );

        await getActiveCampaign(response?.data?.data.documentId);
        toast.success("Campaign created successfully!");
        setChange(false);
        setShowModal(false);
        dispatch(reset());
        setOpportunities([]);
        setViewcommentsId("");
        setCampaignData(null);
        clearAllCampaignData?.();
        router.push("/");
        // Use onNavigate if provided, otherwise navigate to home
        // if (onNavigate) {
        // 	router.push("/");
        // } else {
        // 	router.push("/");
        // }
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        window.dispatchEvent(new Event("unauthorizedEvent"));
      }
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      setShowModal(false);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  // Enhanced beforeunload to prevent default refresh when there are changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (change) {
        event.preventDefault();
        event.returnValue = "You have unsaved changes. Save before leaving?";
        // The string is ignored in most browsers, but the modal will appear
      }
    };

    if (change) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [change]);

  // Handle "No" button to allow navigation without saving
  const handleNoClick = () => {
    // Clear all campaign data comprehensively
    clearAllCampaignData();

    // Reset all context state
    setCampaignFormData({});
    setCampaignData(null);
    setChange(false);
    setShowModal(false);

    // Reset Redux state
    dispatch(reset());
    setOpportunities([]);
    setViewcommentsId("");

    // Reset active state
    setActive(0);
    setSubStep(0);

    // Hardcode navigation to dashboard
    router.push("/");

    // Fallback navigation in case router.push fails
    setTimeout(() => {
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }, 100);
  };

  // Handle staying on the current page
  const handleStayOnPage = () => {
    setShowModal(false); // Close modal
    onClose(); // Call original onClose
  };

  // Handle clicking outside the modal to just close it
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
      // Don't call onClose() to avoid navigation
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleOutsideClick}>
      <div
        className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
          Unsaved Changes
        </h2>
        <p className="text-sm text-gray-600 mb-1 text-center">
          You have unsaved changes that will be lost if you leave this page.
        </p>
        <p className="text-sm text-gray-600 mb-8 text-center">
          What would you like to do?
        </p>
        <div className="flex flex-col gap-3">
          <button
            disabled={loading}
            className="btn_model_active w-full"
            onClick={handleSaveAllSteps}>
            {loading ? (
              <SVGLoader width="30px" height="30px" color="#fff" />
            ) : (
              "Save & Continue"
            )}
          </button>
          <button
            disabled={loading}
            className="btn_model_outline w-full"
            onClick={handleNoClick}>
            Leave Without Saving
          </button>
          <button
            disabled={loading}
            className="btn_model_outline w-full"
            onClick={handleStayOnPage}>
            Stay on This Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackConfirmModal;
