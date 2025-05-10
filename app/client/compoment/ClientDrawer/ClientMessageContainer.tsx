import React from 'react'
import ClientDraggableMessage from './ClientDraggableMessage'
import ClientMessage from './ClientMessage'
import { useComments } from 'app/utils/CommentProvider';

const ClientMessageContainer = ({ isOpen, isCreateOpen, campaign }) => {

	const { activeComment, show } = useComments();



	return (
		<div className={(activeComment || show) ? "" : "relative"}>
			{isCreateOpen &&
				<ClientDraggableMessage campaign={campaign} />}
			{isOpen &&
				<ClientMessage />}

		</div>
	)
}

export default ClientMessageContainer