
import Google from "../../public/Google.svg";
import facebook from "../../public/facebook.svg";
import ig from "../../public/ig.svg";
import quantcast from "../../public/quantcast.svg";
import youtube from "../../public/youtube.svg";
import tradedesk from "../../public/tradedesk.svg";
import Image from 'next/image'
import ThreeValuesProgress from "../ThreeValuesProgress";

const platforms = [
	{ img: <Image src={facebook} alt='facebook' />, name: "Facebook", amount: "4 200 €", values: [37, 23, 40] },
	{ img: <Image src={ig} alt='facebook' />, name: "Instagram", amount: "3 500 €", values: [40, 30, 30] },
	{ img: <Image src={youtube} alt='quantcast' />, name: "YouTube", amount: "5 000 €", values: [100, 0, 0] },
	{ img: <Image src={tradedesk} alt='quantcast' />, name: "TheTradeDesk", amount: "2 800 €", values: [0, 35, 30] },
	{ img: <Image src={quantcast} alt='quantcast' />, name: "Quantcast", amount: "3 200 €", values: [0, 28, 34] },
	{ img: <Image src={Google} alt='Google' />, name: "Google", amount: "6 100 €", values: [0, 0, 100] },
];

const ChannelDistributionChatOne = () => {
	return (
		<div className="flex flex-col gap-[20px]">
			{/* Legend */}
			<div className="flex gap-[24px] items-center mt-[10px] flex-wrap">
				<div className="flex items-center gap-2">
					<div className="w-[14px] h-[14px] bg-[#3175FF] rounded-[4px]"></div>
					<p className="font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
						Awareness
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-[14px] h-[14px] bg-[#00A36C] rounded-[4px]"></div>
					<p className="font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
						Consideration
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-[14px] h-[14px] bg-[#FF9037] rounded-[4px]"></div>
					<p className="font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
						Conversion
					</p>
				</div>
			</div>
			{platforms.map((platform, index) => (
				<div key={index} className="flex flex-col gap-[10px]">
					{/* Platform Name & Amount */}
					<div className="flex justify-between items-center mt-[24px]">
						<div className="flex items-center gap-2">
							<p>{platform.img}</p>
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
						<ThreeValuesProgress values={platform.values} showpercent={true} />
					</div>


				</div>
			))}
		</div>
	);
}
export default ChannelDistributionChatOne