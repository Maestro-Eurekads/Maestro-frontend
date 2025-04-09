import React, { useState } from "react";
import { useComments } from "app/utils/CommentProvider";
import AddReplytothisComment from "./AddReplytothisComment";
import CommentReply from "./CommentReply";
import { useAppSelector } from "store/useStore";

const AddCommentReply = ({ documentId, commentId, contrastingColor }) => {
	const { addReply } = useComments();
	const { data: comments } = useAppSelector((state) => state.comment);
	const [show, setShow] = useState(false);

	// Find the comment by ID and get its replies
	const comment = comments?.find((c) => c?.documentId === documentId);
	const replies = comment ? comment?.replies : [];

	// Handle new reply submission
	const handleReplySubmit = (newReplyText) => {
		addReply(documentId, newReplyText, commentId);
	};

	return (
		<div className="w-full">
			{/* Display Submitted Replies */}
			{replies?.length > 0 && <CommentReply documentId={documentId} contrastingColor={contrastingColor} />}

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

