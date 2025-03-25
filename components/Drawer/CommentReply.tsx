// import React from 'react'
// import Image from "next/image";
// import tickcircle from "../../public/tick-circle.svg";

import { useComments } from "app/utils/CommentProvider";
import { useEffect, useState } from "react";

// const CommentReply = () => {
// 	return (
// 		<div className=" w-full flex  flex-col">

// 			<div className='flex items-center gap-1 w-full'>
// 				<div className="w-[20px] h-0 border border-black/50" /> <p className=" flex items-center   font-medium text-[12px] leading-[16px] text-black/50">
// 					1 Reply</p><div className="w-[70%] h-0 border border-black/50" />
// 			</div>


// 			<div className='w-full mt-5 px-8 pt-4'>

// 				<div>
// 					<div className='flex justify-between items-center gap-3 '>
// 						<div className='flex  items-center gap-2 '>
// 							<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">D</div>
// 							<div>
// 								<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">
// 									Daniel Silva</h3>
// 								<div className='flex items-center gap-2'>
// 									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
// 										12/01/25 </p>
// 									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
// 										12:09 P.M</p>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 					<textarea
// 						className="w-full font-medium text-[16px] text-[#292929] py-3 px-4 rounded-md resize-none overflow-hidden focus:outline-none"
// 						rows={5}
// 						defaultValue="This is a sample comment comprising of dummy text and any other existing material. Facebook ad targeting 18-24 works well here."
// 					/>

// 				</div>
// 				<div className='w-full  '>
// 					<div className='w-full flex justify-between items-center gap-3 '>
// 						<div className=' w-full flex  items-center gap-2 '>
// 							<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">D</div>
// 							<div>
// 								<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">
// 									Daniel Silva</h3>
// 								<div className='flex items-center gap-2'>
// 									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
// 										12/01/25 </p>
// 									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
// 										12:09 P.M</p>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 					<textarea
// 						className="w-full font-medium text-[16px] text-[#292929] py-3 px-4 rounded-md resize-none overflow-hidden focus:outline-none"
// 						rows={5}
// 						defaultValue="This is a sample comment comprising of dummy text and any other existing material. Facebook ad targeting 18-24 works well here."
// 					/>

// 				</div>
// 			</div>
// 		</div>
// 	)
// }

// export default CommentReply






const CommentReply = ({ commentId }) => {
	const { comments } = useComments();
	const [replies, setReplies] = useState([]);

	useEffect(() => {
		const comment = comments.find((c) => c.id === commentId);
		setReplies(comment?.replies || []); // Ensure it's always an array
	}, [comments, commentId]);

	console.log('replies', replies)

	return (
		<div className="w-full flex flex-col">
			{/* Reply Header */}
			{replies.length > 0 && (
				<div className="flex items-center gap-1 w-full">
					<div className="w-[20px] h-0 border border-black/50" />
					<p className="flex items-center font-medium text-[12px] leading-[16px] text-black/50">
						{replies.length} {replies.length === 1 ? "Reply" : "Replies"}
					</p>
					<div className="w-[70%] h-0 border border-black/50" />
				</div>
			)}



			{/* Replies List */}
			<div className="w-full mt-5 px-8 pt-4">
				{replies.map((reply) => (
					<div key={reply.id} className="mb-5">
						{/* User Info */}
						<div className="flex justify-between items-center gap-3">
							<div className="flex items-center gap-2">
								<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">
									{reply.author ? reply.author[0] : "U"}
								</div>
								<div>
									<h3 className="font-[500] text-[16px] leading-[24px] text-[#292929]">
										{reply.name || "Unknown User"}
									</h3>
									<div className="flex items-center gap-2">
										<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
											{reply.date || "N/A"}
										</p>
										<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
											{reply.time || "N/A"}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Reply Content */}
						<textarea
							className="w-full font-medium text-[16px] text-[#292929] py-3 px-4 rounded-md resize-none overflow-hidden focus:outline-none"
							rows={3}
							defaultValue={reply.message}
							readOnly
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default CommentReply;
