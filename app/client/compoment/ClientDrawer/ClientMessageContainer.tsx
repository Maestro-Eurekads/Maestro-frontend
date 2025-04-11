import React from 'react'
import ClientDraggableMessage from './ClientDraggableMessage'
import ClientMessage from './ClientMessage'

const ClientMessageContainer = ({ isOpen, isCreateOpen }) => {




	return (
		<div>
			{isCreateOpen &&
				<ClientDraggableMessage />}
			{isOpen &&
				<ClientMessage />}

		</div>
	)
}

export default ClientMessageContainer