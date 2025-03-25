import Image from "next/image";
import closecircle from "../../public/close-circle.svg";
import Mmessages from "../../public/message-2.svg";
import Comments from "./Comments";
import AddCommentReply from "./AddCommentReply";
import { useComments } from "app/utils/CommentProvider";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getContrastingColor, getRandomColor } from "components/Options";

const CommentsDrawer = ({ isOpen, onClose }) => {
	const { comments } = useComments(); // Get comments from context
	const {
		campaignData
	} = useCampaigns();


	return (
		<div className={`drawer-container ${isOpen ? "drawer-open" : ""} overflow-y-auto max-h-screen`}>
			<div className="flex w-full justify-between p-3">
				<div>
					<h3 className="font-[500] text-[24px] leading-[32px] text-[#292929]">Comments For</h3>
					<p className="font-[500] text-[16px] leading-[22px] text-[#292929]">
						{campaignData?.media_plan_details?.plan_name
							? campaignData?.media_plan_details?.plan_name.charAt(0).toUpperCase() +
							campaignData?.media_plan_details?.plan_name.slice(1)
							: ""} Awareness
					</p>
				</div>
				<button onClick={() => onClose(false)}>
					<Image src={closecircle} alt="closecircle" />
				</button>
			</div>

			{/* Comments Section */}
			<div className="faq-container p-5 overflow-y-auto max-h-[calc(100vh-100px)]">
				{comments.length > 0 ? (
					comments.map((comment) => {
						const randomColor = getRandomColor();
						const contrastingColor = getContrastingColor(randomColor);
						return (
							<div key={comment.id} className="flex flex-col p-5 gap-4 w-full min-h-[203px] bg-white shadow-[0px_4px_14px_rgba(0,38,116,0.15)] rounded-[12px] border-box mb-5">
								<Comments comment={comment} contrastingColor={contrastingColor} />
								<AddCommentReply commentId={comment.id} contrastingColor={contrastingColor} />
							</div>
						);
					})
				) : (
					<div className="w-full justify-center mt-5">
						<div className="flex flex-col justify-center items-center gap-5">
							<button>
								<Image src={Mmessages} alt="messages" />
							</button>
							<h6 className="w-[286px] text-[20px] text-center text-black">
								Add a comment, your comments will appear here!
							</h6>
						</div>
					</div>
				)}

			</div>
		</div>
	);
};

export default CommentsDrawer;




