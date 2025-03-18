"use client";
import React from "react";
import PlanCampaignSchedule from "./components/PlanCampaignSchedule";
import DefineCampaignObjective from "./components/DefineCampaignObjective";
import MapFunnelStages from "./components/MapFunnelStages";
import SelectChannelMix from "./components/SelectChannelMix";
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
import { useParams, useRouter } from 'next/navigation';

const Creation = () => {
  const router = useRouter();
  const id = useParams();


  console.log('useParams-useParams', id)
  const { active, subStep } = useActive();
  return (
    <div>
      <div className="creation_continer">
        {active === 0 && <SetupScreen />}
        {active === 1 && <DefineCampaignObjective />}
        {active === 2 && <MapFunnelStages />}
        {active === 3 && <SelectChannelMix />}
        {active === 4 && <FormatSelection />}
        {active === 5 && <SetBuyObjectivesAndTypes />}
        {active === 6 && <SetBuyObjectivesAndTypesSubStep />}


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



