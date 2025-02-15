import React from 'react'
import Image from "next/image";
import speaker from '../../../public/mdi_megaphone.svg';
import zoom from '../../../public/tabler_zoom-filled.svg';
import credit from '../../../public/mdi_credit-card.svg';
import addPlus from '../../../public/addPlus.svg';
import PageHeaderWrapper from '../../../components/PageHeaderWapper';

const YourObjective = () => {
	return (
		<div>
			<PageHeaderWrapper
				t1={'How many funnel stage(s) would you like to activate to achieve your objective ?'}
				t2={'This option is available only if you selected any of the following main objectives: '}
				t3={'Traffic, Purchase, Lead Generation, or App Install.'} />


			<div className='flex flex-col justify-center items-center gap-[32px] mt-[56px]'>
				<div className='awareness_card_one'>
					<Image src={speaker} alt="speaker" />
					<p>Awareness</p>
				</div>
				<div className='awareness_card_two'>
					<Image src={zoom} alt="zoom" />
					<p>Consideration</p>
				</div>
				<div className='awareness_card_three'>
					<Image src={credit} alt="credit" />
					<p>Conversion</p>
				</div>
				<div className='awareness_card_four'>
					<Image src={addPlus} alt="addPlus" />
					<p>Loyalty</p>
				</div>
			</div>
		</div>
	)
}

export default YourObjective