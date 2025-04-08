import Image from "next/image";
import closecircle from "../../public/close-circle.svg";
import Mmessages from "../../public/message-2.svg";
import Comments from "./Comments";
import AddCommentReply from "./AddCommentReply";
import { useComments } from "app/utils/CommentProvider";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getContrastingColor, getRandomColor } from "components/Options";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/useStore";
import { getComment } from "features/Comment/commentSlice";
import { SVGLoader } from "components/SVGLoader";
import AlertMain from "components/Alert/AlertMain";

const CommentsDrawer = ({ isOpen, onClose }) => {
	const { opportunities, setViewcommentsId, viewcommentsId, addCommentOpportunity, setOpportunities, createCommentsError, createCommentsSuccess, approvedError, replyError, setIsCreateOpen, setClose } = useComments();
	const {
		data: comments,
		isLoading,
		isError,
	} = useAppSelector((state) => state.comment);
	const dispatch = useAppDispatch();
	const { campaignData } = useCampaigns();
	const [alert, setAlert] = useState(null);
	const [commentColors, setCommentColors] = useState({});
	const commentId = campaignData?.documentId




	useEffect(() => {
		const newColors = {};
		comments?.forEach((comment) => {
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

	// Function to create a new Comment Opportunity
	const createCommentOpportunity = () => {
		const newOpportunity = {
			commentId: Date.now(),
			text: "New Comment Opportunity",
			position: { x: 150, y: 150 },
		};

		// Add only if there are 0  
		if (opportunities.length === 0) {
			setIsCreateOpen(true);
			addCommentOpportunity(newOpportunity);
		}
	};




	const handleClose = () => {
		setOpportunities([]);
		onClose(false);
		setViewcommentsId(false);
		setClose(false)
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

	useEffect(() => {
		dispatch(getComment(commentId));
	}, [dispatch]);





	return (
		<div className={`drawer-container ${isOpen ? "drawer-open" : ""}   max-h-screen`}>

			{alert && <AlertMain alert={alert} />}
			<div className="flex w-full justify-between p-3">
				<div>
					<h3 className="font-medium text-2xl text-[#292929]">Comments For</h3>
					<div className="flex  items-center gap-2 w-full">
						<p className="font-medium text-lg text-[#292929]">
							{campaignData?.media_plan_details?.plan_name
								? campaignData?.media_plan_details?.plan_name.charAt(0).toUpperCase() +
								campaignData?.media_plan_details?.plan_name.slice(1)
								: ""}
						</p>
						<p className="font-medium text-lg text-[#292929]">
							Awareness
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
				<h6 className="w-[70%] text-center text-black text-[16px]">
					Add a comment, your comments will appear here!
				</h6>
			</div>

			{/* Comments Section */}
			<div className="faq-container p-5 overflow-y-auto max-h-[calc(88vh-100px)]">
				{isLoading ? (
					<div className="w-full h-full flex justify-center items-center py-5">
						<SVGLoader width={"35px"} height={"35px"} color={"#00A36C"} />
					</div>
				) : viewcommentsId ? (
					comments
						.filter((comment) => comment?.documentId === viewcommentsId)
						.map((comment) => {
							const { color, contrastingColor } = commentColors[comment?.documentId] || {};
							return (
								<div
									key={comment?.documentId}
									className="flex flex-col p-5 gap-4 w-full min-h-[203px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.1)] rounded-lg border-box mb-5"
								>
									<Comments comment={comment} contrastingColor={contrastingColor} />
									<AddCommentReply documentId={comment?.documentId} contrastingColor={contrastingColor} commentId={comment?.commentId} />
								</div>
							);
						})
				) : (
					comments?.map((comment) => {
						const { color, contrastingColor } = commentColors[comment?.documentId] || {};
						return (
							<div
								key={comment?.documentId}
								className="flex flex-col p-5 gap-4 w-full min-h-[203px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.1)] rounded-lg border-box mb-5"
							>
								<Comments comment={comment} contrastingColor={contrastingColor} />
								<AddCommentReply documentId={comment?.documentId} contrastingColor={contrastingColor} commentId={comment?.commentId} />
							</div>
						);
					})
				)}
			</div>

		</div>
	);
};

export default CommentsDrawer;




