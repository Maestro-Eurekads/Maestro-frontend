


import React from "react";
import moment from "moment";
import { cleanName } from "components/Options";

interface CommentHeaderProps {
	comment: {
		creator?: {
			name?: string;
		};
		createdAt?: string;
	};
	timestamp?: string;
}

const CommentHeader: React.FC<CommentHeaderProps> = ({ comment }) => {
	const formattedDate = comment?.createdAt
		? moment(comment.createdAt).format("DD/MM/YYYY")
		: "n/a";
	const formattedTime = comment?.createdAt
		? moment(comment.createdAt).format("HH:mm")
		: "n/a";

	return (
		<div>
			<h3 className="font-semibold text-[14px] text-[#292929] leading-none">
				{cleanName(comment?.creator?.name) || "Unknown"}
			</h3>
			<div className="flex items-center gap-1 mt-[2px]">
				<p className="text-[10px] text-[#666]">{formattedDate}</p>
				<p className="text-[10px] text-[#666]">{formattedTime}</p>
			</div>
		</div>
	);
};

export default CommentHeader;
