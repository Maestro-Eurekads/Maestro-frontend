import Image from "next/image";
import PhasedistributionProgressChat from "./PhasedistributionProgressChat";
import Google from "../public/Google.svg";
import facebook from "../public/facebook.svg";
import ig from "../public/ig.svg";
import quantcast from "../public/quantcast.svg";
import youtube from "../public/youtube.svg";
import tradedesk from "../public/tradedesk.svg";
import speaker from "../public/mdi_megaphone.svg";
import zoom from "../public/tabler_zoom-filled.svg";
import credit from "../public/mdi_credit-card.svg";

// Define phases with unique platform data
const phases = [
	{
		img: speaker,
		name: "Awareness",
		amount: "4 200 €",
		platforms: [
			// { img: facebook, name: "Facebook", value: 37, color: "#1877F2" },
			// { img: ig, name: "Instagram", value: 23, color: "#C13584" },
			{ img: youtube, name: "YouTube", value: 40, color: "#FF0000" },
			{ img: tradedesk, name: "TheTradeDesk", value: 15, color: "#1A1A1A" },
			{ img: quantcast, name: "Quantcast", value: 10, color: "#0057FF" },
			{ img: Google, name: "Google", value: 50, color: "#4285F4" },
		],
	},
	{
		img: zoom,
		name: "Consideration",
		amount: "3 500 €",
		platforms: [
			{ img: facebook, name: "Facebook", value: 30, color: "#1877F2" },
			{ img: ig, name: "Instagram", value: 35, color: "#C13584" },
			{ img: youtube, name: "YouTube", value: 25, color: "#FF0000" },
			{ img: tradedesk, name: "TheTradeDesk", value: 10, color: "#1A1A1A" },
			{ img: quantcast, name: "Quantcast", value: 20, color: "#0057FF" },
			{ img: Google, name: "Google", value: 45, color: "#4285F4" },
		],
	},
	{
		img: credit,
		name: "Conversion",
		amount: "5 000 €",
		platforms: [
			{ img: facebook, name: "Facebook", value: 40, color: "#1877F2" },
			{ img: ig, name: "Instagram", value: 20, color: "#C13584" },
			{ img: youtube, name: "YouTube", value: 30, color: "#FF0000" },
			{ img: tradedesk, name: "TheTradeDesk", value: 20, color: "#1A1A1A" },
		],
	},
];

export default function PlatformSpending() {
	return (
		<div className="flex flex-col gap-6">
			{phases.map((phase, index) => {
				const values = phase.platforms.map((p) => p.value);
				const colors = phase.platforms.map((p) => p.color);

				return (
					<div key={index} className="flex flex-col gap-4">
						{/* Phase Name & Amount */}
						<div className="flex justify-between items-center mt-4">
							<div className="flex items-center gap-2">
								<Image src={phase.img} alt={phase.name} width={24} height={24} />
								<p className="text-[#061237] font-semibold text-lg">{phase.name}</p>
							</div>
							<div className="h-[29px] flex justify-center items-center px-4 bg-[#E8F6FF] border border-[rgba(49,117,255,0.1)] rounded-full">
								<p className="font-semibold text-[14px] text-[#3175FF]">{phase.amount}</p>
							</div>
						</div>

						{/* Progress Bar */}
						<PhasedistributionProgressChat values={values} colors={colors} />

						{/* Legend (Platform Name & Icon) */}
						<div className="flex flex-wrap gap-4 mt-2">
							{phase.platforms.map((platform, idx) => (
								<div key={idx} className="flex items-center gap-2">
									{/* <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }}></div> */}
									<Image src={platform.img} alt={platform.name} width={20} height={20} />
									<p className="text-sm text-[#061237] font-medium">{platform.name}</p>
								</div>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
