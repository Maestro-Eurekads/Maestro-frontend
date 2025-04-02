import React from 'react'
import DraggableMessage from './DraggableMessage'
import Message from './Message'

const MessageContainer = ({ isOpen, isCreateOpen }) => {




	return (
		<div>
			{isCreateOpen &&
				<DraggableMessage />}
			{isOpen &&
				<Message />}

		</div>
	)
}

export default MessageContainer