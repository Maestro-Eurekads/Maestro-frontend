import React, { useState } from 'react'
import Image from "next/image";
import zoom from '../../../../public/tabler_zoom-filled.svg';
import credit from '../../../../public/mdi_credit-card.svg';


const TableView = ({ channels }) => {
	const [expandedRows, setExpandedRows] = useState({});

	const campaignData = {
		phases: {
			awareness: {
				channels: [
					{
						channel: "Broad",
						audience: "Men 25+ Int. Sport",
						startDate: "11/01/2025",
						endDate: "15/01/2025",
						audienceSize: 2500000,
						budget: 1800, // €1,800
						cpm: "CPM", // To be calculated or entered
						impressions: "-", // To be calculated
						frequency: "-", // "Enter frequency"
						reach: 500000,
						penetrationRate: 20.0 // 20.0%
					},
					{
						channel: "Lookalike",
						audience: "Broad",
						campaignName: "Spring sale Awareness",
						startDate: "-",
						endDate: "-",
						audienceSize: 50000,
						budget: 700, // €700
						cpm: "CPM", // "CPM" placeholder
						impressions: "-",
						frequency: 2,
						reach: "-",
						penetrationRate: "-"
					},
					{
						channel: "Facebook",
						audience: "Lookalike",
						campaignName: "Facebook Awareness",
						startDate: "-",
						endDate: "-",
						audienceSize: 235000,
						budget: 1100, // €1,100
						cpm: "CPM", // "CPM" placeholder
						impressions: 2000000,
						frequency: "-", // "Enter frequency"
						reach: 200000,
						penetrationRate: 16.7 // 16.7%
					},
					{
						channel: "Facebook",
						audience: "Lookalike Website Visitors 90D",
						startDate: "-",
						endDate: "-",
						audienceSize: 200000,
						budget: 900, // €900
						cpm: "CPM", // "CPM" placeholder
						impressions: "-",
						frequency: "-", // "Enter frequency"
						reach: 750000,
						penetrationRate: 25.4 // 25.4%
					},
					{
						channel: "Retargeting",
						audience: "Retargeting Active Buyers 30D",
						startDate: "-",
						endDate: "-",
						audienceSize: 300000,
						budget: 1200, // €1,200
						cpm: "CPM",
						impressions: "-",
						frequency: 5,
						reach: "-",
						penetrationRate: "-"
					},
					{
						channel: "Facebook",
						audience: "Lookalike Abandoned Carts 7D",
						startDate: "-",
						endDate: "-",
						audienceSize: 150000,
						budget: 500, // €500
						cpm: "CPM", // "CPM" placeholder
						impressions: 900000,
						frequency: "-", // "Enter frequency"
						reach: 369000,
						penetrationRate: 33.3 // 33.3%
					},
					{
						channel: "Instagram",
						audience: "Lookalike Buyers 90D",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 1200000,
						budget: 1500, // €1,500
						cpm: "CPM",
						impressions: 1250000,
						frequency: "-", // "Enter frequency"
						reach: 980000,
						penetrationRate: 50.3 // 50.3%
					},
					{
						channel: "Youtube",
						audience: "Men 25+ Int. Sport",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 3000000,
						budget: 1200, // €1,200
						cpm: "CPM",
						impressions: 875000,
						frequency: "-",
						reach: "-",
						penetrationRate: "-"
					},
					{
						channel: "TheTradeDesk",
						audience: "Lookalike Buyers 90D",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 1500000,
						budget: 900, // €900
						cpm: "CPM",
						impressions: 1250000,
						frequency: "-",
						reach: "-",
						penetrationRate: "-"
					},
					{
						channel: "Quantcast",
						audience: "Men 25+ Int. Sport",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 2000000,
						budget: 600, // €600
						cpm: "CPM",
						impressions: "-",
						frequency: "-",
						reach: "-",
						penetrationRate: "-"
					}
				]
			},
			consideration: {
				channels: [
					{
						channel: "Facebook",
						audience: "Men 25+ Int. Sport",
						startDate: "11/01/2025",
						endDate: "15/01/2025",
						audienceSize: 2500000,
						budget: 2100, // €2,100
						cpm: "CPM", // "Enter CPM"
						impressions: 2000000,
						frequency: "-", // "Enter frequency"
						reach: 500000,
						penetrationRate: 20.0 // 20.0%
					},
					{
						channel: "Instagram",
						audience: "Lookalike Buyers 90D",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 1200000,
						budget: "1,800 €", // "Enter budget"
						cpm: "CPM", // "Enter CPM"
						impressions: 900000,
						frequency: "-", // "Enter frequency"
						reach: 200000,
						penetrationRate: 16.7 // 16.7%
					},
					{
						channel: "Youtube",
						audience: "Men 25+ Int. Sport",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 3000000,
						budget: "1,800 €", // "Enter budget"
						cpm: "CPM", // "Enter CPM"
						impressions: 1250000,
						frequency: "-", // "Enter frequency"
						reach: 750000,
						penetrationRate: 25.4 // 25.4%
					},
					{
						channel: "TheTradeDesk",
						audience: "Lookalike Buyers 90D",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 1500000,
						budget: "1,800 €", // "Enter budget"
						cpm: "CPM", // "Enter CPM"
						impressions: 875000,
						frequency: "-", // "Enter frequency"
						reach: 369000,
						penetrationRate: 33.3 // 33.3%
					},
					{
						channel: "Quantcast",
						audience: "Men 25+ Int. Sport",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 2000000,
						budget: "1,800 €", // "Enter budget"
						cpm: "CPM", // "Enter CPM"
						impressions: 1250000,
						frequency: "-", // "Enter frequency"
						reach: 980000,
						penetrationRate: 50.3 // 50.3%
					}
				]
			},
			conversion: {
				channels: [
					{
						channel: "Facebook",
						audience: "Men 25+ Int. Sport",
						startDate: "11/01/2025",
						endDate: "15/01/2025",
						audienceSize: 2500000,
						budget: "1,800 €", // "Enter budget"
						cpm: "CPM", // "Enter CPM"
						impressions: 2000000,
						frequency: "-", // "Enter frequency"
						reach: 500000,
						penetrationRate: 20.0 // 20.0%
					},
					{
						channel: "Instagram",
						audience: "Lookalike Buyers 90D",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 1200000,
						budget: "1,800 €", // "Enter budget"
						cpm: "CPM", // "Enter CPM"
						impressions: 900000,
						frequency: "-", // "Enter frequency"
						reach: 200000,
						penetrationRate: 16.7 // 16.7%
					},
					{
						channel: "Youtube",
						audience: "Men 25+ Int. Sport",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 3000000,
						budget: "1,800 €", // "Enter budget"
						cpm: "CPM", // "Enter CPM"
						impressions: 1250000,
						frequency: "-", // "Enter frequency"
						reach: 750000,
						penetrationRate: 25.4 // 25.4%
					},
					{
						channel: "TheTradeDesk",
						audience: "Lookalike Buyers 90D",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 1500000,
						budget: "1,800 €", // "Enter budget"
						cpm: "CPM", // "Enter CPM"
						impressions: 875000,
						frequency: "-", // "Enter frequency"
						reach: 369000,
						penetrationRate: 33.3 // 33.3%
					},
					{
						channel: "Quantcast",
						audience: "Men 25+ Int. Sport",
						startDate: "08/01/2025",
						endDate: "10/01/2025",
						audienceSize: 2000000,
						budget: "1,800 €", // "Enter budget"
						cpm: "CPM", // "Enter CPM"
						impressions: 1250000,
						frequency: "-", // "Enter frequency"
						reach: 980000,
						penetrationRate: 50.3 // 50.3%
					}
				]
			}
		}
	};



	const toggleRow = (index) => {
		setExpandedRows((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};
	return (
		<div className="  my-5 mx-[40px]">
			<section className="">
				<h1 className="text-[#061237] text-[18px] font-[600] mb-5 flex gap-2">
					<svg
						width="23"
						height="22"
						viewBox="0 0 23 22"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M11.7096 7.33335H4.3763C3.89007 7.33335 3.42376 7.52651 3.07994 7.87032C2.73612 8.21414 2.54297 8.68046 2.54297 9.16669V12.8334C2.54297 13.3196 2.73612 13.7859 3.07994 14.1297C3.42376 14.4735 3.89007 14.6667 4.3763 14.6667H5.29297V18.3334C5.29297 18.5765 5.38955 18.8096 5.56145 18.9815C5.73336 19.1534 5.96652 19.25 6.20964 19.25H8.04297C8.28608 19.25 8.51924 19.1534 8.69115 18.9815C8.86306 18.8096 8.95964 18.5765 8.95964 18.3334V14.6667H11.7096L16.293 18.3334V3.66669L11.7096 7.33335ZM20.418 11C20.418 12.5675 19.538 13.9884 18.1263 14.6667V7.33335C19.5288 8.02085 20.418 9.44169 20.418 11Z"
							fill="#3175FF"
						/>
					</svg>
					Awareness
				</h1>
				<div className=" rounded-xl border border-[#E5E5E5]">
					<div className="rounded-xl overflow-x-auto">
						<table className="w-full border-collapse">
							<thead className="whitespace-nowrap">
								<tr className="bg-[#F5F5F5]">
									<th className="py-4 px-6">Channel</th>
									<th className="py-4 px-6">Audience</th>
									<th className="py-4 px-6">Start Date</th>
									<th className="py-4 px-6">End Date</th>
									<th className="py-4 px-6">Audience Size</th>
									<th className="py-4 px-6">Budget Size</th>
									<th className="py-4 px-6">CPM</th>
									<th className="py-4 px-6">Audience</th>
									<th className="py-4 px-6">Frequency</th>
									<th className="py-4 px-6">Reach</th>
								</tr>
							</thead>
							<tbody className="whitespace-nowrap">
								{channels.map((channel, index) => (
									<React.Fragment key={index}>
										{/* Parent Row */}
										<tr key={index} className="border-t bg-white hover:bg-gray-100">
											<td className="py-6 px-6 text-[15px]">
												<span
													className="flex items-center gap-2 text-[#0866FF] cursor-pointer"
													onClick={() => toggleRow(index)}
												>
													{channel.hasChildren && (
														<span>
															<svg
																width="17"
																height="16"
																viewBox="0 0 17 16"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<path
																	d="M5.38021 6.66667L8.71354 10L12.0469 6.66667"
																	stroke="#061237"
																	strokeOpacity="0.8"
																	strokeWidth="1.33333"
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	transform={expandedRows[index] ? "rotate(180 8.5 8)" : ""}
																/>
															</svg>
														</span>
													)}
													<span className="relative w-[16px] h-[16px]">
														<Image src={channel.icon} fill alt="Facebook Icon" />
													</span>
													<span>{channel.name}</span>
												</span>
											</td>
											<td className="py-6 px-6">{channel.audience}</td>
											<td className="py-6 px-6">{channel.startDate}</td>
											<td className="py-6 px-6">{channel.endDate}</td>
											<td className="py-6 px-6">{channel.audienceSize}</td>
											<td className="py-6 px-6">{channel.budgetSize}</td>
											<td className="py-6 px-6">
												<div className="cpm_bg">CPM</div>
											</td>
											<td className="py-6 px-6">{channel.audience}</td>
											<td className="py-6 px-6">
												<input
													type="text"
													placeholder="Enter Frequency"
													className="bg-transparent border-none outline-none w-full"
												/>
											</td>
											<td className="py-6 px-6">{channel.reach}</td>
										</tr>

										{/* Sub-table (Expanded Rows) */}
										{expandedRows[index] && (
											<>
												{campaignData.phases.awareness.channels.map((awareness, index) => (
													<tr key={index} className="bg-white">
														<td className="py-6 px-6 border-none">
															<div className='flex gap-2'>
																<span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
																	{index + 1}.</span>
																<span>{awareness.channel}</span>
															</div>
														</td>
														<td className="!py-0 px-6 border-none">{awareness.audience} </td>
														<td className="!py-0 px-6 border-none">{awareness.startDate} </td>
														<td className="!py-0 px-6 border-none">{awareness.endDate}  </td>
														<td className="!py-0 px-6 border-none">{awareness.audienceSize}  </td>
														<td className="!py-0 px-6 border-none">{awareness.budget}  </td>
														<td className="!py-0 px-6 border-none"><div className="cpm_bg"> {awareness.cpm}</div>  </td>
														<td className="!py-0 px-6 border-none">{awareness.audience} </td>
														<td className="!py-0 px-6 border-none">{awareness.frequency}  </td>
														<td className="!py-0 px-6 border-none">{awareness.reach}</td>
													</tr>
												))}

											</>
										)}
									</React.Fragment>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>
			<section className="mt-9">

				<div className='flex items-center gap-3 mb-5'>
					<Image src={zoom} alt="zoom" />
					<h1 className="text-[#061237] text-[18px] font-[600]  flex gap-2">
						Consideration
					</h1>
				</div>

				<div className=" rounded-xl border border-[#E5E5E5]">
					<div className="rounded-xl overflow-x-auto">
						<table className="table">
							{/* Table Head */}
							<thead>
								<tr className="">
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Channel
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Audience
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Start Date
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										End Date
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Audience Size
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Budget Size (€)
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										CPM (€)
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Impressions
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Frequency
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Reach
									</th>
								</tr>
							</thead>

							{/* Table Body */}
							<tbody className="whitespace-nowrap">
								{/* Row 1 */}
								{channels.map((channel, index) => {
									return (
										<tr key={index} className="py-6">
											<td className="py-6 px-6 text-[15px]">
												<span className="flex items-center gap-2 text-[#0866FF]">
													{channel.hasChildren && (
														<span>
															<svg
																width="17"
																height="16"
																viewBox="0 0 17 16"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<path
																	d="M5.38021 6.66667L8.71354 10L12.0469 6.66667"
																	stroke="#061237"
																	strokeOpacity="0.8"
																	strokeWidth="1.33333"
																	strokeLinecap="round"
																	strokeLinejoin="round"
																/>
															</svg>
														</span>
													)}
													<span className="relative w-[16px] h-[16px]">
														<Image
															src={channel.icon}
															fill
															alt="Facebook Icon"
														/>
													</span>
													<span>{channel.name}</span>
												</span>
											</td>
											<td className="py-6 px-6">{channel.audience}</td>
											<td className="py-6 px-6">{channel.startDate}</td>
											<td className="py-6 px-6">{channel.endDate}</td>
											<td className="py-6 px-6">
												{channel.audienceSize}
											</td>
											<td className="py-6 px-6">{channel.budgetSize}</td>
											<td className="py-6 px-6">
												<input
													type="text"
													name=""
													id=""
													placeholder="Enter CPM"
													className="bg-transparent border-none outline-none w-full"
												/>
											</td>
											<td className="py-6 px-6">{channel.audience}</td>
											<td className="py-6 px-6">
												<input
													type="text"
													name=""
													id=""
													placeholder="Enter Frequency"
													className="bg-transparent border-none outline-none w-full"
												/>
											</td>
											<td className="py-6 px-6">{channel.reach}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</section>
			<section className="mt-9">
				<div className='flex items-center gap-3 mb-5'>
					<Image src={credit} alt="credit" />
					<h1 className="text-[#061237] text-[18px] font-[600]  flex gap-2">
						Conversion
					</h1>
				</div>

				<div className=" rounded-xl border border-[#E5E5E5]">
					<div className="rounded-xl overflow-x-auto">
						<table className="table">
							{/* Table Head */}
							<thead>
								<tr className="">
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Channel
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Audience
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Start Date
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										End Date
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Audience Size
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Budget Size (€)
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										CPM (€)
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Impressions
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Frequency
									</th>
									<th className="text-[#667085] py-3 px-6 text-[14px] font-[600]">
										Reach
									</th>
								</tr>
							</thead>

							{/* Table Body */}
							<tbody className="whitespace-nowrap">
								{/* Row 1 */}
								{channels.map((channel, index) => {
									<React.Fragment key={index}>
										return (
										<tr key={index} className="py-6">
											<td className="py-6 px-6 text-[15px]">
												<span className="flex items-center gap-2 text-[#0866FF]">
													{channel.hasChildren && (
														<span>
															<svg
																width="17"
																height="16"
																viewBox="0 0 17 16"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
															>
																<path
																	d="M5.38021 6.66667L8.71354 10L12.0469 6.66667"
																	stroke="#061237"
																	strokeOpacity="0.8"
																	strokeWidth="1.33333"
																	strokeLinecap="round"
																	strokeLinejoin="round"
																/>
															</svg>
														</span>
													)}
													<span className="relative w-[16px] h-[16px]">
														<Image
															src={channel.icon}
															fill
															alt="Facebook Icon"
														/>
													</span>
													<span>{channel.name}</span>
												</span>
											</td>
											<td className="py-6 px-6">{channel.audience}</td>
											<td className="py-6 px-6">{channel.startDate}</td>
											<td className="py-6 px-6">{channel.endDate}</td>
											<td className="py-6 px-6">
												{channel.audienceSize}
											</td>
											<td className="py-6 px-6">{channel.budgetSize}</td>
											<td className="py-6 px-6">
												<input
													type="text"
													name=""
													id=""
													placeholder="Enter CPM"
													className="bg-transparent border-none outline-none w-full"
												/>
											</td>
											<td className="py-6 px-6">{channel.audience}</td>
											<td className="py-6 px-6">
												<input
													type="text"
													name=""
													id=""
													placeholder="Enter Frequency"
													className="bg-transparent border-none outline-none w-full"
												/>
											</td>
											<td className="py-6 px-6">{channel.reach}</td>
										</tr>
										);
									</React.Fragment>
								})}
							</tbody>
						</table>
					</div>
				</div>
			</section>
		</div>
	)
}

export default TableView

