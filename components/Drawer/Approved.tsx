// import React from "react";
// import Image from "next/image";
// import { useComments } from "app/utils/CommentProvider";
// import tickcircle from "../../public/tick-circle.svg";
// import tickcircles from "../../public/tick-circle-green.svg";
// import { SVGLoader } from "components/SVGLoader";
// import { useUserPrivileges } from "utils/userPrivileges";

// const Approved = ({ comment, commentId, setAlert, isFinancialApprover, isAgencyApprover, isAdmin }) => {
// 	const { approval, approvedIsLoading } = useComments();




// 	// Toggle approval state
// 	const handleApproval = () => {
// 		if (isAgencyApprover === false && isFinancialApprover === false && isAdmin === false) {

// 			setAlert({
// 				variant: "error",
// 				message: "Not authorized to approve this comment.",
// 				position: "bottom-right",
// 			});
// 			return;
// 		}

// 		if (comment?.approved === false) {
// 			approval(comment?.documentId, true, commentId);
// 		}
// 	};



// 	return (
// 		<div>
// 			{approvedIsLoading ?
// 				<SVGLoader width={"25px"} height={"25px"} color={"#0ABF7E"} /> :
// 				<div className="flex items-center gap-2 cursor-pointer whitespace-nowrap" onClick={handleApproval}>
// 					<button className="cursor-pointer">
// 						<Image src={comment?.approved ? tickcircles : tickcircle} alt="tickcircle" className="w-5" />
// 					</button>

// 					<p className={`w-[116px] font-semibold text-[13px] ${comment?.approved ? "text-[#0ABF7E]" : "text-[#292D32]"}`}>
// 						{comment?.approved ? "Marked as approved" : "Mark as approved"}
// 					</p>
// 				</div>}
// 		</div>


// 	);
// };

// export default Approved;


import React from "react";
import Image from "next/image";
import { useComments } from "app/utils/CommentProvider";
import tickcircle from "../../public/tick-circle.svg";
import tickcircles from "../../public/tick-circle-green.svg";
import { SVGLoader } from "components/SVGLoader";

const Approved = ({ comment, commentId, setAlert, isFinancialApprover, isAgencyApprover, isAdmin }) => {
	const { approval, approvedIsLoading } = useComments();

	const handleApproval = () => {
		if (!isAgencyApprover && !isFinancialApprover && !isAdmin) {
			setAlert({
				variant: "error",
				message: "Not authorized to approve this comment.",
				position: "bottom-right",
			});
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
