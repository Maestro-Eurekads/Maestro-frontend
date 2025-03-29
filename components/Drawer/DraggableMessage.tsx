// "use client";

// import { useRef, useState } from "react";
// import Draggable from "react-draggable";
// import NoSSR from "./no-ssr";
// import AddAsInternalcomment from "./AddAsInternalcomment";
// import { HiOutlinePlus } from "react-icons/hi";
// import { useComments } from "app/utils/CommentProvider";

// const DraggableComment = ({ comment, setMessage, showAdd }) => {
// 	const { updateCommentPosition } = useComments(); // Use global state
// 	const [toggleShowAdd, setToggleShowAdd] = useState([]);
// 	const commentRef = useRef(null);

// 	// Handle drag stop to save position
// 	const handleStop = (e, data) => {
// 		const newPosition = { x: data.x, y: data.y };
// 		updateCommentPosition(comment.id, newPosition);
// 	};

// 	return (
// 		<Draggable
// 			handle=".drag-handle"
// 			nodeRef={commentRef}
// 			defaultPosition={comment?.position || { x: 0, y: 0 }}
// 			onStop={handleStop}
// 		>
// 			<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
// 				{toggleShowAdd === comment?.id ? (
// 					<AddAsInternalcomment setMessage={setMessage} position={comment?.position} />
// 				) : (showAdd === comment?.id ?
// 					<button
// 						onClick={() => setToggleShowAdd(comment?.id)}
// 						className="flex flex-row justify-center items-center drag-handle cursor-move w-[38px] h-[31px] bg-[#3175FF] rounded-md"
// 					>
// 						<HiOutlinePlus size={23} color="#fff" />
// 					</button> : <button
// 						onClick={() => setToggleShowAdd(comment?.id)}
// 						className="flex flex-row justify-center items-center drag-handle cursor-move w-[38px] h-[31px] bg-[#3175FF] rounded-md"
// 					>
// 						<HiOutlinePlus size={23} color="#fff" />
// 					</button>
// 				)}
// 			</div>
// 		</Draggable>
// 	);
// };

// const DraggableMessage = ({ setMessage }) => {
// 	const { comments, showAdd, setShowAdd } = useComments(); // Use global state

// 	const toggleShowAdd = (commentId) => {
// 		setShowAdd((prev) => (prev === commentId ? null : commentId));
// 	};

// 	return (
// 		<NoSSR>
// 			{comments?.map((comment) => (
// 				<DraggableComment
// 					key={comment.id}
// 					comment={comment}
// 					setMessage={setMessage}
// 					showAdd={showAdd}
// 				/>
// 			))}
// 		</NoSSR>
// 	);
// };

// export default DraggableMessage;

"use client";

// import { useRef } from "react";
// import Draggable from "react-draggable";
// import dynamic from "next/dynamic";
// import AddAsInternalcomment from "./AddAsInternalcomment";
// import { HiOutlinePlus } from "react-icons/hi";
// import { useComments } from "app/utils/CommentProvider";

// // Disable SSR for DraggableMessage to prevent hydration errors
// const NoSSR = dynamic(() => import("./no-ssr"), { ssr: false });

// const DraggableComment = ({ comment, setMessage }) => {
// 	const { updateCommentPosition, showAdd, setShowAdd } = useComments();
// 	const commentRef = useRef(null);

// 	// Handle drag stop to save position
// 	const handleStop = (e, data) => {
// 		const newPosition = { x: data.x, y: data.y };
// 		updateCommentPosition(comment.id, newPosition);
// 	};

// 	// Toggle the input comment box
// 	const handleToggleShowAdd = () => {
// 		setShowAdd((prev) => (prev === comment.id ? null : comment.id));
// 	};

// 	return (
// 		<Draggable
// 			handle=".drag-handle"
// 			nodeRef={commentRef}
// 			defaultPosition={comment?.position || { x: 100, y: 100 }}
// 			onStop={handleStop}
// 		>
// 			<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
// 				{showAdd === comment?.id ? (
// 					<AddAsInternalcomment setMessage={setMessage} position={comment?.position} />
// 				) : (
// 					<button
// 						onClick={handleToggleShowAdd}
// 						className="relative flex flex-row items-center w-[50px] h-[38px] bg-[#3175FF] text-white rounded-lg shadow-md text-sm"
// 					>
// 						<HiOutlinePlus size={20} className="m-auto" />
// 						{/* Comment Indicator */}
// 						<div className="absolute bottom-[-5px] left-2 w-5 h-5 bg-[#3175FF] rotate-45"></div>
// 					</button>
// 				)}
// 			</div>
// 		</Draggable>
// 	);
// };

// const DraggableMessage = ({ setMessage }) => {
// 	const { comments, addComment, showAdd, setShowAdd } = useComments();

// 	// Handle adding a new draggable comment
// 	const handleAddComment = () => {
// 		const newComment = {
// 			id: Date.now(), // Unique ID
// 			text: "",
// 			position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random start position
// 		};

// 		addComment(newComment); // Add new comment
// 		setShowAdd(newComment.id); // Show the comment input box
// 	};

// 	return (
// 		<NoSSR>
// 			{comments.map((comment) => (
// 				<DraggableComment
// 					key={comment.id}
// 					comment={comment}
// 					setMessage={setMessage}
// 				/>
// 			))}

// 			{/* Floating Add Button */}
// 			<button
// 				className="fixed bottom-10 right-10 p-4 bg-[#3175FF] text-white rounded-full shadow-md"
// 				onClick={handleAddComment}
// 			>
// 				<HiOutlinePlus size={30} />
// 			</button>
// 		</NoSSR>
// 	);
// };

// export default DraggableMessage;
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
	const commentRef = useRef(null);

	const handleStop = (e, data) => {
		const newPosition = { x: data.x, y: data.y };
		updateOpportunityPosition(opportunity.commentId, newPosition);
	};

	return (
		<Draggable
			handle=".drag-handle"
			nodeRef={commentRef}
			defaultPosition={opportunity.position}
			onStop={handleStop}
		>

			{show ? (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
					<AddAsInternalcomment position={opportunity.position} setShow={setShow} />
				</div>
			) : (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-20">
					<button onClick={() => setShow(true)} className="flex flex-row justify-center items-center w-[38px] h-[31px] bg-[#3175FF] rounded-md">
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
			{opportunities.map((opportunity) => (
				<DraggableComment key={opportunity.commentId} opportunity={opportunity} />
			))}
		</NoSSR>
	);
};

export default DraggableMessage;
