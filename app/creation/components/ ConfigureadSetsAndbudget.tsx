import React, { useState } from 'react'
import PageHeaderWrapper from '../../../components/PageHeaderWapper'
import Topdown from '../../../public/Top-down.svg';
import Selectstatus from '../../../public/Select-status.svg';
import backdown from '../../../public/back-down.svg';
import ecurrencyeur from '../../../public/e_currency-eur.svg';
import Image from 'next/image'
import PlatformSpending from '../../../components/PlatformSpending';



const ConfigureAdSetsAndBudget = () => {
	const [active, setActive] = useState(1); // Default to 1 or 2
	const [show, setShow] = useState(false);

	return (
		<div>
			<PageHeaderWrapper
				t1="Allocate your campaign budget"
				t2="Decide whether to allocate your budget by channel or ad set. First, enter an overall campaign budget if applicable."
				t3="Then, distribute it across channels and ad sets."
				t4="Choose how to set your campaign budget"
				span={1}
			/>

			<div className='mt-[24px] flex gap-5'>
				{/* Top-down Option */}
				<div
					className={active === 1 ? "top_and_bottom_down_container_active relative" : "top_and_bottom_down_container relative"}
					onClick={() => setActive(1)}
				>
					<div className="flex items-start gap-2">
						{active === 2 ?

							<Image src={backdown}
								alt="backdown"
								className={"rotate-180 transform"}
							/>
							:
							<Image
								src={Topdown}
								alt="Topdown"
								className={`${active ? "rotate-30 transform" : ""}`}
							/>
						}

						<div>
							<h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
								Top-down
							</h3>
							<p className="font-medium whitespace-nowrap text-[13px] leading-[175%] flex items-center text-[rgba(6,18,55,0.8)]">
								Ideal if you have a fixed overall budget.
							</p>
						</div>
					</div>
					{active === 1 && (
						<div className="absolute right-2 top-2">
							<Image src={Selectstatus} alt="Selectstatus" />
						</div>
					)}
				</div>

				{/* Bottom-up Option */}
				<div
					className={active === 2 ? "top_and_bottom_down_container_active relative" : "top_and_bottom_down_container relative"}
					onClick={() => setActive(2)}
				>
					<div className="flex items-start gap-2">
						{active === 2 ?

							<Image
								src={Topdown}
								alt="Topdown"
								className={`${active === 2 ? "rotate-180 transform" : ""}`}
							/>
							: <Image src={backdown} alt="backdown" />}

						<div>
							<h3 className="font-semibold whitespace-nowrap text-[15px] leading-[175%] flex items-center text-[#061237]">
								Bottom-up
							</h3>
							<p className="font-medium whitespace-nowrap text-[13px] leading-[175%] flex items-center text-[rgba(6,18,55,0.8)]">
								Perfect for precise control over spending.
							</p>
						</div>
					</div>
					{active === 2 && (
						<div className="absolute right-2 top-2">
							<Image src={Selectstatus} alt="Selectstatus" />
						</div>
					)}
				</div>
			</div>


			<div className='  mt-8 flex flex-row items-center gap-[16px] px-0 py-[24px] bg-[#F9FAFB] border-b border-[rgba(6,18,55,0.1)] box-border'>
				<div className="e_currency-eur">
					<div className='flex'>
						<Image src={ecurrencyeur} alt="e_currency-eur" />
						<h3> 12,000,00</h3>
					</div>
					<div>
						EUR
					</div>
				</div>
				<div >

					<p className="  font-[600] text-[15px] leading-[20px] text-[#00A36C]">
						Remaining budget: 12 000
					</p>

				</div>
			</div>

			<div>
				<div className='flex justify-between items-baseline'>
					<PageHeaderWrapper
						t4="Allocate your budget across channels and ad sets of each phase"
						span={2} t1={''} t2={''} />

					<button onClick={() => setShow(!show)}>
						<p className="   font-semibold text-[16px] leading-[22px] flex items-center underline text-[#061237]    ">
							Hide your budget overview
						</p>
					</button>
				</div>

				{show &&
					<div className="w-[100%]    items-start p-[24px] gap-[8px] bg-white border border-[rgba(6,18,55,0.1)] rounded-[8px] box-border  mt-[20px]">
						<div className='allocate_budget_phase'>
							<div className='allocate_budget_phase_one'>

							</div>
							<div className='allocate_budget_phase_two'>
								<h3 className="  font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">Channel distribution</h3>
								<p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
									Graph showing the total budget spent and its breakdown across the three phases.
								</p>

								<div className='mt-[16px]'>
									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Channels
									</p>

									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">6 channels</h3>
								</div>

								<PlatformSpending />

								{/* <div className='flex flex-col gap-[10px]'>
									<div className='flex justify-between items-center mt-[24px]'>
										<div>
											<p>Facebook</p>
										</div>
										<div className="w-[72px] h-[29px] flex flex-row justify-center items-center p-[5px] px-[12px] gap-[8px]   bg-[#E8F6FF] border border-[rgba(49,117,255,0.1)] rounded-[50px]">
											<p className=" font-semibold text-[14px] leading-[19px] text-[#3175FF] order-0 flex-none">
												4 200 €
											</p>
										</div>
									</div>
									<div>
										<ThreeValuesProgress values={[50, 35, 25]} />
									</div>
									<div className='flex justify-between items-center mt-[10px]'>
										<div className='flex items-center gap-2'>
											<div className="w-[12px] h-[12px] bg-[#3175FF] rounded-[4px]"></div>
											<p className="   font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
												Awareness (37%)
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
												Conversion (40%)
											</p>
										</div>
									</div>
								</div> */}
							</div>

						</div>
					</div>}


			</div>

		</div>
	);
};

export default ConfigureAdSetsAndBudget;
