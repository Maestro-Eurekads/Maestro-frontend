import React from 'react'
import ClientDraggableMessage from './ClientDraggableMessage'
import ClientMessage from './ClientMessage'

const ClientMessageContainer = ({ isOpen, isCreateOpen, campaign }) => {




	return (
		<div className='relative'>
			{isCreateOpen &&
				<ClientDraggableMessage campaign={campaign} />}
			{isOpen &&
				<ClientMessage />}

		</div>
	)
}

export default ClientMessageContainer