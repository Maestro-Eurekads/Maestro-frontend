import React from "react";
import Image from "next/image";
import { useComments } from "app/utils/CommentProvider";
import tickcircle from "../../public/tick-circle.svg";
import tickcircles from "../../public/tick-circle-green.svg";
import { SVGLoader } from "components/SVGLoader";
import { toast } from "sonner";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useUserPrivileges } from "utils/userPrivileges";

const Approved = ({ comment, commentId, isFinancialApprover, isAgencyApprover, isAdmin }) => {
	const { approval, approvedIsLoading } = useComments();
	const { campaignFormData } = useCampaigns();
	const { loggedInUser } = useUserPrivileges();


	const handleApproval = () => {
		// Extract emails from internal_approver array
		const internalApproverEmails = campaignFormData?.internal_approver?.map(approver => approver?.email);

		// Check if user is not admin and their email doesn't match any internal approver email
		if (!isAdmin && !internalApproverEmails.includes(loggedInUser.email)) {
			toast.error("Not authorized to approve this comment.");
			return;
		}

		// Existing role checks
		if (!isAgencyApprover && !isFinancialApprover && !isAdmin) {
			toast.error("Not authorized to approve this comment.");
			return;
		}

		// Proceed with approval if comment is not already approved
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
