import React from 'react'
import Image from "next/image";
import speaker from '../../public/mdi_megaphone.svg';
import down from '../../public/arrow-down.svg';
import facebook from '../../public/facebook.svg';

const FunnelStage = () => {
	return (
		<div>
			<div >
				<h1 className="font-general-sans font-semibold text-[24px] leading-[32px] text-[#292929]"
				>Which platforms would you like to activate for each funnel stage ?</h1>
				<h1 className="font-general-sans font-medium text-[16px] leading-[22px] text-[rgba(0,0,0,0.9)] mt-2"
				>Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time.</h1>
			</div>

			<div className='mt-[32px]'>
				<div className="flex justify-between items-center p-6 gap-3 w-[968px] h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] rounded-t-[10px]"
				>
					<div className='flex items-center gap-2'>
						<Image src={speaker} alt="speaker" />
						<p>Awareness</p>
					</div>
					<p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]"
					>In progress</p>
					<div>
						<Image src={down} alt="speaker" />
					</div>
				</div>
				<div className=" card_bucket_container_main_sub flex flex-col  pb-6   w-[968px] h-[780px]]">

					<div className='card_bucket_container_main '>
						<h3>Social media</h3>

						<div className='card_bucket_container '>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>Facebook</p>
								</div>

								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									> Instagram
									</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>TikTok</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>Youtube</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>Twitter/X</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>LinkedIn</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>

						</div>
					</div>
					<div className='card_bucket_container_main '>
						<h3>Display networks</h3>

						<div className='card_bucket_container '>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>TheTradeDesk</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>Quantcast</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className="  h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>Display & Vidéo</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>

						</div>
					</div>
					<div className='card_bucket_container_main '>
						<h3>Search engines</h3>

						<div className='card_bucket_container '>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>Google</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>Yahoo</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
							<div className="flex flex-row justify-between items-center p-5 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
							>
								<div className='flex items-center gap-2'>
									<Image src={facebook} alt="facebook" />
									<p className=" h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]"
									>Bing</p>
								</div>
								<div className=" w-[20px] h-[20px] border-[0.769px] border-[rgba(0,0,0,0.2)] rounded-full"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>


		</div>
	)
}

export default FunnelStage