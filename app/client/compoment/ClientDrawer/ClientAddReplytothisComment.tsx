import React, { useState } from 'react';
import Image from "next/image";
import tickcircle from "../public/tick-circle.svg";
import send from "../../../../public/send.svg";
import { useComments } from 'app/utils/CommentProvider';
import { SVGLoader } from 'components/SVGLoader';
import { useSession } from 'next-auth/react';
import { cleanName } from 'components/Options';

const ClientAddReplytothisComment = ({ onReplySubmit }) => {
	const { data: session }: any = useSession();
	const { isLoadingReply, setReplyText, replyText } = useComments();


	const handleReplySubmit = () => {
		if (!replyText.trim()) return;

		const newReply = {
			name: session?.user?.name,
			date: new Date().toLocaleDateString(),
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			message: replyText,
		};

		onReplySubmit(newReply); // Pass reply back to parent component 
	};

	return (
		<div className='w-full'>
			<div className="w-full flex flex-col items-start p-[10px] px-[20px] min-h-[200px] border border-[#3175ff4d] rounded-lg">
				<div className='w-full'>
					<div className='flex justify-between items-center gap-3 '>
						<div className='flex items-center gap-2 '>
							<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">
								{cleanName(session?.user?.name[0]) || "?"}
							</div>
							<div>
								<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">{cleanName(session?.user?.name)}</h3>
								<div className='flex items-center gap-2'>
									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">{new Date().toLocaleDateString()}</p>
									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">{new Date().toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
										hour12: true,
									})}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="font-[500] text-[16px] leading-[22px] text-[#292929] py-5">
						<textarea
							className="w-full font-medium text-[16px] text-[#292929] py-3 px-4 rounded-md resize-none overflow-hidden focus:outline-none"
							rows={5}
							placeholder="Write your reply here..."
							value={replyText}
							onChange={(e) => setReplyText(e.target.value)}
						/>
					</div>

					<div className='flex w-full justify-between'>
						{/* <button>
							<h3 className="font-semibold text-[15px] leading-[20px] text-[#00A36C]">Add as internal</h3>
						</button> */}
						<div>
							<button
								onClick={handleReplySubmit}
								className="flex flex-row justify-center items-center px-[28px] py-[10px] gap-[8px] w-[135px] h-[40px] bg-[#3175FF] rounded-[8px] font-semibold text-[15px] leading-[20px] text-white">

								{/* Comment */}
								{isLoadingReply ? (
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
		</div>
	);
}

export default ClientAddReplytothisComment;
