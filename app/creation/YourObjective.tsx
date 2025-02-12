import React from 'react'
import Image from "next/image";
import speaker from '../../public/mdi_megaphone.svg';
import zoom from '../../public/tabler_zoom-filled.svg';
import credit from '../../public/mdi_credit-card.svg';
import addPlus from '../../public/addPlus.svg';

const YourObjective = () => {
	return (
		<div>
			<div >
				<h1 className="font-general-sans font-semibold text-[24px] leading-[32px] text-[#292929]"
				>How many funnel stage(s) would you like to activate to achieve your objective ?</h1>
				<p className="font-general-sans font-medium text-[16px] leading-[22px] text-[rgba(0,0,0,0.9)] mt-2">
					This option is available only if you selected any of the following main objectives: </p>
						<p className="font-general-sans font-medium text-[16px] leading-[22px] text-[rgba(0,0,0,0.9)]">
				  Traffic, Purchase, Lead Generation, or App Install.</p>
						</div>
					
					<div className='flex flex-col justify-center items-center gap-[32px] mt-[56px]'> 
						<div className='awareness_card_one'>
							<Image src={speaker} alt="menu" />
							<p>Awareness</p>
						</div>
						<div className='awareness_card_two'>
							<Image src={zoom} alt="menu" />
							<p>Consideration</p>
						</div>
						<div className='awareness_card_three'> 
							<Image src={credit} alt="menu" />
							<p>Conversion</p>
						</div>
						<div className='awareness_card_four'>
							<Image src={addPlus} alt="menu" />
							<p>Loyalty</p>
						</div>
					</div>
		</div>
	)
}

export default YourObjective