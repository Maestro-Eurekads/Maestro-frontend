import React, { useState } from "react";
import Image from "next/image";
import { useComments } from "app/utils/CommentProvider"; // Import context
import Mmessages from "../../public/messageOnplus.svg";
import Showcomment from "./Showcomment";

const Message = () => {
	const { comments, viewcommentsId } = useComments();
	const [activeComment, setActiveComment] = useState(null);

	console.log("comments-comments", viewcommentsId);

	return (
		<div className="relative w-full h-full z-50">
			{comments.map((comment) => (
				<div
					key={comment.id}
					className="absolute"
					style={{
						top: `${comment.position?.y || 0}px`,
						left: `${comment.position?.x || 0}px`,
					}}
					onMouseEnter={() => setActiveComment(comment.id)}
					onMouseLeave={() => setActiveComment(null)}
				>
					{activeComment === comment.id ? (
						<Showcomment comment={comment} setShow={setActiveComment} />
					) : (
						<button>
							<Image src={Mmessages} alt="message icon" />
						</button>
					)}
				</div>
			))}
		</div>
	);
};

export default Message;


// className="absolute left-[30%] bottom-[30%] z-50 cursor-grab active:cursor-grabbing"