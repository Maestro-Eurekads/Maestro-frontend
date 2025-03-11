const campaignPhases = [
	{ name: "Awareness", percentage: 25, color: "#3175FF" },
	{ name: "Consideration", percentage: 23, color: "#00A36C" },
	{ name: "Conversion", percentage: 25, color: "#FF9037" },
];

const CampaignPhases = () => {
	return (
		<div className="campaign_phases_container_two flex flex-col gap-[28px]">
			{campaignPhases.map((phase, index) => (
				<div key={index} className="flex items-center gap-2">
					<div
						className="w-[12px] h-[12px] rounded-[4px]"
						style={{ backgroundColor: phase.color }}
					></div>
					<p className="font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
						{phase.name} ({phase.percentage}%)
					</p>
				</div>
			))}
		</div>
	);
};

export default CampaignPhases;
