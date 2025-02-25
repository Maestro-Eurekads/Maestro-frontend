import React from 'react'
import MainSection from './organisms/main-section/main-section'
import PageHeaderWrapper from '../../../components/PageHeaderWapper'

const PlanCampaignScheduleSubStepComponent = () => {
	return (
		<div>
			<div className="creation_continer">

				<PageHeaderWrapper
					t1={'Setup the timeline of your campaign?'}
					t2={'Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time.'}
					t4={'Phases default to the campaign duration, but you can adjust each phase and channel by dragging them'}
					span={2}
				/>
			</div>
			<MainSection />
		</div>
	)
}

export default PlanCampaignScheduleSubStepComponent
