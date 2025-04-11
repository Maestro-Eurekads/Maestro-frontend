import React, { useState } from "react";
import { useComments } from "app/utils/CommentProvider";
import AddReplytothisComment from "./ClientAddReplytothisComment";
import CommentReply from "./ClientCommentReply";
import { useAppSelector } from "store/useStore";
import ClientCommentReply from "./ClientCommentReply";
import ClientAddReplytothisComment from "./ClientAddReplytothisComment";

interface Comment {
	documentId: string;
	addcomment_as: string;
	createdAt: string;
	replies?: Reply[];
}

interface Reply {
	documentId: string;
	name?: string;
	date?: string;
	time?: string;
	message?: string;
}

const ClientAddCommentReply = ({ documentId, commentId, contrastingColor }) => {
	const { addReply } = useComments();
	const { data } = useAppSelector((state) => state.comment);
	const comments: Comment[] = data
		?.filter((comment: Comment) => comment?.addcomment_as !== "Internal")
		.sort((a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
			{replies?.length > 0 && <ClientCommentReply documentId={documentId} contrastingColor={contrastingColor} />}

			{/* Show Add Reply Input */}
			{show && <ClientAddReplytothisComment onReplySubmit={handleReplySubmit} />}

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

export default ClientAddCommentReply;

