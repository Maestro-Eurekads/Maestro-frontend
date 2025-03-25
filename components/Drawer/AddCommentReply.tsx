import React, { useState } from 'react'
import AddReplytothisComment from './AddReplytothisComment'

const AddCommentReply = ({ setAddComment, addComment }) => {
	const [show, setShow] = useState(false)


	return (
		<div className=" w-full">
			{addComment &&
				<AddReplytothisComment />}


			<div className="flex w-full justify-end gap-5 mt-3">

				<button
					className="font-semibold text-[16px] leading-[22px] text-[#3175FF]" onClick={() => setAddComment(true)}>
					Add Reply to this comment
				</button>
				{addComment &&
					<button
						className="font-semibold text-[16px] leading-[22px] text-[#3175FF]" onClick={() => setAddComment(false)}>
						Hide Replies
					</button>
				}
			</div>
		</div>
	)
}

export default AddCommentReply