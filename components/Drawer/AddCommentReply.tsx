import React from 'react'

const AddCommentReply = ({ setAddComment, addComment }) => {
	return (
		<div className="flex w-full justify-end gap-5 mt-3">
			<button className="font-semibold text-[16px] leading-[22px] text-[#3175FF]" onClick={() => setAddComment(true)}>
				Add Reply to this comment
			</button>
			{addComment &&
				<button

					className="font-semibold text-[16px] leading-[22px] text-[#3175FF]" onClick={() => setAddComment(false)}>
					Hide Replies
				</button>
			}
		</div>
	)
}

export default AddCommentReply