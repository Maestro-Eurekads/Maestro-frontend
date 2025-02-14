import React from 'react'
import MainSection from './organisms/main-section/main-section'

const PlanCampaignScheduleSubStepComponent = () => {
	return (
		<div>
			<div>
				<h1 className="font-general-sans font-semibold text-[24px] leading-[32px] text-[#292929]">
					Setup the timeline of your campaign?
				</h1>
				<h2 className="font-general-sans font-medium text-[16px] leading-[22px] text-[rgba(0,0,0,0.9)] mt-2">
					Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time.
				</h2>
				<div className="flex items-center mt-[33px] gap-[12px]">
					<span className="flex justify-center w-[26px] h-[26px] bg-[#3175FF] rounded-full font-bold text-[16px] leading-[22px] items-center text-center text-white">
						2
					</span>
					<p className="font-[600] text-[18px] leading-[24px] text-[#3175FF]">
						Phases default to the campaign duration, but you can adjust each phase and channel by dragging them
					</p>
				</div>
				<MainSection />
			</div>
		</div>
	)
}

export default PlanCampaignScheduleSubStepComponent
