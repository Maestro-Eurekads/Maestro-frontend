import React, { useState } from 'react'
import Image from "next/image";
import Mark from '../../../public/Mark.svg';
import PageHeaderWrapper from '../../../components/PageHeaderWapper';
import { campaignObjectives } from '../../../components/data';


const YourCampaign = () => {
	const [selectedObjectives, setSelectedObjectives] = useState<number[]>([]);

	// Toggle selection
	const handleSelect = (id: number) => {
		setSelectedObjectives((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
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
							className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 ${isSelected ? "creation_card_active shadow-lg" : "creation_card"
								}`}
							onClick={() => handleSelect(item.id)}
						>
							{/* Show checkmark if selected */}
							{isSelected && (
								<div className="absolute right-4 top-4">
									<Image src={Mark} alt="Selected" />
								</div>
							)}

							{/* Icon + Title */}
							<div className="flex items-center gap-2">
								<Image src={item.icon} alt={item.title} />
								<h6 className="text-[18px] font-semibold text-[#061237]">{item.title}</h6>
							</div>

							{/* Description */}
							<p className="text-[15px] font-medium text-[#061237] leading-[175%]">
								{item.description}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	)
}

export default YourCampaign