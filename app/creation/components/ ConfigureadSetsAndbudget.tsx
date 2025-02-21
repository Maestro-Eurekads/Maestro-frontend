import React, { useState } from 'react';
import PlatformSpending from '../../../components/PlatformSpending';
import ConfiguredSetPage from './ConfiguredSetPage';
import CampaignBudget from './CampaignBudget';
import PageHeaderWrapper from '../../../components/PageHeaderWapper';
import DoughnutChat from '../../../components/DoughnutChat';

const ConfigureAdSetsAndBudget = () => {

	const [show, setShow] = useState(false); // Start with budget shown 



	return (
		<div>
			<CampaignBudget />
			<div>
				<div className="flex justify-between items-baseline">
					<PageHeaderWrapper
						t4="Allocate your budget across channels and ad sets of each phase"
						span={2} t1={''} t2={''} />

					<button onClick={() => setShow(!show)}>
						<p className="font-semibold text-[16px] leading-[22px] flex items-center underline text-[#061237]">
							{show ? "Hide your budget overview" : "Show your budget overview"}
						</p>
					</button>
				</div>

				{show && (
					<div className="w-[100%] items-start p-[24px] gap-[8px] bg-white border border-[rgba(6,18,55,0.1)] rounded-[8px] box-border mt-[20px]">
						<div className="allocate_budget_phase">
							<div className="allocate_budget_phase_one">
								<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
									Your budget by campaign phase
								</h3>
								<p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
									Here is a percentage of the total budget allocated to each campaign phase.
								</p>
								<div className="flex items-center gap-5 mt-[16px]">
									<div>
										<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
											Total budget
										</p>
										<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
											12 000 €
										</h3>
									</div>
									<div>
										<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
											Campaign phases
										</p>
										<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
											3 phases
										</h3>
									</div>
								</div>

								<div className="campaign_phases_container mt-[24px]">
									<div className="campaign_phases_container_one">
										<DoughnutChat />
									</div>
									<div className='campaign_phases_container_two flex flex-col gap-[28px]'>
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
							<div className="allocate_budget_phase_two">
								<h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
									Channel distribution
								</h3>
								<p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
									Graph showing the total budget spent and its breakdown across the three phases.
								</p>
								<div className="mt-[16px]">
									<p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
										Channels
									</p>
									<h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
										6 channels
									</h3>
								</div>
								<PlatformSpending />
							</div>
						</div>
					</div>
				)}
				<ConfiguredSetPage />
			</div>
		</div>
	);
};

export default ConfigureAdSetsAndBudget;
