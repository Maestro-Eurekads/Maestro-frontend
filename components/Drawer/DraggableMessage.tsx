
"use client";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import NoSSR from "./no-ssr";
import { useComments } from "app/utils/CommentProvider";
import AddAsInternalcomment from "./AddAsInternalcomment";
import Image from "next/image";
import Mmessages from "../../public/message-2.svg";

const DraggableComment = ({ opportunity }) => {
	const { updateOpportunityPosition, show, setShow } = useComments();
	// const [show, setShow] = useState(false);
	const commentRef = useRef(null);
	const [draggedRecently, setDraggedRecently] = useState(false);


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




	return (
		<Draggable
			handle=".drag-handle"
			nodeRef={commentRef}
			defaultPosition={opportunity?.position}
			onStart={handleStart}
			onStop={handleStop}
		>

			{show ? (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
					<AddAsInternalcomment position={opportunity?.position} setShow={setShow} />
				</div>
			) : (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-30">
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



const DraggableMessage = () => {
	const { opportunities } = useComments();

	// Track existing positions to avoid overlap
	const positionTracker = new Map();

	return (
		<NoSSR>
			{opportunities?.map((opportunity, index) => {
				let position = opportunity?.position || { x: 100, y: 100 }; // Default position
				const key = `${position.x}-${position.y}`;

				if (positionTracker.has(key)) {
					const offset = positionTracker.get(key) + 1;
					position = {
						x: position.x + offset * 20,
						y: position.y + offset * 20
					};
					positionTracker.set(key, offset);
				} else {
					positionTracker.set(key, 0);
				}

				return (
					<DraggableComment key={opportunity?.commentId} opportunity={{ ...opportunity, position }} />
				);
			})}
		</NoSSR>
	);
};
export default DraggableMessage;
