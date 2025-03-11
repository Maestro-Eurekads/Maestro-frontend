import React, { useState } from 'react'
import PlatformSpending from '../../../../components/PlatformSpending'
import DoughnutChat from '../../../../components/DoughnutChat'
import down from '../../../../public/down.svg';
import Image from 'next/image'
import PhasedistributionProgress from '../../../../components/PhasedistributionProgress';
import ChannelDistributionChatOne from '../../../../components/ChannelDistribution/ChannelDistributionChatOne';
import CampaignPhases from '../CampaignPhases';

const ConfigureBudgetComponet = ({ show, t1, t2 }) => {
	const [open, setOpen] = useState(false);
	const [opens, setOpens] = useState(false);

	return (
		<div>
			{show &&
				<div className="w-[100%] items-start p-[24px] gap-[8px] bg-white border border-[rgba(6,18,55,0.1)] rounded-[8px] box-border  mt-[20px]">
					<div className='allocate_budget_phase'>
						<div className='allocate_budget_phase_one'>
							{t1 &&
								<h3 className="  font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
									{t1}</h3>}
							{t2 &&
								<p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
									Here is a percentage of the total budget allocated
									to each campaign phase.
									{t2}
								</p>}

							<div className='flex items-center gap-5'>
								<div className='mt-[16px]'>
									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Total budget
									</p>

									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">12,000 €</h3>
								</div>
								<div className='mt-[16px]'>
									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Campaign phases
									</p>

									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">3 phases</h3>
								</div>
							</div>


							<div className='campaign_phases_container mt-[24px]'>
								<div className='campaign_phases_container_one'>
									<DoughnutChat />
								</div>
								{/* Campaign Phases */}
								<CampaignPhases />
							</div>

							{/* Phase distribution */}
							<div className="mr-[62px] mt-8 ">
								<button
									onClick={() => setOpen(!open)}
									className="flex flex-row items-center p-0 gap-2 h-[24px] font-[600] text-[18px] leading-[24px] text-[#061237]"
								>
									<Image
										src={down}
										alt="down"
										className={`transition-transform duration-300 ${open ? "rotate-0" : "-rotate-90"}`}
									/>
									Phase distribution
								</button>



								{open &&
									<PhasedistributionProgress />}

							</div>
						</div>



						<div className='allocate_budget_phase_two'>
							<button
								onClick={() => setOpens(!opens)}
								className="flex flex-row items-center p-0 gap-2 h-[24px] font-[600] text-[18px] leading-[24px] text-[#061237]"
							>
								<Image
									src={down}
									alt="down"
									className={`transition-transform duration-300 ${opens ? "rotate-0" : "-rotate-90"}`}
								/>
								Channel distribution
							</button>


							{/* <p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
								Graph showing the total budget spent and its breakdown across the three phases.
							</p> */}
							{opens &&
								<div className='mt-[16px]'>
									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Channels
									</p>

									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">6</h3>
								</div>}

							{/* <PlatformSpending /> */}
							{opens && <ChannelDistributionChatOne />}

						</div>

					</div>
				</div>}
		</div>
	)
}

export default ConfigureBudgetComponet