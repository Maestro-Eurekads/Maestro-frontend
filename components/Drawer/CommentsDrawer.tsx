import Image from "next/image";
import closecircle from "../../public/close-circle.svg";
import Mmessages from "../../public/message-2.svg";
import Comments from "./Comments";
import AddCommentReply from "./AddCommentReply";
import { useComments } from "app/utils/CommentProvider";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getContrastingColor, getRandomColor } from "components/Options";

const CommentsDrawer = ({ isOpen, onClose }) => {
	const { comments, opportunities, setViewcommentsId, viewcommentsId, addCommentOpportunity, clearCommentsAndOpportunities } = useComments();
	const { campaignData } = useCampaigns();

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

	return (
		<div className={`drawer-container ${isOpen ? "drawer-open" : ""} overflow-y-auto max-h-screen`}>
			<div className="flex w-full justify-between p-3">
				<div>
					<h3 className="font-medium text-2xl text-[#292929]">Comments For</h3>
					<p className="font-medium text-lg text-[#292929]">
						{campaignData?.media_plan_details?.plan_name
							? campaignData?.media_plan_details?.plan_name.charAt(0).toUpperCase() +
							campaignData?.media_plan_details?.plan_name.slice(1)
							: ""}
						Awareness
					</p>
				</div>
				<button onClick={handleClose}>
					<Image src={closecircle} alt="Close" />
				</button>
			</div>

			{/* Comments Section */}
			<div className="faq-container p-5 overflow-y-auto max-h-[calc(100vh-100px)]">
				{viewcommentsId ? ( // If viewcommentsId exists, show only the selected comment
					comments
						.filter((comment) => comment.commentId === viewcommentsId)
						.map((comment) => {
							const randomColor = getRandomColor();
							const contrastingColor = getContrastingColor(randomColor);
							return (
								<div
									key={comment.commentId}
									className="flex flex-col p-5 gap-4 w-full min-h-[203px] bg-white shadow-md rounded-lg border-box mb-5"
								>
									<Comments comment={comment} contrastingColor={contrastingColor} />
									<AddCommentReply commentId={comment.commentId} contrastingColor={contrastingColor} />
								</div>
							);
						})
				) : opportunities.length > 0 ? (
					comments.map((comment) => {
						const randomColor = getRandomColor();
						const contrastingColor = getContrastingColor(randomColor);
						return (
							<div
								key={comment.commentId}
								className="flex flex-col p-5 gap-4 w-full min-h-[203px] bg-white shadow-md rounded-lg border-box mb-5"
							>
								<Comments comment={comment} contrastingColor={contrastingColor} />
								<AddCommentReply commentId={comment.commentId} contrastingColor={contrastingColor} />
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




