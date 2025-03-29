import React, { useState } from 'react';
import tickcircle from "../../public/tick-circle.svg";
import send from "../../public/send.svg";
import closecircle from "../../public/close-circle.svg";
import Image from "next/image";
import { useComments } from 'app/utils/CommentProvider';
import CommentHeaderwithClose from './CommentHeaderwithClose';
import InternalDropdowns from 'components/InternalDropdowns';


const Showcomment = ({ author = "John Doe", comment, setActiveComment }) => {
	const { addComment, setViewcommentsId, isDrawerOpen, setIsDrawerOpen } = useComments(); // Context for adding a comment
	const [text, setText] = useState(""); // State for comment input

	// Handle adding a new comment
	const handleAddComment = () => {
		if (text.trim() === "") return; // Prevent empty comments
		addComment({ commentId: Date.now(), text, position: comment.position }); // Store at the correct position
		setText(""); // Reset input
	};

	return (

		<div className='cursor-move'>
			<div className="w-[395px] flex flex-col items-start p-[10px_20px] bg-white border border-black rounded-[8px]">
				<div className="flex justify-between items-center gap-3 w-full">
					<div className="flex items-center gap-2">
						<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">
							{author[0] || "John Doe"}
						</div>
						<CommentHeaderwithClose author={author} timestamp={new Date().toLocaleString()} />
					</div>

					{/* Mark as Approved Button */}
					<button onClick={() => setActiveComment(null)}>
						<Image src={closecircle} alt="close-circle" className='w-[26px]' />
					</button>
				</div>

				{/* Textarea for Adding a Comment */}
				<textarea
					className="w-full   font-medium text-[16px] text-[#292929] py-3 px-4 rounded-md resize-none overflow-hidden focus:outline-none"
					rows={4}
					defaultValue={comment.text}
					onChange={handleAddComment}
					placeholder="Write your comment..."
				/>

				{/* Buttons */}
				<div className="flex w-full justify-between">
					{/* <InternalDropdowns /> */}
					<button onClick={handleAddComment}>
						<h3 className="font-semibold text-[15px] leading-[20px] text-[#00A36C]">Add as internal</h3>
					</button>
					<div>
						<button
							onClick={() => { setViewcommentsId(comment.commentId); setIsDrawerOpen(true) }}
							className="flex flex-row justify-center items-center px-[28px] py-[10px] gap-[8px] w-[135px] h-[40px] bg-[#3175FF] rounded-[8px] font-semibold text-[15px] leading-[20px] text-white cursor-pointer"
						>
							Comment
							<Image src={send} alt="send" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Showcomment;
