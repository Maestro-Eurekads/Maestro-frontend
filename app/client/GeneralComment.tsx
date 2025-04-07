import React from 'react'

const GeneralComment = () => {
	return (
		<div className="flex flex-col w-full">
			<label className="w-[124px] h-[19px] font-semibold text-[14px] leading-[19px] text-[#061237] mb-3" htmlFor="custom-textarea">
				General Comment
			</label>
			<textarea
				id="custom-textarea"
				rows={3}
				className="box-border flex flex-col justify-center items-end p-4 pb-[20px] gap-12 w-full bg-white border border-gray-300 shadow-sm rounded-lg resize-none focus:outline-none focus:border-[#3175FF] focus:ring-1 focus:ring-[#3175FF] "
				placeholder="Facebook ad targeting 18-24 works well here."
			></textarea>
		</div>


	)
}

export default GeneralComment
