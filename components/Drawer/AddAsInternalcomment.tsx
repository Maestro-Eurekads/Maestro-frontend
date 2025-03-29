import React, { useState } from 'react';
import tickcircle from "../../public/tick-circle.svg";
import send from "../../public/send.svg";
import closecircle from "../../public/close-circle.svg";
import Image from "next/image";
import { useComments } from 'app/utils/CommentProvider';
import CommentHeaderwithClose from './CommentHeaderwithClose';
import InternalDropdowns from 'components/InternalDropdowns';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { SVGLoader } from 'components/SVGLoader';

const AddAsInternalcomment = ({ author = "John Doe", position, setShow }) => {
	const { clientCampaignData } = useCampaigns();
	const { addComment, loading } = useComments();
	const [comment, setComment] = useState(""); // State for comment text 
	const [selectedOption, setSelectedOption] = useState("Add as Internal");
	const addcomment_as = selectedOption === "Add as Internal" ? "Internal" : "Client";
	console.log('clientCampaignData', clientCampaignData)
	const commentId = "tu7mhiio4aivd78xo0vowimb"
	// Handle adding a new comment
	const handleAddComment = () => {
		if (comment.trim() === "") return; // Prevent empty comm  
		addComment(comment, position, addcomment_as);
		setComment(""); // Reset input 
	};



	return (
		<div className='cursor-move z-50'>
			<div className="w-[395px] flex flex-col items-start p-[10px_20px] bg-white border border-black rounded-[8px]">
				<div className="flex justify-between items-center gap-3 w-full">
					<div className="flex items-center gap-2">
						<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">
							{author[0]}
						</div>
						<CommentHeaderwithClose author={author} timestamp={new Date().toLocaleString()} />
					</div>

					{/* Mark as Approved Button */}
					<button onClick={() => setShow(false)}>
						<Image src={closecircle} alt="close-circle" className='w-[26px]' />
					</button>
				</div>

				{/* Textarea for Adding a Comment */}
				<textarea
					className="w-full font-medium text-[16px] text-[#292929] py-3 px-4 rounded-md resize-none overflow-hidden focus:outline-none"
					rows={4}
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder="Write your comment..."
				/>

				{/* Buttons */}
				<div className="flex items-center w-full justify-between">
					<InternalDropdowns setSelectedOption={setSelectedOption} selectedOption={selectedOption} />
					{/* <button onClick={handleAddComment}>
						<h3 className="font-semibold text-[15px] leading-[20px] text-[#00A36C]">Add as internal</h3>
					</button> */}
					<div>
						<button
							onClick={handleAddComment}
							className="flex flex-row justify-center items-center px-[28px] py-[10px] gap-[8px] w-[135px] h-[40px] bg-[#3175FF] rounded-[8px] font-semibold text-[15px] leading-[20px] text-white cursor-pointer z-40"
						>
							{/* Comment */}
							{loading ? (
								<SVGLoader width={"25px"} height={"25px"} color={"#FFF"} />
							) : (
								"Comment"
							)}
							<Image src={send} alt="send" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddAsInternalcomment;

