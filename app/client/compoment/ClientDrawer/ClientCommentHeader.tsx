import moment from "moment";
import React from "react";

const ClientCommentHeader = ({ comment }) => {
	// Format the date & time if createdAt is provided
	const formattedDate = comment?.createdAt
		? moment(comment?.createdAt).format("DD/MM/YYYY")
		: "n/a";
	const formattedTime = comment?.createdAt
		? moment(comment?.createdAt).format("HH:mm")
		: "n/a";


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
