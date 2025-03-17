import React, { useState } from "react";
import MultiDatePicker from "../../../components/MultiDatePicker";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useCampaigns } from "../../utils/CampaignsContext";
import { removeKeysRecursively } from "../../../utils/removeID";
import { useSelectedDates } from "../../utils/SelectedDatesContext";
import dayjs from "dayjs";


const PlanCampaignSchedule: React.FC = () => {
	const [isEditing, setIsEditing] = useState(false);
	const { selectedDates, setSelectedDates } = useSelectedDates();

	console.log('selectedDates-selectedDates', selectedDates.from)
	const {
		createCampaign,
		updateCampaign,
		campaignData,
		campaignFormData,
		cId,
		getActiveCampaign,
	} = useCampaigns();

	updateCampaign
	console.log('cId-cId', cId)
	const currentYear = new Date().getFullYear();



	const handleValidate = async (selectedDates) => {
		const campaign_timeline_start_date = dayjs(
			new Date(currentYear, selectedDates?.from?.month - 1, selectedDates.from.day)
		).format("YYYY-MM-DD");

		const campaign_timeline_end_date = dayjs(
			new Date(currentYear, selectedDates?.to?.month - 1, selectedDates.to.day)
		).format("YYYY-MM-DD");
		const updateCampaignData = async (data: any) => {
			await updateCampaign(data);
			await getActiveCampaign(data);
		};

		console.log('handleValidate', campaignData)
		if (!campaignData) return;

		const cleanData = removeKeysRecursively(campaignData, [
			"id",
			"documentId",
			"createdAt",
			"publishedAt",
			"updatedAt",
		]);

		await updateCampaignData({
			...cleanData,
			campaign_timeline_start_date: campaign_timeline_start_date,
			campaign_timeline_end_date: campaign_timeline_end_date,
		});

		setIsEditing(false); // ✅ Ensures editing mode exits after validation
	};

	return (
		<div className="creation_continer">
			<div className="flex justify-between">

				<PageHeaderWrapper
					t1={'Setup the timeline of your campaign?'}
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
						onClick={() => { handleValidate(selectedDates); setIsEditing(false) }}
						className={`flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] bg-[#3175FF] hover:bg-[#2563eb]`}
					>
						Validate
					</button>}

			</div>
		</div>
	);
};

export default PlanCampaignSchedule;
