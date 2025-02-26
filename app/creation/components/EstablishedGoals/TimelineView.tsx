import React from 'react'
import DateComponent from '../molecules/date-component/date-component'
import Image from "next/image";
import facebook from "../../../../public/facebook.svg";
import instagram from "../../../../public/instagram.svg";
import youtube from "../../../../public/youtube.svg";
import tradedesk from "../../../../public/tradedesk.svg";
import quantcast from "../../../../public/quantcast.svg";
import { useDateRange } from '../../../../src/date-range-context';
import { eachDayOfInterval } from "date-fns";
import EstablishedGoalsTimeline from './EstablishedGoalsTimeline';

const TimelineView = () => {
	const { range } = useDateRange();
	const dateList = eachDayOfInterval({
		start: range.startDate,
		end: range.endDate,
	});

	const weeksCount = ""


	const funnelsData = [
		{ startWeek: 2, endWeek: 10, label: "Campaign 1" },
		// { startWeek: 3, endWeek: 5, label: "Campaign 2" },
		// { startWeek: 3, endWeek: 5, label: "Campaign 2" },
	];


	return (
		<div
			className="w-full min-h-[494px] relative "
			style={{
				backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
				backgroundSize: `calc(100% / ${dateList.length}) 100%`,
			}}
		>
			<div className="bg-white">
				<DateComponent useDate={undefined} />
			</div>

			<EstablishedGoalsTimeline dateList={dateList} funnels={funnelsData} />
		</div>
	)
}

export default TimelineView





// < div className = "ml-[82px]" >
// 			<div className="mt-5 max-w-[732px] w-full flex items-center rounded-[10px] text-[17px] font-[500] bg-[#3175FF] text-white p-3 text-center">
// 				<div className="flex items-center justify-center gap-3 flex-1">
// 					<span>
// 						<svg
// 							width="23"
// 							height="22"
// 							viewBox="0 0 23 22"
// 							fill="none"
// 							xmlns="http://www.w3.org/2000/svg"
// 						>
// 							<path
// 								d="M11.7096 7.33335H4.3763C3.89007 7.33335 3.42376 7.52651 3.07994 7.87032C2.73612 8.21414 2.54297 8.68046 2.54297 9.16669V12.8334C2.54297 13.3196 2.73612 13.7859 3.07994 14.1297C3.42376 14.4735 3.89007 14.6667 4.3763 14.6667H5.29297V18.3334C5.29297 18.5765 5.38955 18.8096 5.56145 18.9815C5.73336 19.1534 5.96652 19.25 6.20964 19.25H8.04297C8.28608 19.25 8.51924 19.1534 8.69115 18.9815C8.86306 18.8096 8.95964 18.5765 8.95964 18.3334V14.6667H11.7096L16.293 18.3334V3.66669L11.7096 7.33335ZM20.418 11C20.418 12.5675 19.538 13.9884 18.1263 14.6667V7.33335C19.5288 8.02085 20.418 9.44169 20.418 11Z"
// 								fill="#FFFFFF"
// 							/>
// 						</svg>
// 					</span>{" "}
// 					<span>Awareness</span>{" "}
// 					<span>
// 						<svg
// 							width="17"
// 							height="16"
// 							viewBox="0 0 17 16"
// 							fill="none"
// 							xmlns="http://www.w3.org/2000/svg"
// 						>
// 							<path
// 								d="M5.38021 6.66667L8.71354 10L12.0469 6.66667"
// 								stroke="#FFFFFF"
// 								strokeOpacity="0.8"
// 								strokeWidth="1.33333"
// 								strokeLinecap="round"
// 								strokeLinejoin="round"
// 							/>
// 						</svg>
// 					</span>
// 				</div>
// 				<button className="justify-self-end px-3 py-[10px] text-[16px] font-[500] bg-white/25 rounded-[5px]">
// 					6,000 €
// 				</button>
// 			</div>

// 			<div className="ml-[56px]">
// 				<div className="">
// 					<div className="py-3 bg-[#0866FF33] text-[#0866FF] text-[15px] font-[500] border border-[#0866FF33] my-5 max-w-[284px] w-full rounded-[10px] flex items-center justify-between">
// 						<span className="flex items-center gap-3 pl-3 ml-14">
// 							<span className="relative w-[16px] h-[16px]">
// 								<Image src={facebook} fill alt="Facebook" />
// 							</span>
// 							<span>Facebook</span>
// 						</span>
// 						<button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
// 							1,800 €
// 						</button>
// 					</div>
// 					<button className="bg-[#EBFEF4]/50 py-[10px] px-3 border border-[#00A36C1A] text-[#00A36C]/60 flex gap-2">
// 						2 add sets
// 						<span>
// 							<svg
// 								width="17"
// 								height="17"
// 								viewBox="0 0 17 17"
// 								fill="none"
// 								xmlns="http://www.w3.org/2000/svg"
// 							>
// 								<path
// 									d="M12.0417 9.83333L8.70833 6.5L5.375 9.83333"
// 									stroke="#00A36C"
// 									strokeWidth="1.33333"
// 									strokeLinecap="round"
// 									strokeLinejoin="round"
// 								/>
// 							</svg>
// 						</span>
// 					</button>

{/* <div className="ml-[40px]">
							<div className="overflow-x-auto max-w-[990px]">
								<table className="table text-[#061237] border-collapse border-none"> */}
{/* head */ }
{/* <thead className="!border-none">
										<tr className="!border-none">
											<th className="text-[#667085] text-[12px] font-[500] !border-none">
												#
											</th>
											<th className="text-[#667085] text-[12px] font-[500] !border-none">
												Type
											</th>
											<th className="text-[#667085] text-[12px] font-[500] !border-none">
												Name
											</th>
											<th className="text-[#667085] text-[12px] font-[500] !border-none">
												Audience Size
											</th>
											<th className="text-[#667085] text-[12px] font-[500] !border-none">
												Budget
											</th>
											<th className="text-[#667085] text-[12px] font-[500] border-none !border-l rounded-md">
												CPM
											</th>
											<th className="text-[#667085] text-[12px] font-[500] !border-none">
												Impressions
											</th>
											<th className="text-[#667085] text-[12px] font-[500] !border-none">
												Frequency
											</th>
											<th className="text-[#667085] text-[12px] font-[500] !border-none">
												<button className="w-[18px] h-[18px] grid place-items-center bg-[#3175FF] text-white rounded-[5px]">
													+
												</button>
											</th>
										</tr>
									</thead>
									<tbody className="whitespace-nowrap !border-none">
										{/* row 1 */}
// <tr className="!border-none">
// 	<td className="!border-none bg-transparent">1</td>
// 	<td className="!border-none bg-transparent">
// 		Broad
// 	</td>
// 	<td className="!border-none">
// 		Spring sale Awareness
// 	</td>
// 	<td className="!border-none">100,000</td>
// 	<td className="!border-none">5,000 €</td>
// 	<td className="!border-none !border-l rounded-md">
// 		50 €
// 	</td>
// 	<td className="!border-none">200,000</td>
// 	<td className="!border-none">2.0</td>
// </tr>
{/* row 2 */ }
// 					<tr className="hover !border-none">
// 						<td className="!border-none">2</td>
// 						<td className="!border-none">Lookalike</td>
// 						<td className="!border-none">Facebook Awareness</td>
// 						<td className="!border-none">80,000</td>
// 						<td className="!border-none">4,000 €</td>
// 						<td className="!border-none">55 €</td>
// 						<td className="!border-none">160,000</td>
// 						<td className="!border-none">2.1</td>
// 					</tr>
// 				</tbody>
// 			</table>
// 		</div>
// 	</div>
// </div>  

{/* Instagram */ }
{/* <div className="ml-[291px]">
						<div className="py-3 bg-[#FEF1F8] text-[#E01389] text-[15px] font-[500] border border-[#E0138933] mt-5 mb-1 max-w-[371px] w-full rounded-[10px] flex items-center justify-between">
							<span className="flex items-center gap-3 pl-3 mx-auto">
								<span className="relative w-[16px] h-[16px]">
									<Image src={instagram} fill alt="Instagram" />
								</span>
								<span>Instagram</span>
							</span>
							<button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
								1,800 €
							</button>
						</div>
						<button className="bg-[#EBFEF4]/50 py-[10px] px-3 border border-[#00A36C1A]/10 text-[#00A36C]/60 flex gap-2">
							2 add sets
							<span>
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M12.0417 9.83333L8.70833 6.5L5.375 9.83333"
										stroke="#00A36C"
										strokeWidth="1.33333"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</span>
						</button>
					</div> */}

{/* Youtube */ }
{/* <div className="">
						<div className="py-3 bg-[#FFF0F0] text-[#E01389] text-[15px] font-[500] border border-[#E0138933] mt-5 mb-1 max-w-[513px] w-full rounded-[10px] flex items-center justify-between">
							<span className="flex items-center gap-3 pl-3 mx-auto">
								<span className="relative w-[16px] h-[16px]">
									<Image src={youtube} fill alt="Youtube" />
								</span>
								<span>Youtube</span>
							</span>
							<button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
								1,200 €
							</button>
						</div>
						<button className="bg-[#EBFEF4]/50 py-[10px] px-3 border border-[#00A36C1A]/10 text-[#00A36C]/60 flex gap-2">
							1 add sets
							<span>
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M12.0417 9.83333L8.70833 6.5L5.375 9.83333"
										stroke="#00A36C"
										strokeWidth="1.33333"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</span>
						</button>
					</div> */}

{/* The TradeDesk */ }
{/* <div className="ml-[291px]">
						<div className="py-3 bg-[#F0F9FF] text-[#0099FA] text-[15px] font-[500] border border-[#0099FA33] mt-5 mb-1 max-w-[371px] w-full rounded-[10px] flex items-center justify-between">
							<span className="flex items-center gap-3 pl-3 mx-auto">
								<span className="relative w-[16px] h-[16px]">
									<Image src={tradedesk} fill alt="TheTradeDesk" />
								</span>
								<span>TheTradeDesk</span>
							</span>
							<button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
								900 €
							</button>
						</div>
						<button className="bg-[#EBFEF4]/50 py-2 px-3 border border-[#00A36C1A]/10 text-[#00A36C]/60 flex gap-2">
							1 add sets
							<span>
								<svg
									width="17"
									height="17"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M12.0417 9.83333L8.70833 6.5L5.375 9.83333"
										stroke="#00A36C"
										strokeWidth="1.33333"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</span>
						</button>
					</div>
				</div>
			</ > */}