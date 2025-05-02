import React from 'react';
import send from "../../public/send.svg";
import closecircle from "../../public/close-circle.svg";
import Image from "next/image";
import { useComments } from 'app/utils/CommentProvider';
import RealCommentHeaderwithClose from './RealCommentHeaderwithClose';


// const Showcomment = ({ comment, setActiveComment }) => {
// 	const { setViewcommentsId, setIsDrawerOpen, setShowbyID } = useComments();


// 	const handleViewComment = (documentId) => {
// 		setIsDrawerOpen(true);
// 		setViewcommentsId(documentId);
// 	};

// 	return (
// 		<div className='cursor-move'>
// 			<div className="w-[395px] flex flex-col items-start p-[10px_20px] bg-white border border-black rounded-[8px]">
// 				<div className="flex justify-between items-center gap-3 w-full">
// 					<div className="flex items-center gap-2">
// 						<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">
// 							{comment?.creator?.name[0] || "?"}
// 						</div>
// 						<RealCommentHeaderwithClose author={comment?.creator?.name} comment={comment} />
// 					</div>

// 					{/* Mark as Approved Button */}
// 					<button onClick={() => setActiveComment(null)}>
// 						<Image src={closecircle} alt="close-circle" className='w-[26px]' />
// 					</button>
// 				</div>

// 				{/* Textarea for Adding a Comment */}
// 				<textarea
// 					className="w-full   font-medium text-[16px] text-[#292929] py-3 px-4 rounded-md resize-none overflow-hidden focus:outline-none"
// 					rows={4}
// 					defaultValue={comment?.text}
// 					placeholder="Write your comment..."
// 				/>

// 				{/* Buttons */}
// 				<div className="flex w-full justify-between">
// 					{comment?.client_commentID === null ? <div>
// 						<h3 className={`font-semibold text-[15px] leading-[20px] text-[#00A36C] ${comment?.addcomment_as === "Internal" ? "text-green-500" : "text-red-500"}`}>
// 							{comment?.addcomment_as === "Internal" ? "Internal" : "Client"}</h3>
// 					</div> : ""}
// 					<div>
// 						<button
// 							onClick={() => { handleViewComment(comment?.documentId); setShowbyID(true) }}
// 							className="flex flex-row justify-center items-center px-[28px] py-[10px] gap-[8px] w-[135px] h-[40px] bg-[#3175FF] rounded-[8px] font-semibold text-[15px] leading-[20px] text-white cursor-pointer" >
// 							Comment
// 							<Image src={send} alt="send" />
// 						</button>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default Showcomment;

const Showcomment = ({ comment, setActiveComment }) => {
	const { setViewcommentsId, setIsDrawerOpen, setShowbyID } = useComments();

	const handleViewComment = (documentId) => {
		setIsDrawerOpen(true);
		setViewcommentsId(documentId);
	};

	return (
		<div className='cursor-move'>
			<div className="w-[320px] flex flex-col items-start p-[8px_16px] bg-white border border-black rounded-[6px]">
				<div className="flex justify-between items-center gap-2 w-full">
					<div className="flex items-center gap-2">
						<div className="flex flex-col justify-center items-center p-[8px] w-[34px] h-[34px] bg-[#00A36C] rounded-full text-[16px] text-white">
							{comment?.creator?.name[0] || "?"}
						</div>
						<RealCommentHeaderwithClose author={comment?.creator?.name} comment={comment} />
					</div>

					<button onClick={() => setActiveComment(null)}>
						<Image src={closecircle} alt="close-circle" className='w-[22px]' />
					</button>
				</div>

				<textarea
					className="w-full font-medium text-[14px] text-[#292929] py-2 px-3 rounded-md resize-none overflow-hidden focus:outline-none"
					rows={3}
					defaultValue={comment?.text}
					placeholder="Write your comment..."
				/>

				<div className="flex w-full justify-between mt-1">
					{comment?.client_commentID === null ? (
						<div>
							<h3 className={`font-semibold text-[13px] text-[#00A36C] ${comment?.addcomment_as === "Internal" ? "text-green-500" : "text-red-500"}`}>
								{comment?.addcomment_as === "Internal" ? "Internal" : "Client"}
							</h3>
						</div>
					) : ""}
					<div>
						<button
							onClick={() => { handleViewComment(comment?.documentId); setShowbyID(true); }}
							className="flex justify-end  px-[20px] py-[8px] gap-[6px] h-[36px] bg-[#3175FF] rounded-[6px] font-semibold text-[14px] text-white cursor-pointer"
						>
							{/* Comment */}
							<Image src={send} alt="send" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Showcomment;

