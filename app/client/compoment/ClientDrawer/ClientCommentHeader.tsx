import React from "react";

const ClientCommentHeader = ({ comment, timestamp }) => {
	// Format the date & time if provided
	const formattedDate = timestamp
		? new Date(timestamp).toLocaleDateString()
		: new Date().toLocaleDateString();

	const formattedTime = timestamp
		? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
		: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

	return (
		<div>
			<h3 className="font-[500] text-[18px] leading-[27px] text-[#292929]">{comment?.creator?.name}</h3>
			<div className="flex items-center gap-2">
				<p className="font-[400] text-[10px] leading-[16px] text-[#292929] whitespace-nowrap">{formattedDate}</p>
				<p className="font-[400] text-[10px] leading-[16px] text-[#292929] whitespace-nowrap">{formattedTime}</p>
			</div>
		</div>
	);
};

export default ClientCommentHeader;
