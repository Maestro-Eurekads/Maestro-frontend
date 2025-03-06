import React, { useState } from 'react';
import Image from "next/image";
import speaker from '../../../public/mdi_megaphone.svg';
import speakerWhite from '../../../public/mdi_megaphonewhite.svg';
import zoom from '../../../public/tabler_zoom-filled.svg';
import zoomWhite from '../../../public/tabler_zoom-filledwhite.svg';
import credit from '../../../public/mdi_credit-card.svg';
import creditWhite from '../../../public/mdi_credit-cardwhite.svg';
import addPlus from '../../../public/addPlus.svg';
import addPlusWhite from '../../../public/addPlusWhite.svg';
import PageHeaderWrapper from '../../../components/PageHeaderWapper';
import { useObjectives } from '../../utils/useObjectives';

const MapFunnelStages = () => {
	const { selectedFunnels, setSelectedFunnels } = useObjectives();
	const [isEditing, setIsEditing] = useState(false);
	const [hovered, setHovered] = React.useState<number | null>(null);
	const selectedFunnel: any = selectedFunnels;

	console.log('selectedFunnels', selectedFunnels);

	const funnelStages = {
		1: "Awareness",
		2: "Consideration",
		3: "Conversion",
		4: "Loyalty",
	};

	// Toggle selection logic
	const handleSelect = (id: number) => {
		if (!isEditing) return; // Prevent selection if not editing

		const stageName = funnelStages[id]; // Get name from ID
		setSelectedFunnels((prev) =>
			prev.includes(stageName) ? prev.filter((name) => name !== stageName) : [...prev, stageName]
		);
	};

	return (
		<div>
			<div className='flex items-center justify-between'>
				<PageHeaderWrapper
					t1={'How many funnel stage(s) would you like to activate to achieve your objective ?'}
					t2={`This option is available only if you've selected any of the following main objectives:`}
					t3={'Traffic, Purchase, Lead Generation, or App Install.'}
				/>

				{isEditing ? null : (
					<button className="model_button_blue" onClick={() => setIsEditing(true)}>
						Edit
					</button>
				)}
			</div>

			<div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
				{/* Awareness */}
				<button
					className={`cursor-pointer awareness_card_one 
						${selectedFunnel.includes("Awareness") ? "awareness_card_one_active" : ""} 
						${isEditing ? "" : "cursor-not-allowed"}`}
					onClick={() => handleSelect(1)}
					onMouseEnter={() => setHovered(1)}
					onMouseLeave={() => setHovered(null)}
					disabled={!isEditing}
				>
					{selectedFunnel.includes("Awareness") || hovered === 1 ? (
						<Image src={speakerWhite} alt="speakerWhite" />
					) : (
						<Image src={speaker} alt="speaker" />
					)}
					<p>Awareness</p>
				</button>

				{/* Consideration */}
				<button
					className={`cursor-pointer awareness_card_two 
						${selectedFunnel.includes("Consideration") ? "awareness_card_two_active" : ""} 
						${isEditing ? "" : "cursor-not-allowed"}`}
					onClick={() => handleSelect(2)}
					onMouseEnter={() => setHovered(2)}
					onMouseLeave={() => setHovered(null)}
					disabled={!isEditing}
				>
					{selectedFunnel.includes("Consideration") || hovered === 2 ? (
						<Image src={zoomWhite} alt="zoomWhite" />
					) : (
						<Image src={zoom} alt="zoom" />
					)}
					<p>Consideration</p>
				</button>

				{/* Conversion */}
				<button
					className={`cursor-pointer awareness_card_three 
						${selectedFunnel.includes("Conversion") ? "awareness_card_three_active" : ""} 
						${isEditing ? "" : "cursor-not-allowed"}`}
					onClick={() => handleSelect(3)}
					onMouseEnter={() => setHovered(3)}
					onMouseLeave={() => setHovered(null)}
					disabled={!isEditing}
				>
					{selectedFunnel.includes("Conversion") || hovered === 3 ? (
						<Image src={creditWhite} alt="creditWhite" />
					) : (
						<Image src={credit} alt="credit" />
					)}
					<p>Conversion</p>
				</button>

				{/* Loyalty */}
				<button
					className={`cursor-pointer awareness_card_four 
						${selectedFunnel.includes("Loyalty") ? "awareness_card_four_active" : ""} 
						${isEditing ? "" : "cursor-not-allowed"}`}
					onClick={() => handleSelect(4)}
					onMouseEnter={() => setHovered(4)}
					onMouseLeave={() => setHovered(null)}
					disabled={!isEditing}
				>
					{selectedFunnel.includes("Loyalty") || hovered === 4 ? (
						<Image src={addPlusWhite} alt="addPlusWhite" />
					) : (
						<Image src={addPlus} alt="addPlus" />
					)}
					<p>Loyalty</p>
				</button>
			</div>

			<div className="flex justify-end pr-6 mt-[50px]">
				{isEditing && (
					<button
						// disabled={selectedFunnel.length === 0}
						onClick={() => setIsEditing(false)}
						className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg bg-[#3175FF] text-white font-semibold text-base leading-6 disabled:opacity-50 hover:bg-[#2557D6] transition-colors"
					>
						Validate
					</button>
				)}
			</div>
		</div>
	);
};

export default MapFunnelStages;
