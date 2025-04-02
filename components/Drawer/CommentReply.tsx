import { useComments } from "app/utils/CommentProvider";
import { useEffect, useState } from "react";
import { useAppSelector } from "store/useStore";




const CommentReply = ({ documentId, contrastingColor }) => {
	// const { data: comments } = useAppSelector((state) => state.comment);
	const { comments } = useComments();
	// const { comments } = useComments();
	const [replies, setReplies] = useState([]);

	useEffect(() => {
		const comment = comments?.find((c) => c?.documentId === documentId);
		setReplies(comment?.replies || []); // Ensure it's always an array
	}, [comments, documentId]);




	return (
		<div className="w-full flex flex-col">
			{/* Reply Header */}
			{replies?.length > 0 && (
				<div className="flex items-center gap-1 w-full">
					<div className="w-[20px] h-0 border border-black/50" />
					<p className="flex items-center font-medium text-[12px] leading-[16px] text-black/50">
						{replies?.length} {replies?.length === 1 ? "Reply" : "Replies"}
					</p>
					<div className="w-[70%] h-0 border border-black/50" />
				</div>
			)}



			{/* Replies List */}
			<div className="w-full mt-5 px-8 pt-4">
				{replies?.map((reply) => (
					<div key={reply?.documentId} className="mb-5">
						{/* User Info */}
						<div className="flex justify-between items-center gap-3">
							<div className="flex items-center gap-2">
								<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px]   rounded-full text-[20px] leading-[27px] text-center text-white"
									style={{ backgroundColor: contrastingColor }}>
									{reply?.author ? reply?.author[0] : "U"}
								</div>
								<div>
									<h3 className="font-[500] text-[16px] leading-[24px] text-[#292929]">
										{reply?.name || "Unknown User"}
									</h3>
									<div className="flex items-center gap-2">
										<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
											{reply?.date || "N/A"}
										</p>
										<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
											{reply?.time || "N/A"}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Reply Content */}
						<p
							className="w-full font-medium text-[16px] text-[#292929] py-3 px-4 rounded-md resize-none overflow-hidden focus:outline-none" >
							{reply?.message}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default CommentReply;
