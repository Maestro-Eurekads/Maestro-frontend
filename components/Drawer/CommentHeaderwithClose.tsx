import { cleanName } from "components/Options";
import React from "react";

const CommentHeaderwithClose = ({ author }) => {
	// Use a single Date object for the current date and time
	const currentDate = new Date();

	// Format the date and time
	const formattedDate = currentDate.toLocaleDateString(
		"en-US", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}
	);
	const formattedTime = currentDate.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});

	return (
		<div>
			<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">
				{cleanName(author)}
			</h3>
			<div className="flex items-center gap-2">
				<p className="font-[400] text-[12px] leading-[16px] text-[#292929] whitespace-nowrap">
					{formattedDate}
				</p>
				<p className="font-[400] text-[12px] leading-[16px] text-[#292929] whitespace-nowrap">
					{formattedTime}
				</p>
			</div>
		</div>
	);
};

export default CommentHeaderwithClose;