"use client";
import React, { useState } from 'react';
import send from "../../public/send.svg";
import closecircle from "../../public/close-circle.svg";
import Image from "next/image";
import { useComments } from 'app/utils/CommentProvider';
import CommentHeaderwithClose from './CommentHeaderwithClose';
import InternalDropdowns from 'components/InternalDropdowns';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { SVGLoader } from 'components/SVGLoader';
import AlertMain from 'components/Alert/AlertMain';
import { useSession } from "next-auth/react";
import { useSearchParams } from 'next/navigation';

const AddAsInternalcomment = ({ position, setShow }) => {
	const { campaignData } = useCampaigns();
	const { data: session }: any = useSession();
	const { addComment, isLoading, createCommentsError, comment, setComment } = useComments();
	const [alert, setAlert] = useState(null);
	const [selectedOption, setSelectedOption] = useState("Add as Internal");
	const addcomment_as = selectedOption === "Add as Internal" ? "Internal" : "Client";
	// const commentId = campaignData?.documentId
	const query = useSearchParams();
	const commentId = query.get("campaignId");
	const creator = {
		id: session?.user?.id,
		name: session?.user?.name,
	}

	const handleAddComment = async () => {
		if (comment.trim() === "") return;
		try {
			await addComment(commentId, comment, position, addcomment_as, creator);
		} catch (error) {
		}
	};



	return (
		<div className='cursor-move z-50'>
			{alert && <AlertMain alert={alert} />}
			<div className="w-[395px] flex flex-col items-start p-[10px_20px] bg-white border border-black rounded-[8px]">
				<div className="flex justify-between items-center gap-3 w-full">
					<div className="flex items-center gap-2">
						<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">
							{session?.user?.name[0]}
						</div>
						<CommentHeaderwithClose author={session?.user?.name} />
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
					<div>
						<button
							onClick={handleAddComment}
							className="flex flex-row justify-center items-center px-[28px] py-[10px] gap-[8px] w-[135px] h-[40px] bg-[#3175FF] rounded-[8px] font-semibold text-[15px] leading-[20px] text-white cursor-pointer z-40 "
						>
							{/* Comment */}
							{isLoading ? (
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

