import React, { useState } from 'react'
import Image from "next/image";
import speaker from '../../../public/mdi_megaphone.svg';
import cursor from '../../../public/blue_fluent_cursor-click.svg';
import State12 from '../../../public/State12.svg';
import roundget from '../../../public/ic_round-get-app.svg';
import mingcute_basket from '../../../public/mingcute_basket-fill.svg';
import mdi_leads from '../../../public/mdi_leads.svg';
import Mark from '../../../public/Mark.svg';
import PageHeaderWrapper from '../../../components/PageHeaderWapper';


const YourCampaign = () => {
	const [selectedObjectives, setSelectedObjectives] = useState<number[]>([]);

	// Toggle selection
	const handleSelect = (id: number) => {
		setSelectedObjectives((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};
	const campaignObjectives = [
		{
			id: 1,
			icon: speaker,
			title: "Brand Awareness",
			description: "Reach as many people as possible and generate brand recall. Get people to watch your video."
		},
		{
			id: 2,
			icon: cursor,
			title: "Traffic",
			description: "Increase website visits to maximize audience reach and engagement."
		},
		{
			id: 3,
			icon: mingcute_basket,
			title: "Purchase",
			description: "Get as many people as possible to buy your product/service."
		},
		{
			id: 4,
			icon: mdi_leads,
			title: "Lead Generation",
			description: "Get as many people as possible to provide their contact information."
		},
		{
			id: 5,
			icon: roundget,
			title: "App Install",
			description: "Encourage users to download and install your mobile app."
		},
		{
			id: 6,
			icon: State12,
			title: "Video Views",
			description: "Boost the number of views on your video content to increase engagement."
		}
	];


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