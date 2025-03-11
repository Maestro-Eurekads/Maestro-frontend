const ThreeValuesProgress = ({ values }: { values: number[] }) => {
	const total = values.reduce((acc, val) => acc + val, 0);
	const percentages = values.map((val) => (val / total) * 100);

	return (
		<div className="w-[100%] h-[16px] flex overflow-hidden rounded-[4px] bg-gray-200">
			<div
				className="h-full bg-[#3175FF]"
				style={{ width: `${percentages[0]}%`, borderRadius: "4px 0 0 4px" }}
			></div>
			<div
				className="h-full bg-[#00A36C]"
				style={{ width: `${percentages[1]}%`, borderRadius: "0px" }}
			></div>
			<div
				className="h-full bg-[#FF9037]"
				style={{ width: `${percentages[2]}%`, borderRadius: "0px 4px 4px 0px" }}
			></div>
		</div>
	);
};

export default ThreeValuesProgress  

