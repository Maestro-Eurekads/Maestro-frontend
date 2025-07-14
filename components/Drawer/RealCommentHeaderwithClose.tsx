import { cleanName } from 'components/Options';
import moment from 'moment';
import React from 'react'

const RealCommentHeaderwithClose = ({ author, comment }) => {
	// Format the date & time if provided
	const formattedDate = comment?.createdAt
		? moment(comment.createdAt).format("DD/MM/YYYY")
		: "n/a";

	const formattedTime = comment?.createdAt
		? moment(comment.createdAt).format("hh:mm A") // <-- 12-hour format with AM/PM
		: "n/a";


	return (
		<div>
			<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">{cleanName(author)}</h3>
			<div className="flex items-center gap-2">
				<p className="font-[400] text-[12px] leading-[16px] text-[#292929] whitespace-nowrap">{formattedDate}</p>
				<p className="font-[400] text-[12px] leading-[16px] text-[#292929] whitespace-nowrap">{formattedTime}</p>
			</div>
		</div>
	);
};

export default RealCommentHeaderwithClose