import React from 'react'

const ApproverContainer = () => {
	return (
		<div className='flex flex-col gap-[24px]'>
			<div className="flex items-center gap-[48px]">
				<div>
					<p className="font-medium text-[14px] leading-[19px] text-gray-500">Agency</p>
					<div className='flex items-center gap-2 mt-2'>
						<p className="font-medium text-[14px] leading-[19px] text-[#061237]">Eurekads Pte. Ltd.</p>
					</div>
				</div>
				<div>
					<p className="font-medium text-[14px] leading-[19px] text-gray-500">Client approver</p>
					<div className='flex items-center gap-2 mt-2'>
						<div className="flex items-center justify-center p-[6.54545px] gap-[4.36px] w-[24px] h-[24px] bg-[#E8F6FF] rounded-full font-semibold text-[9.42857px] leading-[13px] text-[#3175FF] text-center">
							CK
						</div>
						<p className="font-medium text-[14px] leading-[19px] text-[#061237]">Chris Kalics</p>
					</div>
				</div>
				<div>
					<p className="font-medium text-[14px] leading-[19px] text-gray-500">Agency approver</p>
					<div className='flex items-center gap-2 mt-2'>
						<div className="flex items-center justify-center p-[6.54545px] gap-[4.36px] w-[24px] h-[24px] bg-[#E8F6FF] rounded-full font-semibold text-[9.42857px] leading-[13px] text-[#3175FF] text-center">
							JD
						</div>
						<p className="font-medium text-[14px] leading-[19px] text-[#061237]">Julien Dahmoun</p>
					</div>
				</div>
				<div>
					<p className="font-medium text-[14px] leading-[19px] text-gray-500">Campaign builder</p>
					<div className='flex items-center gap-2 mt-2'>
						<div className="flex items-center justify-center p-[6.54545px] gap-[4.36px] w-[24px] h-[24px] bg-[#E8F6FF] rounded-full font-semibold text-[9.42857px] leading-[13px] text-[#3175FF] text-center">
							MB
						</div>
						<p className="font-medium text-[14px] leading-[19px] text-[#061237]">Maxime Brevet</p>
					</div>
				</div>
				<div>
					<p className="font-medium text-[14px] leading-[19px] text-gray-500">Focus points</p>
					<div className='flex items-center gap-2 mt-2'>

						<p className="font-medium text-[14px] leading-[19px] text-[#061237]">12/18</p>
					</div>
				</div>
			</div>
			<div>
				<p className="font-medium text-[14px] leading-[19px] text-gray-500">Comment from the agency</p>
				<div className='flex items-center gap-2 mt-2'>

					<p className="font-medium text-[14px] leading-[19px] text-[#061237]">This plan is optimized for maximizing engagement in the awareness phase. Key adjustments were made based on past performance.</p>
				</div>
			</div>
		</div>
	)
}

export default ApproverContainer