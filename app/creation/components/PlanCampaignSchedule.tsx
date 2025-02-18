import React from "react";
import MultiDatePicker from "../../../components/MultiDatePicker";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";

const PlanCampaignSchedule: React.FC = () => {

	return (
		<div >
			<PageHeaderWrapper
				t1={'Which platforms would you like to activate for each funnel stage?'}
				t2={'Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time.'}
				t4={'Choose your start and end date for the campaign'}
				span={1}
			/>

			<MultiDatePicker />
		</div>
	);
};

export default PlanCampaignSchedule;
