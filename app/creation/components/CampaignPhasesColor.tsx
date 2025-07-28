

const CampaignPhasesColor = ({ campaignPhases }) => {


	return (
		<div className="campaign_phases_container_two flex flex-row flex-wrap  gap-[28px] mt-5">
			{campaignPhases?.map((phase, index) => (
				<div key={index} className="flex flex-row items-center   gap-2">
					<div className={`w-[12px] h-[12px] rounded-[4px] ${phase?.color}`}></div>
					<div className="flex items-center gap-[2px]">
						<p className="font-medium text-[16px] leading-[22px] flex items-center text-[rgba(6,18,55,0.8)]">
							{phase?.name}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default CampaignPhasesColor;
