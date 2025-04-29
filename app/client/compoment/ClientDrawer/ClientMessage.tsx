import React, { useRef, useState } from "react";
import Image from "next/image";
import NoSSR from "./no-ssr";
import { useComments } from "app/utils/CommentProvider"; // Import context
import Mmessages from "../../../../public/messageOnplus.svg";
import Mmessages2 from "../../../../public/messageOnplusbabyblue.svg";
import Draggable from "react-draggable";
import { useAppSelector } from "store/useStore";
import tickcircles from "../../../../public/solid_circle-check.svg";
import ClientShowcomment from "./ClientShowcomment";


interface Comment {
	documentId: string;
	addcomment_as: string;
	createdAt: string;
	commentId?: string; // Added commentId property
	replies?: Reply[];
}

interface Reply {
	documentId: string;
	name?: string;
	date?: string;
	time?: string;
	message?: string;
}
const ClientDraggableComment = ({ comment, commentId }) => {
	const { updateCommentsPosition, updatePosition, activeComment, setActiveComment } = useComments();
	// const [activeComment, setActiveComment] = useState(null);
	const commentRef = useRef(null);
	const [draggedRecently, setDraggedRecently] = useState(false);

	const dragStartPos = useRef({ x: 0, y: 0 });
	let positionTimeout: any = 5000;

	const handleStart = (e, data) => {
		dragStartPos.current = { x: data.x, y: data.y };
	};

	const handleStop = (e, data) => {
		const dx = Math.abs(data.x - dragStartPos.current.x);
		const dy = Math.abs(data.y - dragStartPos.current.y);
		const hasDragged = dx > 5 || dy > 5;

		if (hasDragged) {
			setDraggedRecently(true);
			setTimeout(() => setDraggedRecently(false), 200);
		}

		const newPosition = { x: data?.x, y: data?.y };
		updateCommentsPosition(comment?.documentId, newPosition);

		if (positionTimeout) clearTimeout(positionTimeout);
		positionTimeout = setTimeout(() => {
			updatePosition(comment?.documentId, newPosition, commentId);
		}, 5000);
	};

	const handleClick = () => {
		if (!draggedRecently) {
			setActiveComment(comment?.documentId);
		}
	};



	return (
		<Draggable
			handle=".drag-handle"
			nodeRef={commentRef}
			defaultPosition={comment?.position}
			onStart={handleStart}
			onStop={handleStop}
		>
			{activeComment === comment?.documentId ? (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
					<ClientShowcomment comment={comment} setActiveComment={setActiveComment} />
				</div>
			) : (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-20 flex	flex-col justify-center items-center">
					{comment?.addcomment_as === "Client" ?
						<button
							onClick={handleClick}
							className="drag-handle flex items-center justify-center p-[-2px] bg-transparent border-none relative" >
							{comment?.approved && <Image src={tickcircles} alt="tickcircle" className="w-[23px] absolute top-[10px] pointer-events-none" />}
							<Image
								src={Mmessages}
								alt="message icon"
								className="pointer-events-none"
							/>
						</button> :
						<button
							onClick={handleClick}
							className="drag-handle flex items-center justify-center p-[-2px] bg-transparent border-none relative" >
							{comment?.approved && <Image src={tickcircles} alt="tickcircle" className="w-[23px] absolute top-[10px] pointer-events-none" />}
							<Image
								src={Mmessages2}
								alt="message icon"
								className="pointer-events-none"
							/>
						</button>
					}
				</div>
			)}
		</Draggable>
	);
};

const ClientMessage = () => {
	const { data } = useAppSelector((state) => state.comment);
	const comments: Comment[] = data
		?.filter((comment: Comment) => comment?.addcomment_as !== "Internal")
		.sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


	return (
		<NoSSR>
			{comments?.map((comment) => (
				<ClientDraggableComment key={comment?.documentId} comment={comment} commentId={comment?.commentId} />
			))}
		</NoSSR>
	);
};

export default ClientMessage;





