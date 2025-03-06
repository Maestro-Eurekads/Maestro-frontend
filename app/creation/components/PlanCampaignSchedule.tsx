import React from "react";
import MultiDatePicker from "../../../components/MultiDatePicker";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";

const PlanCampaignSchedule: React.FC = () => {

	return (
		<div className="creation_continer">
			<PageHeaderWrapper
				t1={'Setup the timeline of your campaign'}
				t2={'Choose your campaign start and end dates, then arrange each funnel phase within the timeline.'}
				span={1}
				t4='Choose your start and end date for the campaign'
			/>

			<MultiDatePicker />
		</div>
	);
};

export default PlanCampaignSchedule;
