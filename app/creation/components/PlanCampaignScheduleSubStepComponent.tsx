import React, { useEffect } from 'react'
import MainSection from './organisms/main-section/main-section'
import PageHeaderWrapper from '../../../components/PageHeaderWapper'
import { useCampaigns } from '../../utils/CampaignsContext';
import { useSearchParams } from 'next/navigation';
import { useComments } from 'app/utils/CommentProvider';
import { useEditing } from 'app/utils/EditingContext';

const PlanCampaignScheduleSubStepComponent = () => {
	const searchParams = useSearchParams();
	const { setIsDrawerOpen, setClose } = useComments();
	const { setIsEditing } = useEditing();
	const campaignId = searchParams.get("campaignId");
	const {
		updateCampaign,
		campaignData,
		getActiveCampaign,
	} = useCampaigns();
	useEffect(() => {
		setIsDrawerOpen(false);
		// setClose(false);
		setIsEditing(true)
	}, []);




	return (
		<div>
			<div className="creation_continer">

				<PageHeaderWrapper
					t1={'Setup the timeline of your campaign?'}
					// t2={'Choose your campaign start and end dates, then arrange each funnel phase within the timeline.'}
					t4={'Phases default to the campaign duration, but you can adjust each phase and channel by dragging them'}
					span={2}
				/>
			</div>
			<MainSection />
		</div>
	)
}

export default PlanCampaignScheduleSubStepComponent
