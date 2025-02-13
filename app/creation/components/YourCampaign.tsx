import React from 'react'
import Image from "next/image";
import speaker from '../../../public/mdi_megaphone.svg';


const YourCampaign = () => {
	return (
		<div>
			<div >
				<h1 className="font-general-sans font-semibold text-[24px] leading-[32px] text-[#292929]"
				>What is the main objective of your campaign ?</h1>
				<h1 className="font-general-sans font-medium text-[16px] leading-[22px] text-[rgba(0,0,0,0.9)]"
				>Please select only one objective.</h1>
			</div>

			<div className='flex flex-wrap gap-[80px] mt-[50px]'>
				<div className='creation_card'>
					<div className='flex items-center gap-1'>
						<Image src={speaker} alt="menu" />
						<h6 className="w-[150px] h-[24px] font-general-sans font-semibold text-[18px] leading-[24px] text-[#061237]"
						>Brand Awareness</h6>
					</div>
					<p className="w-[362px] h-[52px] font-general-sans font-medium text-[15px] leading-[175%] text-[#061237] z-[1]"
					>Reach as people as possible and generate brand recall. Get people to watch your video.</p>
				</div>
				<div className='creation_card'>
					<div className='flex items-center gap-1'>
						<Image src={speaker} alt="menu" />
						<h6 className="w-[150px] h-[24px] font-general-sans font-semibold text-[18px] leading-[24px] text-[#061237]"
						>Brand Awareness</h6>
					</div>
					<p className="w-[362px] h-[52px] font-general-sans font-medium text-[15px] leading-[175%] text-[#061237] z-[1]"
					>Reach as people as possible and generate brand recall. Get people to watch your video.</p>
				</div>
				<div className='creation_card'>
					<div className='flex items-center gap-1'>
						<Image src={speaker} alt="menu" />
						<h6 className="w-[150px] h-[24px] font-general-sans font-semibold text-[18px] leading-[24px] text-[#061237]"
						>Brand Awareness</h6>
					</div>
					<p className="w-[362px] h-[52px] font-general-sans font-medium text-[15px] leading-[175%] text-[#061237] z-[1]"
					>Reach as people as possible and generate brand recall. Get people to watch your video.</p>
				</div>
				<div className='creation_card'>
					<div className='flex items-center gap-1'>
						<Image src={speaker} alt="menu" />
						<h6 className="w-[150px] h-[24px] font-general-sans font-semibold text-[18px] leading-[24px] text-[#061237]"
						>Brand Awareness</h6>
					</div>
					<p className="w-[362px] h-[52px] font-general-sans font-medium text-[15px] leading-[175%] text-[#061237] z-[1]"
					>Reach as people as possible and generate brand recall. Get people to watch your video.</p>
				</div>
				<div className='creation_card'>
					<div className='flex items-center gap-1'>
						<Image src={speaker} alt="menu" />
						<h6 className="w-[150px] h-[24px] font-general-sans font-semibold text-[18px] leading-[24px] text-[#061237]"
						>Brand Awareness</h6>
					</div>
					<p className="w-[362px] h-[52px] font-general-sans font-medium text-[15px] leading-[175%] text-[#061237] z-[1]"
					>Reach as people as possible and generate brand recall. Get people to watch your video.</p>
				</div>
				<div className='creation_card'>
					<div className='flex items-center gap-1'>
						<Image src={speaker} alt="menu" />
						<h6 className="w-[150px] h-[24px] font-general-sans font-semibold text-[18px] leading-[24px] text-[#061237]"
						>Brand Awareness</h6>
					</div>
					<p className="w-[362px] h-[52px] font-general-sans font-medium text-[15px] leading-[175%] text-[#061237] z-[1]"
					>Reach as people as possible and generate brand recall. Get people to watch your video.</p>
				</div>
			</div>
		</div>
	)
}

export default YourCampaign