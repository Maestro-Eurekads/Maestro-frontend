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
import { useSession } from "next-auth/react";

const Creation = () => {
  const { active, subStep } = useActive();
  const { campaignFormData, agencyId } = useCampaigns();

  // get the usesession user
  const { data: session } = useSession();
  const user = session?.user;

  // Clear channel state only when starting a new plan, not when continuing existing ones
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Check if user is currently working on a saved campaign
        const hasActiveCampaign =
          sessionStorage.getItem("hasActiveCampaign") === "true";
        const hasCampaignData = sessionStorage.getItem("campaignFormData");

        // Only clear if there's no active campaign and no campaign data
        if (!hasActiveCampaign && !hasCampaignData) {
          // Clear all channel state keys from sessionStorage
          const keysToRemove = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith("channelLevelAudienceState_")) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => sessionStorage.removeItem(key));

          // Clear all channel state keys from localStorage
          const localStorageKeysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
              key &&
              key.startsWith("persistent_channelLevelAudienceState_")
            ) {
              localStorageKeysToRemove.push(key);
            }
          }
          localStorageKeysToRemove.forEach((key) =>
            localStorage.removeItem(key)
          );

          // Clear global state
          if ((window as any).channelLevelAudienceState) {
            Object.keys((window as any).channelLevelAudienceState).forEach(
              (stageName) => {
                delete (window as any).channelLevelAudienceState[stageName];
              }
            );
          }

          // Clear the new plan session ID to ensure complete isolation
          if ((window as any).__newPlanSessionId) {
            delete (window as any).__newPlanSessionId;
          }


        } else {

        }
      } catch (error) {

      }
    }
  }, []);



  // ────────────────────────────────────────────────────────────────
  // Guard: only the campaign builder (same Strapi user) can access
  // this page. If the logged-in user is different from the
  // campaign_builder attached to the campaignFormData we show a 404.
  // ────────────────────────────────────────────────────────────────

  // Extract builder id when available – campaignFormData is filled
  // asynchronously in the CampaignProvider, so the value may be
  // undefined on the very first render.
  const builderId = campaignFormData?.agency_profile?.id;
  const loggedInId = agencyId;

  if (builderId && loggedInId && builderId !== loggedInId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-3xl font-semibold">404</h1>
        <p className="text-lg text-gray-600">Page not found</p>
      </div>
    );
  }

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
