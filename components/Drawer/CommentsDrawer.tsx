// import { useState } from 'react';
// import Image from "next/image";
// import closecircle from "../../public/close-circle.svg";
// import Mmessages from "../../public/message-2.svg";
// import Comments from './Comments';
// import AddCommentReply from './AddCommentReply';
// import CommentReply from './CommentReply';



// const CommentsDrawer = ({ isOpen, onClose, setAddComment, addComment, message, setMessage }: any) => {
// 	const drawerclassNameName = `drawer-container ${isOpen ? 'drawer-open' : ''}`;


// 	return (
// 		<div className={`${drawerclassNameName} overflow-y-auto max-h-screen`}>
// 			<div className="flex w-full justify-between p-3">
// 				<div>
// 					<h3 className="font-[500] text-[24px] leading-[32px] text-[#292929]">
// 						Comments For
// 					</h3>
// 					<p className="font-[500] text-[16px] leading-[22px] text-[#292929]">
// 						Spring Sale Awareness
// 					</p>
// 				</div>
// 				<button
// 					onClick={() => {
// 						onClose(false);
// 						setMessage(false);
// 					}}
// 				>
// 					<Image src={closecircle} alt={"closecircle"} />
// 				</button>
// 			</div>

// 			{/* Scrollable Content */}
// 			<div className="faq-container p-5 overflow-y-auto max-h-[calc(100vh-100px)]">
// 				{message ? (
// 					<div className="flex flex-col justify-between items-start p-5 gap-4 w-full min-h-[203px] bg-white shadow-[0px_4px_14px_rgba(0,38,116,0.15)] rounded-[12px] border-box">
// 						<Comments />
// 						{addComment && <CommentReply />}
// 						<AddCommentReply setAddComment={setAddComment} addComment={addComment} />
// 					</div>
// 				) : (
// 					<div className="w-full justify-center mt-5">
// 						<div className="w-full flex flex-col justify-center items-center gap-5">
// 							<button>
// 								<Image src={Mmessages} alt="closecircle" />
// 							</button>
// 							<h6 className="w-[286px] h-[54px] font-medium text-[20px] leading-[27px] text-center text-black">
// 								Add a comment, your comments will appear here!
// 							</h6>
// 						</div>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);

// }

// export default CommentsDrawer;


import Image from "next/image";
import closecircle from "../../public/close-circle.svg";
import Mmessages from "../../public/message-2.svg";
import Comments from "./Comments";
import AddCommentReply from "./AddCommentReply";
import { useComments } from "app/utils/CommentProvider";

const CommentsDrawer = ({ isOpen, onClose }) => {
	const { comments } = useComments(); // Get comments from context

	return (
		<div className={`drawer-container ${isOpen ? "drawer-open" : ""} overflow-y-auto max-h-screen`}>
			<div className="flex w-full justify-between p-3">
				<div>
					<h3 className="font-[500] text-[24px] leading-[32px] text-[#292929]">Comments For</h3>
					<p className="font-[500] text-[16px] leading-[22px] text-[#292929]">Spring Sale Awareness</p>
				</div>
				<button onClick={() => onClose(false)}>
					<Image src={closecircle} alt="closecircle" />
				</button>
			</div>

			{/* Comments Section */}
			<div className="faq-container p-5 overflow-y-auto max-h-[calc(100vh-100px)]">
				{comments.length > 0 ? (
					comments.map((comment) => (
						<div className="flex flex-col    p-5 gap-4 w-full min-h-[203px] bg-white shadow-[0px_4px_14px_rgba(0,38,116,0.15)] rounded-[12px] border-box mb-5">
							<Comments comment={comment} />
							<AddCommentReply commentId={comment.id} />
						</div>
					))
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




