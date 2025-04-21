import React from "react";
import moment from "moment";

// Define TypeScript interface for props
interface CommentHeaderProps {
	comment: {
		creator?: {
			name?: string;
		};
		createdAt?: string; // Assuming createdAt is an ISO date string
	};
	timestamp?: string; // Optional, unused in current logic
}

const CommentHeader: React.FC<CommentHeaderProps> = ({ comment }) => {
	// Format the date & time if createdAt is provided
	const formattedDate = comment?.createdAt
		? moment(comment?.createdAt).format("DD/MM/YYYY")
		: "n/a";
	const formattedTime = comment?.createdAt
		? moment(comment?.createdAt).format("HH:mm")
		: "n/a";

	return (
		<div>
			<h3 className="font-[500] text-[18px] leading-[27px] text-[#292929]">
				{comment?.creator?.name || "Unknown"}
			</h3>
			<div className="flex items-center gap-2">
				<p className="font-[400] text-[10px] leading-[16px] text-[#292929] whitespace-nowrap">
					{formattedDate}
				</p>
				<p className="font-[400] text-[10px] leading-[16px] text-[#292929] whitespace-nowrap">
					{formattedTime}
				</p>
			</div>
		</div>
	);
};

export default CommentHeader;