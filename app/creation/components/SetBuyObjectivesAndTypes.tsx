import React from 'react'

import PageHeaderWrapper from '../../../components/PageHeaderWapper'
import ObjectiveSelection from './ObjectiveSelection'

const SetBuyObjectivesAndTypes = () => {
	return (
		<div>
			<PageHeaderWrapper
				t1={'Which buying objectives and types would you like to set for each platform ?'}
				t2={'Select the buying objectives and types for each platform to ensure your campaign targets the right audience.'}

			/>

			<ObjectiveSelection />


		</div>
	)
}

export default SetBuyObjectivesAndTypes
