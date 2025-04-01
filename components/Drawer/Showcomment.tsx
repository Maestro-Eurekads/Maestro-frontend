import React from 'react';
import send from "../../public/send.svg";
import closecircle from "../../public/close-circle.svg";
import Image from "next/image";
import { useComments } from 'app/utils/CommentProvider';
import CommentHeaderwithClose from './CommentHeaderwithClose';


const Showcomment = ({ author = "John Doe", comment, setActiveComment }) => {
	const { setViewcommentsId, setIsDrawerOpen } = useComments();



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
					defaultValue={comment?.text}
					placeholder="Write your comment..."
				/>

				{/* Buttons */}
				<div className="flex w-full justify-between">
					<div>
						<h3 className={`font-semibold text-[15px] leading-[20px] text-[#00A36C] ${comment?.addcomment_as === "Internal" ? "text-green-500" : "text-red-500"}`}>
							{comment?.addcomment_as === "Internal" ? "Internal" : "Client"}</h3>
					</div>
					<div>
						<button
							onClick={() => { setIsDrawerOpen(true) }}
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
