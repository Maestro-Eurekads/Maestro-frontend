// import React, { useState } from 'react'
// import AddReplytothisComment from './AddReplytothisComment'

// const AddCommentReply = ({ setAddComment, addComment }) => {
// 	const [show, setShow] = useState(false)


// 	return (
// 		<div className=" w-full">
// 			{addComment &&
// 				<AddReplytothisComment />}


// 			<div className="flex w-full justify-end gap-5 mt-3">

// 				<button
// 					className="font-semibold text-[16px] leading-[22px] text-[#3175FF]" onClick={() => setAddComment(true)}>
// 					Add Reply to this comment
// 				</button>
// 				{addComment &&
// 					<button
// 						className="font-semibold text-[16px] leading-[22px] text-[#3175FF]" onClick={() => setAddComment(false)}>
// 						Hide Replies
// 					</button>
// 				}
// 			</div>
// 		</div>
// 	)
// }

// export default AddCommentReply


import React, { useState } from "react";
import { useComments } from "app/utils/CommentProvider";
import AddReplytothisComment from "./AddReplytothisComment";
import CommentReply from "./CommentReply";

const AddCommentReply = ({ commentId }) => {
	const { comments, addReply } = useComments();
	const [show, setShow] = useState(false);

	// Find the comment by ID and get its replies
	const comment = comments.find((c) => c.id === commentId);
	const replies = comment ? comment.replies : [];

	// Handle new reply submission
	const handleReplySubmit = (newReplyText) => {
		addReply(commentId, newReplyText);
	};

	return (
		<div className="w-full">
			{/* Display Submitted Replies */}
			{replies.length > 0 && <CommentReply commentId={commentId} />}

			{/* Show Add Reply Input */}
			{show && <AddReplytothisComment onReplySubmit={handleReplySubmit} />}

			{/* Buttons to show/hide replies */}
			<div className="flex w-full justify-end gap-5 mt-3">
				<button className="font-semibold text-[16px] text-[#3175FF]" onClick={() => setShow(true)}>
					Add Reply to this comment
				</button>
				{show && (
					<button className="font-semibold text-[16px] text-[#3175FF]" onClick={() => setShow(false)}>
						Hide Replies
					</button>
				)}
			</div>
		</div>
	);
};

export default AddCommentReply;

