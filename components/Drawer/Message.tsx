import React, { useRef, useState } from "react";
import Image from "next/image";
import NoSSR from "./no-ssr";
import { useComments } from "app/utils/CommentProvider"; // Import context
import Mmessages from "../../public/messageOnplus.svg";
import Showcomment from "./Showcomment";
import Draggable from "react-draggable";

const DraggableComment = ({ comment }) => {
	const { updateCommentsPosition } = useComments();
	const [activeComment, setActiveComment] = useState(null);
	const commentRef = useRef(null);

	const handleStop = (e, data) => {
		const newPosition = { x: data?.x, y: data?.y };
		updateCommentsPosition(comment?.commentId, newPosition);
	};



	return (
		<Draggable
			handle=".drag-handle"
			nodeRef={commentRef}
			defaultPosition={comment?.position}
			onStop={handleStop}
		>
			{activeComment === comment?.commentId ? (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-50">
					<Showcomment comment={comment} setActiveComment={setActiveComment} />
				</div>
			) : (
				<div ref={commentRef} className="absolute cursor-move drag-handle z-20">
					<button onClick={() => setActiveComment(comment?.commentId)} className="flex flex-row justify-center items-center w-[38px] h-[31px] bg-[#3175FF] rounded-md">
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
	const { comments } = useComments();



	return (
		<NoSSR>
			{comments.map((comment) => (
				<DraggableComment key={comment?.commentId} comment={comment} />
			))}
		</NoSSR>
	);
};

export default Message;



