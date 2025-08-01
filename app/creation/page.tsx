"use client";
import React, { useCallback, useEffect } from "react";
import PlanCampaignSchedule from "./components/PlanCampaignSchedule";
// import DefineCampaignObjective from "./components/DefineCampaignObjective";
import MapFunnelStages from "./components/MapFunnelStages";
import SelectChannelMix from "./components/SelectChannelMix";
import { useActive } from "../utils/ActiveContext";
import PlanCampaignScheduleSubStepComponent from "./components/PlanCampaignScheduleSubStepComponent";
import SetBuyObjectivesAndTypes from "./components/SetBuyObjectivesAndTypes";
import { SetupScreen } from "./components/SetupScreen";
import { EstablishedGoals } from "./components/EstablishedGoals";
// import SetBuyObjectivesAndTypesSubStep from "./components/SetBuyObjectivesAndTypesSubStep";
import OverviewofyourCampaign from "./components/OverviewofyourCampaign";
import CampaignBudget from "./components/CampaignBudget";
import ConfigureAdSetsAndBudget from "./components/ ConfigureadSetsAndbudget";
import DefineAdSet from "./components/DefineAdSet";
import { FormatSelection } from "./components/FormatSelection";
// import FeeSelectionStep from "./components/FeeSelectionStep";
// import { useComments } from "app/utils/CommentProvider";
import { EnhancedDateProvider } from "app/utils/enhanced-date-context";
import { useCampaigns } from "app/utils/CampaignsContext";

const Creation = () => {
  const { active, subStep } = useActive();
  const { campaignFormData, setCampaignFormData, setCampaignData } = useCampaigns()

  // Clear previous campaign data only when starting a completely new plan
  useEffect(() => {
    // Check if we're coming from a "New Plan" button click
    const isNewPlanNavigation = sessionStorage.getItem('isNewPlanNavigation');

    const clearPreviousCampaignData = () => {
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
          Object.keys((window as any).channelLevelAudienceState).forEach((stageName) => {
            delete (window as any).channelLevelAudienceState[stageName];
          });
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
          "verifybeforeMove"
        ];

        // Remove campaign-specific localStorage items
        localStorageKeysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        // Remove quantities-related localStorage items (format selection)
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith("quantities_")) {
            localStorage.removeItem(key);
          }
        });

        // Remove modal dismissal keys
        Object.keys(localStorage).forEach(key => {
          if (key.includes("modal_dismissed") || key.includes("goalLevelModalDismissed")) {
            localStorage.removeItem(key);
          }
        });

        // Remove format error trigger keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith("triggerFormatError_")) {
            localStorage.removeItem(key);
          }
        });

        // Remove channel mix related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.includes("openItems") ||
            key.includes("selected") ||
            key.includes("stageStatuses") ||
            key.includes("showMoreMap") ||
            key.includes("openChannelTypes")) {
            localStorage.removeItem(key);
          }
        });

        // Remove granularity settings
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith("granularity_")) {
            localStorage.removeItem(key);
          }
        });

        // Reset campaign context state
        setCampaignFormData({});
        setCampaignData(null);

        console.log("Cleared previous campaign data for new plan");
      } catch (error) {
        console.error("Error clearing previous campaign data:", error);
      }
    };

    // Only clear data if we're explicitly starting a new plan
    if (isNewPlanNavigation === 'true' && (!campaignFormData?.id && !campaignFormData?.cId)) {
      clearPreviousCampaignData();
      // Clear the flag after using it
      sessionStorage.removeItem('isNewPlanNavigation');
    }
  }, [campaignFormData?.id, campaignFormData?.cId, setCampaignFormData, setCampaignData]);

  return (
    <EnhancedDateProvider campaignFormData={campaignFormData}>
      <div>
        <div className="creation_continer">
          {active === 0 && <SetupScreen />}
          {/* {active === 1 && <DefineCampaignObjective />} */}
          {active === 1 && <MapFunnelStages />}
          {active === 2 && <SelectChannelMix />}
          {active === 3 && <DefineAdSet />}
          {active === 4 && <FormatSelection />}
          {active === 5 && <SetBuyObjectivesAndTypes />}
          {active === 8 && <CampaignBudget />}

          {/* {active === 6 && <SetBuyObjectivesAndTypesSubStep />} */}

          {/* Step 8 (Tracks 2 subSteps) */}
        </div>
        {/* Step 7 (Tracks 1 subStep) */}
        {active === 7 &&
          (subStep === 0 ? (
            <PlanCampaignSchedule />
          ) : (
            subStep === 1 && <PlanCampaignScheduleSubStepComponent />
          ))}
        {active === 9 && <EstablishedGoals />}
        {active === 10 && <OverviewofyourCampaign />}
      </div>
    </EnhancedDateProvider>
  );
};

export default Creation;
