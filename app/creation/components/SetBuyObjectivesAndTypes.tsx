
import React, { useEffect } from 'react'

import PageHeaderWrapper from '../../../components/PageHeaderWapper'
import ObjectiveSelection from './ObjectiveSelection'
import { useComments } from 'app/utils/CommentProvider';
import SaveProgressButton from 'app/utils/SaveProgressButton';

const SetBuyObjectivesAndTypes = () => {
	const { setIsDrawerOpen, setClose } = useComments();
	useEffect(() => {
		setIsDrawerOpen(false);
		setClose(false);
	}, []);

	return (
		<div>
			<div className='flex flex-row justify-between w-full'>

				<PageHeaderWrapper
					t1={'Which buying objectives and types would you like to set for each platform ?'}
					t2={'Select the buying objectives and types for each platform to ensure your campaign targets the right audience.'}

				/>
				<SaveProgressButton setIsOpen={undefined} />
			</div>

			<ObjectiveSelection />
		</div>
	)
}

export default SetBuyObjectivesAndTypes
