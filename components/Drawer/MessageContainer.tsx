import React from 'react'
import DraggableMessage from './DraggableMessage'
import Message from './Message'
import { useComments } from 'app/utils/CommentProvider';

const MessageContainer = ({ isOpen, isCreateOpen }) => {

	return (
		<div className="relative">
			{isCreateOpen &&
				<DraggableMessage />}
			{isOpen &&
				<Message />}

		</div>
	)
}

export default MessageContainer