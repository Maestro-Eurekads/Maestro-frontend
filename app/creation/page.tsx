"use client";
import React, { useCallback, useEffect } from "react";
import PlanCampaignSchedule from "./components/PlanCampaignSchedule";
import DefineCampaignObjective from "./components/DefineCampaignObjective";
import MapFunnelStages from "./components/MapFunnelStages";
import SelectChannelMix from "./components/SelectChannelMix";
import { useActive } from "../utils/ActiveContext";
import PlanCampaignScheduleSubStepComponent from "./components/PlanCampaignScheduleSubStepComponent";
import SetBuyObjectivesAndTypes from "./components/SetBuyObjectivesAndTypes";
import { SetupScreen } from "./components/SetupScreen";
import { EstablishedGoals } from "./components/EstablishedGoals";
import SetBuyObjectivesAndTypesSubStep from "./components/SetBuyObjectivesAndTypesSubStep";
import OverviewofyourCampaign from "./components/OverviewofyourCampaign";
import CampaignBudget from "./components/CampaignBudget";
import ConfigureAdSetsAndBudget from "./components/ ConfigureadSetsAndbudget";
import DefineAdSet from "./components/DefineAdSet";
import { FormatSelection } from "./components/FormatSelection";
import FeeSelectionStep from "./components/FeeSelectionStep";
import { useComments } from "app/utils/CommentProvider";

const Creation = () => {
  const { active, subStep } = useActive();
  return (
    <div>
      <div className="creation_continer">
        {active === 0 && <SetupScreen />}
        {/* {active === 1 && <DefineCampaignObjective />} */}
        {active === 1 && <MapFunnelStages />}
        {active === 2 && <SelectChannelMix />}
        {active === 3 && <DefineAdSet />}

        {active === 8 && <CampaignBudget />}

        {active === 4 && <FormatSelection />}
        {active === 5 && <SetBuyObjectivesAndTypes />}
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
  );
};

export default Creation;
