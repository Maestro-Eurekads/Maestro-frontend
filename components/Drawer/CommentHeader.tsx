import React from "react";

const CommentHeader = ({ author = "Daniel Silva", timestamp }) => {
	// Format the date & time if provided
	const formattedDate = timestamp
		? new Date(timestamp).toLocaleDateString()
		: new Date().toLocaleDateString();

	const formattedTime = timestamp
		? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
		: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

	return (
		<div>
			<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">{author}</h3>
			<div className="flex items-center gap-2">
				<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">{formattedDate}</p>
				<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">{formattedTime}</p>
			</div>
		</div>
	);
};

export default CommentHeader;
