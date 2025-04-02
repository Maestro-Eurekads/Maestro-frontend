
"use client";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import NoSSR from "./no-ssr";
import { useComments } from "app/utils/CommentProvider";
import AddAsInternalcomment from "./AddAsInternalcomment";
import Image from "next/image";
import Mmessages from "../../public/message-2.svg";

const DraggableComment = ({ opportunity }) => {
	const { updateOpportunityPosition } = useComments();
	const [show, setShow] = useState(false);
	const [newPosition, setNewPosition] = useState(null);
	const commentRef = useRef(null);

	const handleStop = (data) => {
		const newPosition = { x: data.x, y: data.y };
		setNewPosition(newPosition)
		updateOpportunityPosition(opportunity?.commentId, newPosition);
	};





	return (
		<Draggable
			handle=".drag-handle"
			nodeRef={commentRef}
			defaultPosition={opportunity?.position || { x: 100, y: 100 }}
			onStop={handleStop}
		>

			{show ? (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
					<AddAsInternalcomment position={opportunity?.position} setShow={setShow} />
				</div>
			) : (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-20">
					<button
						onClick={() => setShow(true)}
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
	const { opportunities } = useComments(); // Use opportunities instead of comments


	return (
		<NoSSR>
			{opportunities?.map((opportunity) => (
				<DraggableComment key={opportunity?.commentId} opportunity={opportunity} />
			))}
		</NoSSR>
	);
};

export default DraggableMessage;
