// YourCampaign.tsx
import React, { useEffect } from 'react';
import Image from 'next/image';
import Mark from '../../../public/Mark.svg';
import PageHeaderWrapper from '../../../components/PageHeaderWapper';
import { campaignObjectives } from '../../../components/data';
import AlertMain from '../../../components/Alert/AlertMain';
import { useObjectives } from '../../utils/useObjectives';

const DefineCampaignObjective = () => {
	const { selectedObjectives, setSelectedObjectives } = useObjectives();

	// Toggle selection and enforce single selection
	const handleSelect = (id: number) => {
		setSelectedObjectives((prev) => {
			if (prev.includes(id)) {
				return []; // Deselect if already selected
			}
			return [id]; // Select only this id
		});
	};


	return (
		<div>
			<PageHeaderWrapper
				t1={'What is the main objective of your campaign ?'}
				t2={'Please select only one objective.'}
			/>

			<div className="flex flex-wrap gap-[80px] mt-[50px]">
				{campaignObjectives.map((item) => {
					const isSelected = selectedObjectives.includes(item.id);

					return (
						<div
							key={item.id}
							className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 ${isSelected ? 'creation_card_active shadow-lg' : 'creation_card'
								}`}
							onClick={() => handleSelect(item.id)}
						>
							{isSelected && (
								<div className="absolute right-4 top-4">
									<Image src={Mark} alt="Selected" />
								</div>
							)}
							<div className="flex items-center gap-2">
								<Image src={item.icon} alt={item.title} />
								<h6 className="text-[18px] font-semibold text-[#061237]">{item.title}</h6>
							</div>
							<p className="text-[15px] font-medium text-[#061237] leading-[175%]">
								{item.description}
							</p>
						</div>
					);
				})}
			</div>
			<div className="flex justify-end pr-6 mt-[20px]">
				<button
					disabled={selectedObjectives.length === 0}
					// onClick={() => handleValidate(stage.name)} // Uncomment and fix stage reference when ready
					className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg bg-[#3175FF] text-white font-semibold text-base leading-6 disabled:opacity-50 hover:bg-[#2557D6] transition-colors"
				>
					Validate
				</button>
			</div>
		</div>
	);
};

export default DefineCampaignObjective;