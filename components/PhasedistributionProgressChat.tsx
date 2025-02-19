const PhasedistributionProgressChat = ({ values, colors }: { values: number[]; colors: string[] }) => {
	const total = values.reduce((acc, val) => acc + val, 0);

	return (
		<div className="w-full h-[16px] flex overflow-hidden rounded-full bg-gray-200">
			{values.map((value, idx) => {
				const widthPercentage = total > 0 ? (value / total) * 100 : 0;
				return (
					<div
						key={idx}
						className="h-full"
						style={{
							width: `${widthPercentage}%`,
							backgroundColor: colors[idx],
						}}
					></div>
				);
			})}
		</div>
	);
};

export default PhasedistributionProgressChat;
