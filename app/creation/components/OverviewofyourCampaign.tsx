import React, { useState } from 'react'
import PageHeaderWrapper from '../../../components/PageHeaderWapper'
import DateComponent from './molecules/date-component/date-component';
import youtube from "../../../public/youtube.svg";
import facebook from "../../../public/facebook.svg";
import TheTradeDesk from "../../../public/TheTradeDesk.svg";
import instagram from "../../../public/ig.svg";
import Image from "next/image";
import ConfigureBudgetComponet from './ConfigureAdSetsAndBudget/ConfigureBudgetComponet';
import { BsFillMegaphoneFill } from 'react-icons/bs';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

const OverviewofyourCampaign = () => {
	const [expanded, setExpanded] = useState(false);
	// const { range, setRange } = useDateRange();
	const [show, setShow] = useState(false);
	const [open, setOpen] = useState(false);

	return (
		<div>
			<div className="creation_continer">
				<PageHeaderWrapper
					t1="Campaign summary"
					t2="Final review of your campaign's budget allocation across phases and channels."
				/>

				<div >
					<button className="overview-budget-conponent mt-8"
						onClick={() => setShow(!show)}>{!show ? "See" : "Hide"} budget overview</button>

					<ConfigureBudgetComponet show={show} t1={"Your budget by campaign phase"} t2={undefined} />
				</div>



				<div className='mt-[20px]'>
					<span className="w-[68px] h-[19px] font-[600] text-[14px] leading-[19px] text-[#061237]">
						Comment
					</span>

					<textarea
						className="w-[600px] h-[128px] flex flex-col justify-center items-end p-4 pb-20 gap-12 bg-white border border-gray-300 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-[8px]"
						placeholder="Write your comment">
					</textarea>
				</div>
			</div>
			<div>

				<div className='mt-[30px]'>
					<DateComponent useDate={false} />
				</div>
				<div className="w-[100%] min-h-[494px] bg-[none] bg-[linear-gradient(to_right,_rgba(0,0,0,0.1)_1px,_transparent_0.2px)] bg-[size:60px_100%]">
					<div className="ml-[82px]">

						<button onClick={() => setOpen(!open)} className="mt-5 max-w-[732px] w-full flex items-center rounded-[10px] text-[17px] font-[500] bg-[#3175FF] text-white p-3 text-center">
							<div className="flex items-center justify-center gap-3 flex-1">
								<span>
									<svg
										width="23"
										height="22"
										viewBox="0 0 23 22"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M11.7096 14.6667H4.3763C3.89007 14.6667 3.42376 14.4735 3.07994 14.1297C2.73612 13.7859 2.54297 13.3196 2.54297 12.8334V9.16669C2.54297 8.68046 2.73612 8.21414 3.07994 7.87032C3.42376 7.52651 3.89007 7.33335 4.3763 7.33335H5.29297V3.66669C5.29297 3.42358 5.38955 3.19043 5.56145 3.01852C5.73336 2.84661 5.96652 2.75 6.20964 2.75H8.04297C8.28608 2.75 8.51924 2.84661 8.69115 3.01852C8.86306 3.19043 8.95964 3.42358 8.95964 3.66669V7.33335H11.7096L16.293 3.66669V18.3334L11.7096 14.6667ZM20.418 11C20.418 9.4325 19.538 8.0116 18.1263 7.33335V14.6667C19.5288 13.9792 20.418 12.5583 20.418 11Z"
											fill="#FFFFFF"
										/>
									</svg>
								</span>
								<span>Awareness</span>
								{open ? <FiChevronUp /> : <FiChevronDown />}

							</div>
							<button className="justify-self-end px-3 py-[10px] text-[16px] text-base font-[500] bg-white/25 rounded-[5px]">
								6,000 €
							</button>

						</button>
						{open && <div className="ml-[56px]">
							<div className="">
								<div className="py-3 bg-[#0866FF33] text-[#0866FF] text-[15px] font-[500] border border-[#0866FF33] my-5 max-w-[284px] w-full rounded-[10px] flex items-center justify-between">
									<span className="flex items-center gap-3 pl-3 ml-14">
										<span className="relative w-[16px] h-[16px]">
											<Image src={facebook} fill alt="Facebook" />
										</span>
										<span>Facebook</span>
									</span>
									<button className="bg-[#0866FF33]/5 py-2 px-[10px] text-base rounded-[5px] mr-3">
										1,800 €
									</button>
								</div>
								<button className="bg-[#EBFEF4] py-[10px] px-3 rounded-[10px] border border-[#00A36C1A] text-[#00A36C] flex gap-2">
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
												d="M5.375 7.04167L8.70833 10.375L12.0417 7.04167"
												stroke="#00A36C"
												strokeWidth="1.33333"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</span>
								</button>
							</div>

							{/* Instagram */}
							<div className="ml-[291px]">
								<div className="py-3 bg-[#FEF1F8] text-[#E01389] text-[15px] font-[500] border border-[#E0138933] mt-5 mb-1 max-w-[371px] w-full rounded-[10px] flex items-center justify-between">
									<span className="flex items-center gap-3 pl-3 mx-auto">
										<span className="relative w-[16px] h-[16px]">
											<Image src={instagram} fill alt="Instagram" />
										</span>
										<span>Instagram</span>
									</span>
									<button className="bg-[#0866FF33]/5 py-2 px-[10px] text-base rounded-[5px] mr-3">
										1,800 €
									</button>
								</div>
								<button className="bg-[#EBFEF4] py-[10px] px-3 rounded-[10px] border border-[#00A36C1A] text-[#00A36C] flex gap-2">
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
												d="M5.375 7.04167L8.70833 10.375L12.0417 7.04167"
												stroke="#00A36C"
												strokeWidth="1.33333"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</span>
								</button>
							</div>

							{/* Youtube */}
							<div className="">
								<div className="py-3 bg-[#FFF0F0] text-[#E01389] text-[15px] font-[500] border border-[#E0138933] mt-5 mb-1 max-w-[513px] w-full rounded-[10px] flex items-center justify-between">
									<span className="flex items-center gap-3 pl-3 mx-auto">
										<span className="relative w-[16px] h-[16px]">
											<Image src={youtube} fill alt="Youtube" />
										</span>
										<span>Youtube</span>
									</span>
									<button className="bg-[#0866FF33]/5 py-2 px-[10px] text-base rounded-[5px] mr-3">
										1,200 €
									</button>
								</div>
								<button className="bg-[#EBFEF4] py-[10px] px-3 rounded-[10px] border border-[#00A36C1A] text-[#00A36C] flex gap-2">
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
												d="M5.375 7.04167L8.70833 10.375L12.0417 7.04167"
												stroke="#00A36C"
												strokeWidth="1.33333"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</span>
								</button>
							</div>

							{/* The TradeDesk */}
							<div className="ml-[291px]">
								<div className="py-3 bg-[#F0F9FF] text-[#0099FA] text-[15px] font-[500] border border-[#0099FA33] mt-5 mb-1 max-w-[371px] w-full rounded-[10px] flex items-center justify-between">
									<span className="flex items-center gap-3 pl-3 mx-auto">
										<span className="relative w-[16px] h-[16px]">
											<Image src={TheTradeDesk} fill alt="TheTradeDesk" />
										</span>
										<span>TheTradeDesk</span>
									</span>
									<button className="bg-[#0866FF33]/5 py-2 px-[10px] text-base rounded-[5px] mr-3">
										900 €
									</button>
								</div>
								<button className="bg-[#EBFEF4] py-2 px-3 rounded-[10px] border border-[#00A36C1A] text-[#00A36C] flex gap-2">
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
												d="M5.375 7.04167L8.70833 10.375L12.0417 7.04167"
												stroke="#00A36C"
												strokeWidth="1.33333"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</span>
								</button>
							</div>
						</div>}

					</div>
				</div>
			</div>

		</div>
	)
}

export default OverviewofyourCampaign
