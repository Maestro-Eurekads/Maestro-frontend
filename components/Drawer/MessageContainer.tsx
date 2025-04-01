import React from 'react'
import DraggableMessage from './DraggableMessage'
import Message from './Message'

const MessageContainer = ({ isOpen }) => {
	return (
		<div>
			{isOpen &&
				<DraggableMessage />}
			{isOpen &&
				<Message />}

		</div>
	)
}

export default MessageContainer