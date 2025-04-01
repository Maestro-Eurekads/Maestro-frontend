import React from "react";
import CommentHeader from "./CommentHeader";
import Approved from "./Approved";

const Comments = ({ comment, author = "Daniel Silva", contrastingColor }) => {



	return (
		<div >
			<div className="flex justify-between items-center gap-3">
				<div className="flex items-center gap-2">
					<div
						className="flex flex-col justify-center items-center p-2 w-10 h-10 rounded-full text-white"
						style={{ backgroundColor: contrastingColor }}
					>
						{author[0] || "?"}
					</div>
					<CommentHeader timestamp={new Date().toLocaleString()} />
				</div>
				{/* Approval Button */}
				<Approved comment={comment} />
			</div>

			{/* Comment Text */}
			<p className="font-[500] text-[16px] leading-[22px] text-[#292929] py-5">{comment.text}</p>
			<div>
				<h3 className={`font-semibold text-[15px] leading-[20px] text-[#00A36C] ${comment?.addcomment_as === "Internal" ? "text-green-500" : "text-red-500"}`}>
					{comment?.addcomment_as === "Internal" ? "Internal" : "Client"}</h3>
			</div>
		</div>
	);
};

export default Comments;

