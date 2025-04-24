"use client";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { HiOutlinePlus } from "react-icons/hi";
import { useComments } from "app/utils/CommentProvider";

const ClientDraggableComment = ({ comment }) => {
	const { updateCommentPosition } = useComments();
	const commentRef = useRef(null);

	const handleStop = (e, data) => {
		const newPosition = { x: data.x, y: data.y };
		updateCommentPosition(comment.documentId, newPosition);
	};

	console.log('comment?.position-comment?.position', comment?.position)



	return (
		<Draggable
			handle=".drag-handle"
			nodeRef={commentRef}
			defaultPosition={comment?.position || { x: 150, y: 150 }}
			onStop={handleStop}
		>
			<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
				<button
					className="flex flex-row justify-center items-center drag-handle cursor-move w-[38px] h-[31px] bg-[#3175FF] rounded-md"
				>
					<HiOutlinePlus size={23} color="#fff" />
				</button>
			</div>
		</Draggable>
	);
};

export default ClientDraggableComment;
