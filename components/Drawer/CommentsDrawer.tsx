import Image from "next/image";
import closecircle from "../../public/close-circle.svg";
import Mmessages from "../../public/message-2.svg";
import Comments from "./Comments";
import AddCommentReply from "./AddCommentReply";
import { useComments } from "app/utils/CommentProvider";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getContrastingColor, getRandomColor } from "components/Options";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/useStore";
// import { getComment } from "features/Comment/commentSlice";
import { SVGLoader } from "components/SVGLoader";
import AlertMain from "components/Alert/AlertMain";
import { BsXLg } from "react-icons/bs";
import { useUserPrivileges } from "utils/userPrivileges";
import { reset } from "features/Comment/commentSlice";
import clsx from "clsx";


interface Comment {
	documentId: string;
	addcomment_as: string;
	createdAt: string;
	commentId?: string; // Added commentId property
	replies?: {
		replyId: string;
		text: string;
		createdAt: string;
		author: string;
	}[];
}



const CommentsDrawer = ({ isOpen, onClose }) => {
	const { opportunities, setViewcommentsId, viewcommentsId, addCommentOpportunity, setOpportunities, createCommentsError, createCommentsSuccess, approvedError, replyError, setIsCreateOpen, setClose, showbyID } = useComments();

	const { isAgencyApprover, isFinancialApprover, isAdmin, isAgencyCreator } = useUserPrivileges();

	const { data, isLoading } = useAppSelector((state) => state.comment);
	const dispatch = useAppDispatch();
	const { campaignData } = useCampaigns();

	const [alert, setAlert] = useState(null);
	const [commentColors, setCommentColors] = useState({});

	const commentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

	const comment = useMemo(() => {
		if (!data) return [];
		return data.filter((comment) => comment?.client_commentID === null);
	}, [data]);

	const comments = useMemo(() => {
		return [...comment].sort(
			(a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
		);
	}, [comment]);

	useEffect(() => {
		const newColors = {};
		comments.forEach((comment) => {
			if (!commentColors[comment?.documentId]) {
				const randomColor = getRandomColor();
				newColors[comment?.documentId] = {
					color: randomColor,
					contrastingColor: getContrastingColor(randomColor),
				};
			}
		});
		setCommentColors((prevColors) => ({ ...prevColors, ...newColors }));
	}, [comments]);

	// Scroll and highlight selected comment
	useEffect(() => {
		if (viewcommentsId && commentRefs.current[viewcommentsId]) {
			const el = commentRefs.current[viewcommentsId];
			el?.scrollIntoView({ behavior: "smooth", block: "center" });

			const timeout = setTimeout(() => {
				setViewcommentsId('');
			}, 3000);

			return () => clearTimeout(timeout);
		}
	}, [viewcommentsId]);

	const createCommentOpportunity = () => {
		const newOpportunity = {
			commentId: Date.now(),
			text: "New Comment Opportunity",
			position: { x: 400, y: -500 },
		};

		if (opportunities.length === 0) {
			setIsCreateOpen(true);
			addCommentOpportunity(newOpportunity);
		}
	};

	const handleClose = () => {
		setOpportunities([]);
		onClose(false);
		setViewcommentsId('');
		dispatch(reset());
	};

	useEffect(() => {
		if (alert) {
			const timer = setTimeout(() => setAlert(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [alert]);

	useEffect(() => {
		if (createCommentsSuccess) {
			setAlert({ variant: "success", message: "Commment created!", position: "bottom-right" });
		}
		if (createCommentsError) {
			setAlert({
				variant: "error", message: createCommentsError.
					response.data || createCommentsError.message, position: "bottom-right"
			});
		}
		if (replyError) {
			setAlert({
				variant: "error", message: replyError.
					response.data?.error?.message || replyError?.message, position: "bottom-right"
			});
		}
		if (approvedError) {
			setAlert({
				variant: "error", message: replyError.
					response.data?.error?.message || replyError?.message, position: "bottom-right"
			});
		}
	}, [createCommentsError, replyError]);




	return (
		<div className={`drawer-container ${isOpen ? "drawer-open" : ""} max-h-screen`}>
			{alert && <AlertMain alert={alert} />}

			<div className="flex w-full justify-between p-3">
				<div>
					<h3 className="font-medium text-[22px] text-[#292929]">Comments For</h3>
					<div className="flex items-center gap-2 w-full">
						<p className="font-medium text-[16px] text-[#292929] mb-4">
							{campaignData?.funnel_stages?.length > 0
								? campaignData?.funnel_stages?.length > 3
									? campaignData?.funnel_stages?.slice(0, 3).join(" · ") + " ..."
									: campaignData?.funnel_stages?.join(" · ")
								: ""}
						</p>
					</div>
				</div>
				<button onClick={handleClose}>
					<Image src={closecircle} alt="Close" />
				</button>
			</div>

			<div className="w-full flex flex-col justify-center items-center gap-5 mt-[-10px] mb-4">
				<button onClick={createCommentOpportunity}>
					<Image src={Mmessages} alt="Add Comment Opportunity" />
				</button>
				<h6 className="w-[70%] text-center text-black text-[15px]">
					Add a comment, your comments will appear here!
				</h6>
			</div>

			{/* Comments Section */}
			<div className="faq-container p-5 overflow-y-auto max-h-[calc(88vh-100px)]">
				{isLoading ? (
					<div className="w-full h-full flex justify-center items-center py-5">
						<SVGLoader width={"35px"} height={"35px"} color={"#00A36C"} />
					</div>
				) : (
					comments?.map((comment) => {
						const { color, contrastingColor } = commentColors[comment?.documentId] || {};
						return (
							<div
								key={comment?.documentId}
								ref={(el) => {
									commentRefs.current[comment?.documentId] = el;
								}}
								className={clsx(
									"flex flex-col justify-between p-5 gap-4 w-full min-h-[203px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.1)] rounded-lg border-box mb-5 transition-all duration-500",
									viewcommentsId === comment?.documentId && "ring-2 ring-[#00A36C]"
								)}
							>
								<Comments
									comment={comment}
									contrastingColor={contrastingColor}
									setAlert={setAlert}
									isAgencyApprover={isAgencyApprover}
									isFinancialApprover={isFinancialApprover}
									isAdmin={isAdmin}
									isAgencyCreator={isAgencyCreator}
								/>
								<AddCommentReply
									documentId={comment?.documentId}
									contrastingColor={contrastingColor}
									commentId={comment?.commentId}
								/>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default CommentsDrawer;

