import React, { useState } from "react";
import MultiDatePicker from "../../../components/MultiDatePicker";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";

const PlanCampaignSchedule: React.FC = () => {
	const [isEditing, setIsEditing] = useState(false);


	return (
		<div className="creation_continer">
			<div className="flex justify-between">

				<PageHeaderWrapper
					t1={'Setup the timeline of your campaign'}
					t2={'Choose your campaign start and end dates, then arrange each funnel phase within the timeline.'}
					span={1}
					t4='Choose your start and end date for the campaign'
				/>
				{isEditing ? (
					''
				) : (
					<button className="model_button_blue" onClick={() => setIsEditing(true)}>
						Edit
					</button>
				)}
			</div>

			<MultiDatePicker isEditing={isEditing} />

			<div className="flex justify-end pr-[24px] mt-4">
				{isEditing &&
					<button
						onClick={() => setIsEditing(false)}
						className={`flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] bg-[#3175FF] hover:bg-[#2563eb]`}
					>
						Validate
					</button>}

			</div>
		</div>
	);
};

export default PlanCampaignSchedule;
