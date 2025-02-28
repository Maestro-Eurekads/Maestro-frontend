// components/MapFunnelStages.tsx
import React from 'react';
import Image from "next/image";
import speaker from '../../../public/mdi_megaphone.svg';
import zoom from '../../../public/tabler_zoom-filled.svg';
import credit from '../../../public/mdi_credit-card.svg';
import addPlus from '../../../public/addPlus.svg';
import PageHeaderWrapper from '../../../components/PageHeaderWapper';
import { useObjectives } from '../../utils/useObjectives';


// const awarenessStages = [
// 	{ id: 1, icon: speaker, label: "Awareness", bgColor: "bg-blue-500" },
// 	{ id: 2, icon: zoom, label: "Consideration", bgColor: "bg-green-500" },
// 	{ id: 3, icon: credit, label: "Conversion", bgColor: "bg-yellow-500" },
// 	{ id: 4, icon: addPlus, label: "Loyalty", bgColor: "bg-red-500" },
// ];

const MapFunnelStages = () => {
	const { selectedFunnels, setSelectedFunnels } = useObjectives();

	// Toggle selection logic
	const handleSelect = (id: number) => {
		setSelectedFunnels((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	return (
		<div>
			<PageHeaderWrapper
				t1={'How many funnel stage(s) would you like to activate to achieve your objective ?'}
				t2={'This option is available only if you selected any of the following main objectives: '}
				t3={'Traffic, Purchase, Lead Generation, or App Install.'} />


			<div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
				{/* Awareness */}
				<button
					className={`cursor-pointer awareness_card_one ${selectedFunnels.includes(1) ? "awareness_card_one_active" : ""
						}`}
					onClick={() => handleSelect(1)}
				>
					<Image src={speaker} alt="speaker" />
					<p>Awareness</p>
				</button>

				{/* Consideration */}
				<button
					className={`cursor-pointer awareness_card_two ${selectedFunnels.includes(2) ? "awareness_card_two_active" : ""
						}`}
					onClick={() => handleSelect(2)}
				>
					<Image src={zoom} alt="zoom" />
					<p>Consideration</p>
				</button>

				{/* Conversion */}
				<button
					className={`cursor-pointer awareness_card_three ${selectedFunnels.includes(3) ? "awareness_card_three_active" : ""
						}`}
					onClick={() => handleSelect(3)}
				>
					<Image src={credit} alt="credit" />
					<p>Conversion</p>
				</button>

				{/* Loyalty */}
				<button
					className={`cursor-pointer awareness_card_four ${selectedFunnels.includes(4) ? "awareness_card_four_active" : ""
						}`}
					onClick={() => handleSelect(4)}
				>
					<Image src={addPlus} alt="addPlus" />
					<p>Loyalty</p>
				</button>
			</div>
			<div className="flex justify-end pr-6 mt-[50px]">
				<button
					disabled={selectedFunnels.length === 0}
					// onClick={() => handleValidate(stage.name)} // Uncomment and fix stage reference when ready
					className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg bg-[#3175FF] text-white font-semibold text-base leading-6 disabled:opacity-50 hover:bg-[#2557D6] transition-colors"
				>
					Validate
				</button>
			</div>
		</div>
	);
};

export default MapFunnelStages;