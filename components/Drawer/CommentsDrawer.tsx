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
	const { opportunities, setViewcommentsId, viewcommentsId, addCommentOpportunity, clearCommentsAndOpportunities, createCommentsError, createCommentsSuccess, approvedError, replyError } = useComments();
	const {
		data: comments,
		isLoading,
		isError,
	} = useAppSelector((state) => state.comment);
	const dispatch = useAppDispatch();
	const { campaignData } = useCampaigns();
	const [alert, setAlert] = useState(null);


	// Function to create a new Comment Opportunity
	const createCommentOpportunity = () => {
		const newOpportunity = {
			commentId: Date.now(),
			text: "New Comment Opportunity",
			position: { x: 150, y: 150 },
		};
		addCommentOpportunity(newOpportunity);
	};

	const handleClose = () => {
		clearCommentsAndOpportunities();
		onClose(false);
		setViewcommentsId(false);
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
		dispatch(getComment());
	}, [dispatch]);



	return (
		<div className={`drawer-container ${isOpen ? "drawer-open" : ""} overflow-y-auto max-h-screen`}>

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



			{/* Comments Section */}
			<div className="faq-container p-5 overflow-y-auto max-h-[calc(100vh-100px)]">
				{isLoading ? (
					<div className="w-full h-full flex justify-center items-center py-5">
						<SVGLoader width={"35px"} height={"35px"} color={"#00A36C"} />
					</div>
				) : viewcommentsId ? ( // If viewcommentsId exists, show only the selected comment
					comments
						.filter((comment) => comment?.documentId === viewcommentsId)
						.map((comment) => {
							const randomColor = getRandomColor();
							const contrastingColor = getContrastingColor(randomColor);
							return (
								<div
									key={comment?.documentId}
									className="flex flex-col p-5 gap-4 w-full min-h-[203px] bg-white shadow-md rounded-lg border-box mb-5"
								>
									<Comments comment={comment} contrastingColor={contrastingColor} />
									<AddCommentReply commentId={comment?.documentId} contrastingColor={contrastingColor} />
								</div>
							);
						})
				) : opportunities?.length > 0 ? (
					comments?.map((comment) => {
						const randomColor = getRandomColor();
						const contrastingColor = getContrastingColor(randomColor);
						return (
							<div
								key={comment?.documentId}
								className="flex flex-col p-5 gap-4 w-full min-h-[203px] bg-white shadow-md rounded-lg border-box mb-5"
							>
								<Comments comment={comment} contrastingColor={contrastingColor} />
								<AddCommentReply commentId={comment?.documentId} contrastingColor={contrastingColor} />
							</div>
						);
					})
				) : isOpen && (
					<div className="w-full flex flex-col justify-center items-center gap-5 mt-5">
						<button onClick={createCommentOpportunity}>
							<Image src={Mmessages} alt="Add Comment Opportunity" />
						</button>
						<h6 className="w-72 text-xl text-center text-black">
							Add a comment, your comments will appear here!
						</h6>
					</div>
				)}
			</div>

		</div>
	);
};

export default CommentsDrawer;




