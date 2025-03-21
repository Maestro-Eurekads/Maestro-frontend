import React from 'react'
import Image from "next/image";
import tickcircle from "../../public/tick-circle.svg";

const CommentReply = () => {
	return (
		<div className="flex  flex-col">

			<div className='flex items-center gap-1 w-full'>
				<div className="w-[20px] h-0 border border-black/50" /> <p className=" flex items-center   font-medium text-[12px] leading-[16px] text-black/50">
					1 Reply</p><div className="w-[70%] h-0 border border-black/50" />
			</div>


			<div className='mt-5 px-8 pt-4'>

				<div>
					<div className='flex justify-between items-center gap-3 '>
						<div className='flex  items-center gap-2 '>
							<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">D</div>
							<div>
								<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">
									Daniel Silva</h3>
								<div className='flex items-center gap-2'>
									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
										12/01/25 </p>
									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
										12:09 P.M</p>
								</div>
							</div>
						</div>
					</div>
					<p className="font-[500] text-[16px] leading-[22px] text-[#292929] py-5">
						This is a sample comment comprising of dummy text and any other existing material. Facebook ad targeting 18-24 works well here.</p>
				</div>
				<div>
					<div className='flex justify-between items-center gap-3 '>
						<div className='flex  items-center gap-2 '>
							<div className="flex flex-col justify-center items-center p-[10px] gap-[10px] w-[40px] h-[40px] bg-[#00A36C] rounded-full text-[20px] leading-[27px] text-center text-white">D</div>
							<div>
								<h3 className="font-[500] text-[20px] leading-[27px] text-[#292929]">
									Daniel Silva</h3>
								<div className='flex items-center gap-2'>
									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
										12/01/25 </p>
									<p className="font-[400] text-[12px] leading-[16px] text-[#292929]">
										12:09 P.M</p>
								</div>
							</div>
						</div>
					</div>
					<p className="font-[500] text-[16px] leading-[22px] text-[#292929] py-5">
						This is a sample comment comprising of dummy text and any other existing material. Facebook ad targeting 18-24 works well here.</p>
				</div>
			</div>
		</div>
	)
}

export default CommentReply