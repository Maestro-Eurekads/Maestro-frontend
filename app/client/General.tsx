import React from 'react'
import Image from "next/image";
import info from '../../public/info-circle.svg';

const General = () => {
	return (
		<div className="flex flex-col justify-between w-full h-[153px] bg-white border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px] shadow-[0px_4px_14px_rgba(0,38,116,0.15)]">
			<h3 className="w-[960px] h-[17px]  font-medium text-[24px] leading-[32px] text-black">General</h3>


			<div className='flex items-center justify-between'>
				<div>
					<div className='flex items-center gap-2'>
						<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Budget</p>
						<Image src={info} alt="info" />
					</div>

					<div className='flex items-end gap-2 '>
						<div className="flex flex-row justify-center items-center p-[5px] gap-[10px] w-[48px] h-[19px] bg-[#B8FFE6] rounded-full text-[12px] leading-[16px] text-[#00A331] mb-2">
							+2.5%
						</div>
						<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
							3,456,123</h1>
					</div>

				</div>
				<div>
					<div className='flex items-center gap-2'>
						<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Impressions</p>
						<Image src={info} alt="info" />
					</div>
					<div className='flex items-end gap-2 '>
						<div className="flex flex-row justify-center items-center p-[5px] gap-[10px] w-[48px] h-[19px] bg-[#B8FFE6] rounded-full text-[12px] leading-[16px] text-[#00A331] mb-2">
							+2.5%
						</div>
						<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
							45.657%</h1>
					</div>
				</div>
				<div>
					<div className='flex items-center gap-2'>
						<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">CPM</p>
						<Image src={info} alt="info" />
					</div>
					<div className='flex items-end gap-2'>
						<div className="flex flex-row justify-center items-center p-[5px] gap-[10px] w-[48px] h-[19px] bg-[#FFE1E0] rounded-full text-[12px] leading-[16px] text-[#FF0302] mb-2">
							+1.5%
						</div>
						<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
							45.657%</h1>
					</div>
				</div>
			</div>


		</div>
	)
}

export default General
