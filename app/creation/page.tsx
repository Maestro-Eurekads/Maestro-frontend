"use client"

import React from 'react'
import YourCampaign from './components/YourCampaign'
import YourObjective from './components/YourObjective'
import FunnelStage from './components/FunnelStage'
import { useActive } from '../utils/ActiveContext'
import FormatsSelection from './components/FormatsSelection'

const Creation = () => {
	const { active } = useActive();
	return (
		<div className='creation_continer'>

			{active === 1 && <YourCampaign />}
			{active === 2 && <YourObjective />}
			{active === 3 && <FunnelStage />}
			{active === 4 && <FormatsSelection />}

		</div>
	)
}

export default Creation
