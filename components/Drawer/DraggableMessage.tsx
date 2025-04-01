
"use client";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import NoSSR from "./no-ssr";
import { HiOutlinePlus } from "react-icons/hi";
import { useComments } from "app/utils/CommentProvider";
import AddAsInternalcomment from "./AddAsInternalcomment";

const DraggableComment = ({ opportunity }) => {
	const { updateOpportunityPosition } = useComments();
	const [show, setShow] = useState(false);
	const [newPosition, setNewPosition] = useState(null);
	const commentRef = useRef(null);

	const handleStop = (data) => {
		const newPosition = { x: data.x, y: data.y };
		console.log("data-newPosition", data);
		setNewPosition(newPosition)
		updateOpportunityPosition(opportunity?.commentId, newPosition);
	};
	console.log("newPosition-newPosition", newPosition);
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
					<button onClick={() => setShow(true)} className="flex flex-row justify-center items-center w-[38px] h-[31px] bg-[#3175FF] rounded-md border border-[#f8f9fa]">
						<HiOutlinePlus size={23} color="#fff" />
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
