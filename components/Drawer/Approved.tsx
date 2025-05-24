import React from "react";
import Image from "next/image";
import { useComments } from "app/utils/CommentProvider";
import tickcircle from "../../public/tick-circle.svg";
import tickcircles from "../../public/tick-circle-green.svg";
import { SVGLoader } from "components/SVGLoader";
import { toast } from "sonner";

const Approved = ({ comment, commentId, isFinancialApprover, isAgencyApprover, isAdmin }) => {
	const { approval, approvedIsLoading } = useComments();

	const handleApproval = () => {
		if (!isAgencyApprover && !isFinancialApprover && !isAdmin) {
			toast.error("Not authorized to approve this comment.");
			return;
		}
		if (!comment?.approved) {
			approval(comment?.documentId, true, commentId);
		}
	};

	return approvedIsLoading ? (
		<SVGLoader width="20px" height="20px" color="#0ABF7E" />
	) : (
		<div
			className="flex items-center gap-1 cursor-pointer"
			onClick={handleApproval}
		>
			<Image
				src={comment?.approved ? tickcircles : tickcircle}
				alt="tick"
				width={16}
				height={16}
			/>
			<p className={`text-[12px] font-medium ${comment?.approved ? "text-[#0ABF7E]" : "text-[#292D32]"}`}>
				{comment?.approved ? "Approved" : "Approve"}
			</p>
		</div>
	);
};

export default Approved;
