"use client"

import React from 'react'
import YourCampaign from './YourCampaign'
import YourObjective from './YourObjective'
import FunnelStage from './FunnelStage'
import { useActive } from '../utils/ActiveContext'

const Creation = () => {
	const { active } = useActive();
	return (
		<div className='creation_continer'>

			{active === 1 && <YourCampaign />}
			{active === 2 && <YourObjective />}
			{active === 3 && <FunnelStage />}

		</div>
	)
}

export default Creation
