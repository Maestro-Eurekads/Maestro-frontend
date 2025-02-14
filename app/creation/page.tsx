"use client";
import React from 'react'
import PlanCampaignSchedule from "./components/PlanCampaignSchedule";
import YourCampaign from "./components/YourCampaign";
import YourObjective from "./components/YourObjective";
import FunnelStage from "./components/FunnelStage";
import { useActive } from "../utils/ActiveContext";
import { FormatSelection } from "./components/FormatSelection";
import PlanCampaignScheduleSubStepComponent from './components/PlanCampaignScheduleSubStepComponent';
import SetBuyObjectivesAndTypes from './components/SetBuyObjectivesAndTypes';
import { SetupScreen } from './components/SetupScreen';

const Creation = () => {
	const { active, subStep } = useActive();
	return (
		<div className="creation_continer">
			{active === 0 && <SetupScreen />}
			{active === 1 && <YourCampaign />}
			{active === 2 && <YourObjective />}
			{active === 3 && <FunnelStage />}
			{active === 4 && <FormatSelection />}
			{active === 5 && <SetBuyObjectivesAndTypes />}
			{/* Step 6: Main step and Sub-step logic */}
			{active === 6 && (
				subStep === 0 ? <PlanCampaignSchedule /> : <PlanCampaignScheduleSubStepComponent />
			)}
		</div>
	);

}

export default Creation;
