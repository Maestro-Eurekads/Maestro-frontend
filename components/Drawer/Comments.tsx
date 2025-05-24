import React from "react";
import CommentHeader from "./CommentHeader";
import Approved from "./Approved";



const Comments = ({
	comment,
	contrastingColor,
	isAgencyApprover,
	isFinancialApprover,
	isAdmin
}) => {
	return (
		<div>
			<div className="flex justify-between items-center gap-2">
				<div className="flex items-center gap-2">
					<div
						className="flex justify-center items-center p-[6px] w-[33px] h-[33px] rounded-full text-white text-[13px]"
						style={{ backgroundColor: contrastingColor }}
					>
						{comment?.creator?.name?.[0] || "?"}
					</div>
					<CommentHeader comment={comment} timestamp={new Date().toLocaleString()} />
				</div>

				<div>
					<Approved
						comment={comment}
						commentId={comment?.commentId}
						isFinancialApprover={isFinancialApprover}
						isAgencyApprover={isAgencyApprover}
						isAdmin={isAdmin} />
				</div>
			</div>

			<p className="font-medium text-[14px] leading-[20px] text-[#292929] py-3">
				{comment?.text}
			</p>

			{comment?.client_commentID === null && (
				<div>
					<h3
						className={`font-semibold text-[13px] leading-[18px] ${comment?.addcomment_as === "Internal" ? "text-green-500" : "text-red-500"
							}`}
					>
						{comment?.addcomment_as === "Internal" ? "Internal" : "Client"}
					</h3>
				</div>
			)}
		</div>
	);
};

export default Comments;


