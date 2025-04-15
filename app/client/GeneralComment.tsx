import TableLoader from 'app/creation/components/TableLoader';
import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'store/useStore';

const GeneralComment = () => {
	const { generalComments, isLoadingGeneralComments } = useAppSelector((state) => state.comment);
	const [generalComment, setGeneralComment] = useState("");
	console.log("generalComments-generalComments", generalComments)
	useEffect(() => {
		if (generalComments?.[0]?.generalComment) {
			setGeneralComment(generalComments[0].generalComment);
		}
	}, [generalComments]);

	return (

		<div className="flex flex-col w-full">
			<label className="w-[124px] h-[19px] font-semibold text-[14px] leading-[19px] text-[#061237] mb-3" htmlFor="custom-textarea">
				General Comment
			</label>
			{isLoadingGeneralComments ? <TableLoader isLoading={isLoadingGeneralComments} /> : ""}
			<textarea
				disabled={true}
				id="custom-textarea"
				rows={3}
				defaultValue={generalComment}
				className="box-border flex flex-col justify-center items-end p-4 pb-[20px] gap-12 w-full bg-white border border-gray-300 shadow-sm rounded-lg resize-none focus:outline-none focus:border-[#3175FF] focus:ring-1 focus:ring-[#3175FF] "
				placeholder="General Comment"
			></textarea>
		</div>


	)
}

export default GeneralComment
