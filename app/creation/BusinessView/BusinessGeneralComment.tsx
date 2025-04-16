

import { useCampaigns } from 'app/utils/CampaignsContext';
import { useComments } from 'app/utils/CommentProvider';
import { SVGLoader } from 'components/SVGLoader';
import { getGeneralComment, reset } from 'features/Comment/commentSlice';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'store/useStore';
import TableLoader from '../components/TableLoader';
import AlertMain from 'components/Alert/AlertMain';
import { useSearchParams } from 'next/navigation';

const BusinessGeneralComment = () => {
	const { campaignData } = useCampaigns();
	const query = useSearchParams();
	const commentId = query.get("campaignId");
	const { data: session }: any = useSession();
	const { generalComments, isLoadingGeneralComments } = useAppSelector((state) => state.comment);
	const {
		addGeneralComment,
		generalcommentsSuccess,
		isLoadingGeneral,
		generalError,
		generalComment,
		setGeneralComment,
		updateGeneralComment
	} = useComments();
	const dispatch = useAppDispatch();
	const [alert, setAlert] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [hasChange, setHasChange] = useState(false);
	const [id, setid] = useState("");



	// const commentId = campaignData?.documentId;
	const author = {
		id: session?.user?.id,
		name: session?.user?.name,
	};

	useEffect(() => {
		if (generalComments?.[0]?.generalComment) {
			setGeneralComment(generalComments[0].generalComment);
			setid(generalComments[0].documentId);
			setIsEditing(true);
		} else {
			setIsEditing(false);
		}
	}, [generalComments]);



	const handleGeneralComment = async () => {
		if (generalComment.trim() === "") return;
		try {
			await addGeneralComment(commentId, generalComment, author);
		} catch (error) {
			// handle error
		}
	};
	const handleUpdateGeneralComment = async () => {
		if (generalComment.trim() === "") return;
		try {
			await updateGeneralComment(commentId, generalComment, author, id);
		} catch (error) {
			// handle error
		}
	};

	// useEffect(() => {
	// 	dispatch(getGeneralComment(commentId));
	// }, [ ]);


	useEffect(() => {
		if (alert) {
			const timer = setTimeout(() => setAlert(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [alert]);

	useEffect(() => {
		if (generalcommentsSuccess) {
			setAlert({
				variant: "success",
				message: "Comment created!",
				position: "bottom-right",
			});
			dispatch(reset());
		}
		if (generalError) {
			setAlert({
				variant: "error",
				message:
					generalError.response?.data?.error.message || generalError.message,
				position: "bottom-right",
			});
		}
	}, [generalcommentsSuccess, generalError]);

	const handleGeneral = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		setGeneralComment(e.target.value);
		setHasChange(true)
	};


	return (
		<div>
			{alert && <AlertMain alert={alert} />}
			<div className="flex flex-col w-full relative">
				<label
					className="w-[124px] h-[19px] font-semibold text-[14px] leading-[19px] text-[#061237] mb-3"
					htmlFor="custom-textarea"
				>
					General Comment
				</label>
				{isLoadingGeneralComments ? <TableLoader isLoading={isLoadingGeneralComments} /> : ""}

				<textarea
					id="custom-textarea"
					rows={3}
					value={generalComment}
					// onChange={(e) => setGeneralComment(e.target.value)}
					onChange={handleGeneral}
					className="box-border flex flex-col justify-center items-end p-4 pb-[20px] gap-12 w-full bg-white border border-gray-300 shadow-sm rounded-lg resize-none focus:outline-none focus:border-[#3175FF] focus:ring-1 focus:ring-[#3175FF]"
					placeholder="Facebook ad targeting 18-24 works well here."
				/>

				{generalComment.trim() && (
					<button
						onClick={isEditing ? handleUpdateGeneralComment : handleGeneralComment}
						className="absolute right-3 bottom-3 px-4 py-2 bg-[#3175FF] text-white text-sm font-medium rounded-md shadow hover:bg-[#2563eb] transition-colors"
					>
						{isLoadingGeneral ? (
							<SVGLoader width={"25px"} height={"25px"} color={"#FFF"} />
						) : isEditing ? (
							"Update Comment"
						) : (
							"Add Comment"
						)}
					</button>
				)}


			</div>
		</div>
	);
};

export default BusinessGeneralComment;



