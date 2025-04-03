import React from 'react'
import ToggleSwitch from '../ToggleSwitch'
import blueBtn from '../../../public/blueBtn.svg';
import Image from 'next/image'
import Table from '../../../components/Table';
import Dropdowns from '../Dropdowns';
import { useCampaigns } from '../../utils/CampaignsContext';
import FiltersDropdowns from './FiltersDropdowns';

const Overview = () => {
	const { loading, clientCampaignData } = useCampaigns()


	return (
		<div className='px-[72px]'>

			<div className='flex items-center gap-2 mt-[36.5px]'>
				<h1 className='media_text'>Media plans</h1>
				<button>
					<Image src={blueBtn} alt='menu' />
				</button>
			</div>
			<div className='mt-[20px]'>
			<FiltersDropdowns hideTitle={true}/>
			</div>
			<Table />
		</div>
	)
}

export default Overview