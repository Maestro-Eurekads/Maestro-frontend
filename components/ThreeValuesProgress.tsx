const ThreeValuesProgress = ({ values, showpercent }: { values: number[]; showpercent: boolean }) => {
	const total = values.reduce((acc, val) => acc + val, 0);
	const percentages = total > 0 ? values.map((val) => (val / total) * 100) : [0, 0, 0];

	// Function to format percentage: remove `.0` if it's a whole number
	const formatPercentage = (value: number) =>
		value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

	return (
		<div className="w-full h-[24px] flex overflow-hidden rounded-[4px] bg-gray-200">
			{percentages.map((percent, index) => {
				const bgColors = ["bg-[#3175FF]", "bg-[#00A36C]", "bg-[#FF9037]"];
				const borderRadiusStyles = [
					"4px 0 0 4px",
					"0px",
					"0px 4px 4px 0px",
				];

				return (
					<div
						key={index}
						className={`h-full ${bgColors[index]} flex items-center justify-center`}
						style={{ width: `${percent}%`, borderRadius: borderRadiusStyles[index] }}
					>
						{showpercent && percent > 0 && (
							<p className="font-semibold text-[13px] leading-[18px] flex items-center justify-center text-white">
								{formatPercentage(percent)}%
							</p>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default ThreeValuesProgress;

