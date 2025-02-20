import React, { useState } from 'react'
import FiltersDropdowns from './FiltersDropdowns'
import HighlightViewDropdowns from './HighlightViewDropdowns'
import DoughnutChart from '../../../components/DoughnutChat'
import DoughnutChat from '../../../components/DoughnutChat'
import PlatformSpending from '../../../components/PlatformSpending'
import youtube from "../../../public/youtube.svg";
import facebook from "../../../public/facebook.svg";
import TheTradeDesk from "../../../public/TheTradeDesk.svg";
import instagram from "../../../public/ig.svg";
import Image from "next/image";
import DateComponent from '../../creation/components/molecules/date-component/date-component'
import WeekInterval from '../../creation/components/atoms/date-interval/WeekInterval'

const Dashboard = () => {
	const [show, setShow] = useState(false);
	const [open, setOpen] = useState(false);
	return (
		<div className='mt-[24px] '>
			<div className='flex items-center gap-3 px-[72px]'>
				<FiltersDropdowns />
				<div className="w-[24px] h-0 border border-[rgba(0,0,0,0.1)] rotate-90 self-center mt-6" />
				<HighlightViewDropdowns />
			</div>


			<div className="box-border w-full min-h-[519px] bg-white mt-[20px]">
				<div>
					<WeekInterval />
				</div>
				<div className="w-[100%] min-h-[494px] bg-[none] bg-[linear-gradient(to_right,_rgba(0,0,0,0.1)_1px,_transparent_0.2px)] bg-[size:60px_100%] relative">
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
											d="M11.7096 7.33335H4.3763C3.89007 7.33335 3.42376 7.52651 3.07994 7.87032C2.73612 8.21414 2.54297 8.68046 2.54297 9.16669V12.8334C2.54297 13.3196 2.73612 13.7859 3.07994 14.1297C3.42376 14.4735 3.89007 14.6667 4.3763 14.6667H5.29297V18.3334C5.29297 18.5765 5.38955 18.8096 5.56145 18.9815C5.73336 19.1534 5.96652 19.25 6.20964 19.25H8.04297C8.28608 19.25 8.51924 19.1534 8.69115 18.9815C8.86306 18.8096 8.95964 18.5765 8.95964 18.3334V14.6667H11.7096L16.293 18.3334V3.66669L11.7096 7.33335ZM20.418 11C20.418 12.5675 19.538 13.9884 18.1263 14.6667V7.33335C19.5288 8.02085 20.418 9.44169 20.418 11Z"
											fill="#FFFFFF"
										/>
									</svg>
								</span>{" "}
								<span>Awareness</span>{" "}
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
											stroke="#FFFFFF"
											strokeOpacity="0.8"
											strokeWidth="1.33333"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</span>
							</div>

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
									<button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
										1,800 €
									</button>
								</div>
								<button className="bg-[#EBFEF4]/50 py-[10px] px-3 border border-[#00A36C1A] text-[#00A36C]/60 flex gap-2">
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
						</div>}

					</div>
				</div>
			</div>

			<div className='flex justify-center gap-[48px]'>
				<div className="box-border flex flex-row items-start p-6 gap-[72px] w-[493px] h-[402.73px] bg-[#F9FAFB] rounded-lg">
					<div className='flex flex-col'>
						<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">Your budget by phase</h3>
						<div className='flex items-center gap-5'>
							<div className='mt-[16px]'>

								<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
									Total budget
								</p>

								<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">12 000 €</h3>
							</div>
							<div className='mt-[16px]'>
								<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
									Campaign phases
								</p>

								<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">3 phases</h3>
							</div>
						</div>


						<div className='flex items-center gap-6 mt-[24px]'>
							<div className=''>
								<DoughnutChat />
							</div>
							<div className=' flex flex-col gap-[28px]'>
								<div className='flex items-center gap-2'>
									<div className="w-[12px] h-[12px] bg-[#3175FF] rounded-[4px]"></div>
									<p className="   font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
										Awareness (25%)
									</p>
								</div>
								<div className='flex items-center gap-2'>
									<div className="w-[12px] h-[12px] bg-[#00A36C] rounded-[4px]"></div>
									<p className="   font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
										Consideration (23%)
									</p>
								</div>
								<div className='flex items-center gap-2'>
									<div className="w-[12px] h-[12px] bg-[#FF9037] rounded-[4px]"></div>
									<p className="   font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
										Conversion (25%)
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="box-border flex flex-col items-start p-6 gap-[5px] w-[493px] min-h-[545px] bg-[#F9FAFB] rounded-lg">
					<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">Your budget by channel</h3>
					<div className='mt-[16px]'>
						<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
							Channels
						</p>

						<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">6</h3>
					</div>

					<PlatformSpending />
				</div>

			</div>

		</div>
	)
}

export default Dashboard