import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Mark from '../../../public/Mark.svg';
import PageHeaderWrapper from '../../../components/PageHeaderWapper';
import { campaignObjectives } from '../../../components/data';
import AlertMain from '../../../components/Alert/AlertMain';
import { useObjectives } from '../../utils/useObjectives';
import { useCampaigns } from '../../utils/CampaignsContext';

const DefineCampaignObjective = () => {
	const { selectedObjectives, setSelectedObjectives } = useObjectives();
	const [isEditing, setIsEditing] = useState(false);
	const [alert, setIsAlert] = useState(false);
	const {setCampaignFormData, campaignFormData} = useCampaigns()


	const handleSelect = (id: number, title: string) => {
		setSelectedObjectives((prev) => {
			const alreadySelected = prev.some((obj) => obj.id === id);

			if (alreadySelected) {
				return []; // Deselect if already selected
			}
			return [{ id, title }]; // Store both ID & Title
		});
		setCampaignFormData((prev)=>({
			...prev,
			campaign_objectives: title
		}))
	};

	const handleAlert = () => {
		setIsAlert(true);
		setTimeout(() => {
			setIsAlert(false);
		}, 3000);
	};

	return (
		<div>
			<div className="flex items-center justify-between">
				<PageHeaderWrapper
					t1={'What is the main objective of your campaign?'}
					t2={'Please select only one objective.'}
				/>

				{isEditing ? (
					''
				) : (
					<button className="model_button_blue" onClick={() => setIsEditing(true)}>
						Edit
					</button>
				)}
			</div>
			{/* Alert Notification */}
			{/* {alert && (
				<AlertMain
					alert={{
						variant: 'info',
						message: 'Please click on Edit!',
						position: 'bottom-right',
					}}
				/>
			)} */}
			<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-[80px] mt-[50px] place-items-center">
				{campaignObjectives.map((item) => {
					const isSelected = selectedObjectives.some((obj) => obj.id === item.id);

					return (
						<div
							key={item.id}
							className={`relative p-4 rounded-lg transition-all duration-300 ${isSelected ? 'creation_card_active shadow-lg' : 'creation_card'
								} ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}
							onClick={() => (isEditing ? handleSelect(item.id, item.title) : handleAlert())}
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

			<div className="flex justify-end mt-[30px]">
				{isEditing && (
					<button
						disabled={selectedObjectives.length === 0}
						onClick={() => setIsEditing(false)}
						className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 rounded-lg bg-[#3175FF] text-white font-semibold text-base leading-6 disabled:opacity-50 hover:bg-[#2557D6] transition-colors"
					>
						Validate
					</button>
				)}
			</div>
		</div>
	);
};

export default DefineCampaignObjective;
