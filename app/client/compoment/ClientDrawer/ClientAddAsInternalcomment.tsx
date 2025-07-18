"use client";
import React, { useState } from 'react';
import send from "../../../../public/send.svg";
import closecircle from "../../../../public/close-circle.svg";
import Image from "next/image";
import { useComments } from 'app/utils/CommentProvider';
import CommentHeaderwithClose from './ClientCommentHeaderwithClose';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { SVGLoader } from 'components/SVGLoader';
import AlertMain from 'components/Alert/AlertMain';
import { useSession } from "next-auth/react";
import { cleanName } from 'components/Options';
import { useUserPrivileges } from 'utils/userPrivileges';
import { toast } from 'sonner';
import axios from 'axios';

const ClientAddAsInternalcomment = ({ position, setShow, campaign }) => {
	const { data: session }: any = useSession();
	const { addComment, isLoading, createCommentsError, comment, setComment, updatePosition } = useComments();
	const {
		campaignData,
		jwt
	} = useCampaigns();
	const [alert, setAlert] = useState(null);
	const { isClient, loggedInUser } = useUserPrivileges();
	const addcomment_as = ""
	const client_commentID = session?.user?.id.toString()
	const commentId = campaign?.campaign?.documentId
	const creator = {
		id: session?.user?.id,
		name: session?.user?.name,
	}




	const updateStatus = async (stage: string, label: string) => {
		if (!client_commentID) {
			console.warn("No campaign ID found — cannot update status");
			return;
		}

		try {
			const newStatus = {
				stage,
				label,
				actor: {
					id: loggedInUser?.id,
					name: loggedInUser?.username,
					role: loggedInUser?.user_type,
				},
				date: new Date().toISOString(),
			};

			const patchData = { isStatus: newStatus };

			await axios.put(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignData?.documentId}`,
				{ data: patchData },
				{ headers: { Authorization: `Bearer ${jwt}` } }
			);


			setShow(false);
			toast.success(`Media plan marked as '${label}'`);
		} catch (error) {
			if (error?.response?.status === 401) {
				const event = new Event("unauthorizedEvent");
				window.dispatchEvent(event);
			}
			toast.error(error?.message || "Failed to update status");
		}
	};


	// After comment is added, change the campaign status to "Changes Needed"
	const stage = isClient ? 'client_changes_needed' : 'changes_needed';
	const label = isClient ? 'Client Changes Needed' : 'Changes Needed';
	const handleAddComment = async () => {
		if (comment.trim() === "") return;

		try {
			await addComment(commentId, comment, position, addcomment_as, creator, client_commentID);
			await updateStatus(stage, label);
			await updatePosition(commentId, position);
			setComment("");
		} catch (error) {
			toast.error(error.message);
		}
	};




	return (
		<div className='cursor-move z-50'>
			{alert && <AlertMain alert={alert} />}
			<div className="w-[395px] flex flex-col items-start p-[10px_20px] bg-white border border-black rounded-[8px]">
				<div className="flex justify-between items-center gap-3 w-full">
					<div className="flex items-center gap-2">
						<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">
							{cleanName(session?.user?.name[0])}
						</div>
						<CommentHeaderwithClose author={cleanName(session?.user?.name)} />
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
					<div />
					{/* <InternalDropdowns setSelectedOption={setSelectedOption} selectedOption={selectedOption} /> */}
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

export default ClientAddAsInternalcomment;



