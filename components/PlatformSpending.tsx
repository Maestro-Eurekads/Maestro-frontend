import ThreeValuesProgress from "./ThreeValuesProgress";

const platforms = [
	{ name: "Facebook", amount: "4 200 €", values: [37, 23, 40] },
	{ name: "Instagram", amount: "3 500 €", values: [40, 30, 30] },
	{ name: "YouTube", amount: "5 000 €", values: [100, 0, 0] },
	{ name: "TheTradeDesk", amount: "2 800 €", values: [0, 35, 30] },
	{ name: "Quantcast", amount: "3 200 €", values: [0, 28, 34] },
	{ name: "Google", amount: "6 100 €", values: [0, 0, 100] },
];

export default function PlatformSpending() {
	return (
		<div className="flex flex-col gap-[20px]">
			{platforms.map((platform, index) => (
				<div key={index} className="flex flex-col gap-[10px]">
					{/* Platform Name & Amount */}
					<div className="flex justify-between items-center mt-[24px]">
						<div>
							<p>{platform.name}</p>
						</div>
						<div className="w-[72px] h-[29px] flex flex-row justify-center items-center p-[5px] px-[12px] gap-[8px] bg-[#E8F6FF] border border-[rgba(49,117,255,0.1)] rounded-[50px]">
							<p className="font-semibold text-[14px] leading-[19px] text-[#3175FF] order-0 flex-none">
								{platform.amount}
							</p>
						</div>
					</div>

					{/* Progress Bar */}
					<div>
						<ThreeValuesProgress values={platform.values} />
					</div>

					{/* Legend */}
					<div className="flex justify-between items-center mt-[10px]">
						<div className="flex items-center gap-2">
							<div className="w-[12px] h-[12px] bg-[#3175FF] rounded-[4px]"></div>
							<p className="font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
								Awareness ({platform.values[0]}%)
							</p>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-[12px] h-[12px] bg-[#00A36C] rounded-[4px]"></div>
							<p className="font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
								Consideration ({platform.values[1]}%)
							</p>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-[12px] h-[12px] bg-[#FF9037] rounded-[4px]"></div>
							<p className="font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
								Conversion ({platform.values[2]}%)
							</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
