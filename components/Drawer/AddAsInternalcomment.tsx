import React from 'react'
import tickcircle from "../../public/tick-circle.svg";
import send from "../../public/send.svg";
import Image from "next/image";


const AddAsInternalcomment = ({ setMessage }) => {
	return (
		<div>
			<div className="  w-[395px] flex flex-col items-start p-[10px_20px] bg-white border border-black rounded-[8px]">
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

					<div className='flex items-center gap-2 '>
						<button >
							<Image src={tickcircle} alt={"tickcircle"} />
						</button>
						<p className="w-[116px] h-[16px] font-semibold text-[12px] leading-[16px] text-[#292D32]">
							Mark as approved </p>
					</div>
				</div>
				<textarea
					className="w-full font-medium text-[16px] text-[#292929] py-3 px-4 rounded-md resize-none overflow-hidden focus:outline-none"
					rows={4}
					defaultValue="This is a sample comment comprising of dummy text and any other existing material. Facebook ad targeting 18-24 works well here."
				/>

				<div className='flex w-full justify-between'>
					<button>
						<h3 className="  font-semibold text-[15px] leading-[20px] text-[#00A36C]">Add as internal</h3>
					</button>
					<div>

						<button
							onClick={() => setMessage(true)}
							className="flex flex-row justify-center items-center px-[28px] py-[10px] gap-[8px] w-[135px] h-[40px] bg-[#3175FF] rounded-[8px]     font-semibold text-[15px] leading-[20px] text-white">
							Comment
							<Image src={send} alt={"send"} />
						</button>
					</div>

				</div>
			</div>
		</div >
	)
}

export default AddAsInternalcomment
