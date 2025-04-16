
"use client";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import NoSSR from "./no-ssr";
import { useComments } from "app/utils/CommentProvider";
import Image from "next/image";
import Mmessages from "../../../../public/message-2.svg";
import ClientAddAsInternalcomment from "./ClientAddAsInternalcomment";


const ClientDraggableComment = ({ opportunity, campaign }) => {
	const { updateOpportunityPosition } = useComments();
	const [show, setShow] = useState(false);
	const [draggedRecently, setDraggedRecently] = useState(false);
	const commentRef = useRef(null);

	const dragStartPos = useRef({ x: 0, y: 0 });

	const handleStart = (e, data) => {
		dragStartPos.current = { x: data.x, y: data.y };
	};

	const handleStop = (e, data) => {
		const dx = Math.abs(data.x - dragStartPos.current.x);
		const dy = Math.abs(data.y - dragStartPos.current.y);
		const hasDragged = dx > 5 || dy > 5; // Only flag if actually moved

		if (hasDragged) {
			setDraggedRecently(true);
			setTimeout(() => setDraggedRecently(false), 200); // Reset after short delay

			const newPosition = { x: data.x, y: data.y };
			updateOpportunityPosition(opportunity?.commentId, newPosition);
		}
	};

	const handleClick = () => {
		if (!draggedRecently) {
			setShow(true);
		}
	};

	console.log('opportunity?.position-opportunity?.position', opportunity?.position)



	return (
		<Draggable
			handle=".drag-handle"
			nodeRef={commentRef}
			defaultPosition={{ x: 100, y: -50 }}
			// defaultPosition={opportunity?.position || { x: 150, y: 150 }}
			onStart={handleStart}
			onStop={handleStop}
		>
			{show ? (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
					<ClientAddAsInternalcomment position={opportunity?.position} setShow={setShow} campaign={campaign} />
				</div>
			) : (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-20">
					<button
						onClick={handleClick}
						className="drag-handle flex items-center justify-center p-[-2px] bg-transparent border-none"
					>
						<Image
							src={Mmessages}
							alt="message icon"
							className="pointer-events-none"
						/>
					</button>
				</div>
			)}
		</Draggable>
	);
};


const ClientDraggableMessage = (campaign) => {
	const { opportunities } = useComments(); // Use opportunities instead of comments


	return (
		<NoSSR>
			{opportunities?.map((opportunity) => (
				<ClientDraggableComment key={opportunity?.commentId} opportunity={opportunity} campaign={campaign} />
			))}
		</NoSSR>
	);
};

export default ClientDraggableMessage;