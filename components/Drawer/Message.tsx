// import React, { useRef, useState } from "react";
// import Image from "next/image";
// import NoSSR from "./no-ssr";
// import { useComments } from "app/utils/CommentProvider"; // Import context
// import Mmessages from "../../public/messageOnplus.svg";
// import Showcomment from "./Showcomment";
// import Draggable from "react-draggable";
// import { useAppSelector } from "store/useStore";

// const DraggableComment = ({ comment }) => {

// 	const { updateCommentsPosition, updatePosition } = useComments();
// 	const [activeComment, setActiveComment] = useState(null);
// 	const commentRef = useRef(null);

// 	// const handleStop = (e, data) => {
// 	// 	const newPosition = { x: data.x, y: data.y };
// 	// 	updateCommentsPosition(comment?.documentId, newPosition);
// 	// };

// 	let positionTimeout: any = 5000; // Declare timeout variable outside to track it

// 	const handleStop = (e, data) => {
// 		const newPosition = { x: data?.x, y: data?.y };
// 		// Update comment position immediately
// 		updateCommentsPosition(comment?.documentId, newPosition);
// 		// Clear any previous timeout to prevent multiple executions
// 		if (positionTimeout) {
// 			clearTimeout(positionTimeout);
// 		}
// 		// Set a new timeout to update position after 5 seconds
// 		positionTimeout = setTimeout(() => {
// 			updatePosition(comment?.documentId, newPosition);
// 		}, 5000);
// 	};

// 	console.log("comment", comment);
// 	console.log("comment", comment?.documentId);
// 	console.log("comment", comment?.position.x);
// 	console.log("comment", comment?.position.y);


// 	return (
// 		<Draggable
// 			handle=".drag-handle"
// 			nodeRef={commentRef}
// 			defaultPosition={comment?.position}
// 			onStop={handleStop}
// 		>
// 			{activeComment === comment?.documentId ? (
// 				<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
// 					<Showcomment comment={comment} setActiveComment={setActiveComment} />
// 				</div>
// 			) : (
// 				<div ref={commentRef} className="absolute cursor-move drag-handle z-20">
// 					<button onClick={() => setActiveComment(comment?.documentId)} className="flex flex-row justify-center items-center w-[38px] h-[31px] bg-[#3175FF] rounded-md">
// 					</button>
// 					{/* <button onClick={() => setActiveComment(comment?.id)} >
// 						<Image src={Mmessages} alt="message icon" />
// 					</button> */}
// 				</div>
// 			)}
// 		</Draggable>
// 	);
// };

// const Message = () => {
// 	const { data: comments } = useAppSelector((state) => state.comment);



// 	return (
// 		<NoSSR>
// 			{comments?.map((comment) => (
// 				<DraggableComment key={comment?.documentId} comment={comment} />
// 			))}
// 		</NoSSR>
// 	);
// };

// export default Message;

import React, { useRef, useState } from "react";
import Image from "next/image";
import NoSSR from "./no-ssr";
import { useComments } from "app/utils/CommentProvider"; // Import context
import Mmessages from "../../public/messageOnplus.svg";
import Showcomment from "./Showcomment";
import Draggable from "react-draggable";
import { useAppSelector } from "store/useStore";

const DraggableComment = ({ comment }) => {
	const { updateCommentsPosition, updatePosition } = useComments();
	const [activeComment, setActiveComment] = useState(null);
	const commentRef = useRef(null);

	// const handleStop = (e, data) => {
	// 	const newPosition = { x: data?.x, y: data?.y };
	// 	updateCommentsPosition(comment?.documentId, newPosition);
	// };
	let positionTimeout: any = 5000; // Declare timeout variable outside to track it

	const handleStop = (e, data) => {
		const newPosition = { x: data?.x, y: data?.y };
		// Update comment position immediately
		updateCommentsPosition(comment?.documentId, newPosition);
		// Clear any previous timeout to prevent multiple executions
		if (positionTimeout) {
			clearTimeout(positionTimeout);
		}
		// Set a new timeout to update position after 5 seconds
		positionTimeout = setTimeout(() => {
			updatePosition(comment?.documentId, newPosition);
		}, 5000);
	};


	return (
		<Draggable
			handle=".drag-handle"
			nodeRef={commentRef}
			defaultPosition={comment?.position}
			onStop={handleStop}
		>
			{activeComment === comment?.documentId ? (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
					<Showcomment comment={comment} setActiveComment={setActiveComment} />
				</div>
			) : (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-20">
					<button onClick={() => setActiveComment(comment?.documentId)} className="flex flex-row justify-center items-center w-[38px] h-[31px] bg-[#3175FF] rounded-md">
					</button>
					{/* <button onClick={() => setActiveComment(comment?.id)} >
						<Image src={Mmessages} alt="message icon" />
					</button> */}
				</div>
			)}
		</Draggable>
	);
};

const Message = () => {
	const { data: comments } = useAppSelector((state) => state.comment);

	console.log("comments--comments", comments);

	return (
		<NoSSR>
			{comments.map((comment) => (
				<DraggableComment key={comment?.documentId} comment={comment} />
			))}
		</NoSSR>
	);
};

export default Message;





