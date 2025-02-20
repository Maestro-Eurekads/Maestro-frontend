"use client";
import React from "react";
import PlanCampaignSchedule from "./components/PlanCampaignSchedule";
import YourCampaign from "./components/YourCampaign";
import YourObjective from "./components/YourObjective";
import FunnelStage from "./components/FunnelStage";
import { useActive } from "../utils/ActiveContext";
import { FormatSelection } from "./components/FormatSelection";
import PlanCampaignScheduleSubStepComponent from "./components/PlanCampaignScheduleSubStepComponent";
import SetBuyObjectivesAndTypes from "./components/SetBuyObjectivesAndTypes";
import { SetupScreen } from "./components/SetupScreen";
import { EstablishedGoals } from "./components/EstablishedGoals";
import SetBuyObjectivesAndTypesSubStep from "./components/SetBuyObjectivesAndTypesSubStep";
import OverviewofyourCampaign from "./components/OverviewofyourCampaign";
import CampaignBudget from './components/CampaignBudget';
import ConfigureAdSetsAndBudget from "./components/ ConfigureadSetsAndbudget";
import DefineAdSet from "./components/DefineAdSet";

const Creation = () => {
  const { active, subStep } = useActive();

  return (
    <div>
      <div className="creation_continer">
        {active === 0 && <SetupScreen />}
        {active === 1 && <YourCampaign />}
        {active === 2 && <YourObjective />}
        {active === 3 && <FunnelStage />}
        {active === 4 && <FormatSelection />}
        {active === 5 && <SetBuyObjectivesAndTypes />}
        {active === 6 && <SetBuyObjectivesAndTypesSubStep />}

        {/* Step 7 (Tracks 1 subStep) */}
        {active === 7 &&
          (subStep === 0 ? (
            <PlanCampaignSchedule />
          ) : (
            subStep === 1 && <PlanCampaignScheduleSubStepComponent />
          ))}

        {/* Step 8 (Tracks 2 subSteps) */}
        {active === 8 &&
          (subStep === 0 ? (
            <DefineAdSet />
          ) : subStep === 1 ? (
            <CampaignBudget />
          ) : (
            subStep === 2 && <ConfigureAdSetsAndBudget />
          ))}

      </div>
      {active === 9 && <EstablishedGoals />}
      {active === 10 && <OverviewofyourCampaign />}
    </div>
  );
};

export default Creation;



