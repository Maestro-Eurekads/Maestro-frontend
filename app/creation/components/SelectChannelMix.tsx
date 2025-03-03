"use client"
import React, { useState } from 'react'
import Image from "next/image";
import up from '../../../public/arrow-down.svg';
import down2 from '../../../public/arrow-down-2.svg';
import checkmark from "../../../public/mingcute_check-fill.svg";
import PageHeaderWrapper from '../../../components/PageHeaderWapper';
import { funnelStages } from '../../../components/data';

const SelectChannelMix = () => {
	// Controls expanded/collapsed state for each stage
	const [openItems, setOpenItems] = useState({ Awareness: true });
	// Tracks selected platforms per stage (per category)
	const [selected, setSelected] = useState({});
	// Tracks whether a stage has been validated/submitted
	const [validatedStages, setValidatedStages] = useState({});

	const toggleItem = (stage) => {
		setOpenItems((prev) => ({
			...prev,
			[stage]: !prev[stage],
		}));
	};

	const togglePlatform = (stageName, category, platformName) => {
		// Prevent toggling if already validated
		if (validatedStages[stageName]) return;

		setSelected((prev) => {
			const stageSelection = prev[stageName] || {};
			const categorySelection = stageSelection[category] || [];
			const isAlreadySelected = categorySelection.includes(platformName);
			const newCategorySelection = isAlreadySelected
				? categorySelection.filter((p) => p !== platformName)
				: [...categorySelection, platformName];

			return {
				...prev,
				[stageName]: {
					...stageSelection,
					[category]: newCategorySelection,
				},
			};
		});
	};

	// A stage is valid if every required category has at least one selection
	const isStageValid = (stageName) => {
		const stageSelections = selected[stageName] || {};
		return (
			stageSelections["Social media"] &&
			stageSelections["Social media"].length > 0 &&
			stageSelections["Display networks"] &&
			stageSelections["Display networks"].length > 0 &&
			stageSelections["Search engines"] &&
			stageSelections["Search engines"].length > 0
		);
	};

	const handleValidate = (stageName) => {
		if (isStageValid(stageName)) {
			setValidatedStages((prev) => ({
				...prev,
				[stageName]: true,
			}));
		}
	};

	const handleEdit = (stageName) => {
		setValidatedStages((prev) => ({
			...prev,
			[stageName]: false,
		}));
	};

	return (
		<div>
			<PageHeaderWrapper
				t1={'Which platforms would you like to activate for each funnel stage?'}
				t2={'Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time.'}
				span={1}
			/>

			<div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
				{funnelStages.map((stage, index) => (
					<div key={index}>
						<div
							className="flex justify-between items-center p-6 gap-3 w-[968px] h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] rounded-t-[10px]"
							onClick={() => toggleItem(stage.name)}
						>
							<div className="flex items-center gap-2">
								<Image src={stage.icon} alt={stage.name} />
								<p className="w-[119px] h-[24px] font-[General Sans] font-bold text-[18px] leading-[24px] text-[#061237]">
									{stage.name}
								</p>
							</div>
							{validatedStages[stage.name] ? (
								<div className="flex items-center gap-2">
									<Image
										className="w-5 h-5 rounded-full p-1 bg-green-500"
										src={checkmark}
										alt="Completed"
									/>
									<p className="text-green-500 font-semibold">Completed</p>
								</div>
							) : stage.statusIsActive ? (
								<p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]">
									{stage.status}
								</p>
							) : (
								<p className="mx-auto w-[86px] h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237] opacity-50">
									Not started
								</p>
							)}
							<div>
								{openItems[stage.name] ? (
									<Image src={up} alt="up" />
								) : (
									<Image src={down2} alt="down" />
								)}
							</div>
						</div>

						{openItems[stage.name] && (
							<div className="card_bucket_container_main_sub flex flex-col pb-6 w-[968px] min-h-[300px]">
								{validatedStages[stage.name] ? (
									// Read-only summary view with full card UI for each selected field, using default border styling
									<div className="mt-8 px-6">
										{Object.entries(selected[stage.name] || {}).map(([category, platformNames]) => (
											<div key={category} className="mb-8">
												<h2 className="mb-4 font-bold text-lg">{category}</h2>
												<div className="card_bucket_container flex flex-wrap gap-6">
													{Array.isArray(platformNames) && platformNames.map((platformName, idx) => {
														// Retrieve full platform data (icon and name)
														const platformData = stage.platforms[category].find(p => p.name === platformName);
														if (!platformData) return null;
														return (
															<div
																key={idx}
																className="flex flex-row justify-between items-center px-4 py-2 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
															>
																<div className="flex items-center gap-3">
																	<Image src={platformData.icon} alt={platformData.name} />
																	<p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
																		{platformData.name}
																	</p>
																</div>
															</div>
														);
													})}
												</div>
											</div>
										))}
										<div className="flex justify-end pr-[24px] mt-4">
											<button
												onClick={() => handleEdit(stage.name)}
												className="flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] bg-blue-500"
											>
												Edit
											</button>
										</div>
									</div>
								) : (
									// Selection UI with clickable cards
									<>
										{Object.entries(stage.platforms).map(([category, platforms]) => (
											<div key={category} className="card_bucket_container_main">
												<h2 className='font-bold'>{category}</h2>
												<div className="card_bucket_container flex flex-wrap gap-6">
													{platforms.map((platform, pIndex) => {
														const isSelected =
															selected[stage.name]?.[category]?.includes(platform.name);
														return (
															<div
																key={pIndex}
																className={`flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border rounded-[10px] cursor-pointer ${isSelected
																	? 'border-[#3175FF]'
																	: 'border-[rgba(0,0,0,0.1)]'
																	}`}
																onClick={() =>
																	togglePlatform(stage.name, category, platform.name)
																}
															>
																<div className="flex items-center gap-2">
																	<Image src={platform.icon} alt={platform.name} />
																	<p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
																		{platform.name}
																	</p>
																</div>
																<div className={`w-[20px] h-[20px] rounded-full flex items-center justify-center ${isSelected
																	? 'bg-[#3175FF]'
																	: 'border-[0.769px] border-[rgba(0,0,0,0.2)]'
																	}`}>
																	{isSelected && (
																		<Image
																			src={checkmark}
																			alt="selected"
																			className="w-3 h-3"
																		/>
																	)}
																</div>
															</div>
														);
													})}
												</div>
											</div>
										))}


										<div className="flex justify-end pr-[24px] mt-4">
											<button
												disabled={!isStageValid(stage.name)}
												onClick={() => handleValidate(stage.name)}
												className={`flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] ${isStageValid(stage.name)
													? 'bg-[#3175FF]'
													: 'bg-[#3175FF] opacity-50'
													}`}
											>
												Validate
											</button>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default SelectChannelMix;
