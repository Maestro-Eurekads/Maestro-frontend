import React, { useState } from 'react'
import Image from "next/image";
import info from '../../public/info-circle.svg';
import downoffline from '../../public/arrow-down-outline.svg';
import upfull from '../../public/arrow-up-full.svg';
import downfull from '../../public/arrow-down-full.svg';
import upoffline from '../../public/arrow-up-offline.svg';



const BrandAwareness = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const handlePrev = () => {
		setCurrentIndex((prev) => (prev === 0 ? statsData.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setCurrentIndex((prev) => (prev === statsData.length - 1 ? 0 : prev + 1));
	};

	const statsData = [
		{
			title: "Brand Awareness",
			background: "#E5F2F7",
			stats: [
				{ label: "Reach", value: "3,456,123" },
				{ label: "Frequency", value: "45.657%" }
			],
			indicators: ["#3175FF", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0"],
			icons: { up: upfull, down: downoffline }
		},
		{
			title: "Traffic",
			background: "#E6F4D5",
			stats: [
				{ label: "CTR", value: "7,892,345" },
				{ label: "Total Clicks", value: "12.345%" },
				{ label: "Total Clicks", value: "78.901%" }
			],
			indicators: ["#C0C0C0", "#3175FF", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0"],
			icons: { up: upfull, down: downfull }
		},
		{
			title: "Purchase",
			background: "#FFE2C5",
			stats: [
				{ label: "CTR", value: "1,234,567" },
				{ label: "Total Clicks", value: "56.789%" },
				{ label: "Total Clicks", value: "34.567%" }
			],
			indicators: ["#C0C0C0", "#C0C0C0", "#3175FF", "#C0C0C0", "#C0C0C0", "#C0C0C0"],
			icons: { up: upfull, down: downfull }
		},
		{
			title: "Lead Generation",
			background: "#E5F2F7",
			stats: [
				{ label: "CVR", value: "$9.12" },
				{ label: "Total Leads", value: "23456" },
				{ label: "CPL", value: "67.890%" }
			],
			indicators: ["#C0C0C0", "#C0C0C0", "#C0C0C0", "#3175FF", "#C0C0C0", "#C0C0C0"],
			icons: { up: upfull, down: downfull }
		},
		{
			title: "App Installs",
			background: "#E6F4D5",
			stats: [
				{ label: "CTR", value: "7,892,345" },
				{ label: "Total Clicks", value: "12.345%" },
				{ label: "Total Clicks", value: "78.901%" }
			],
			indicators: ["#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#3175FF", "#C0C0C0"],
			icons: { up: upfull, down: downfull }
		},
		{
			title: "Video Views",
			background: "#FFE2C5",
			stats: [
				{ label: "CTR", value: "1,234,567" },
				{ label: "Total Clicks", value: "56.789%" },
				{ label: "Total Clicks", value: "34.567%" }
			],
			indicators: ["#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#3175FF"],
			icons: { up: upoffline, down: downfull }
		}
	];

	const { title, background, stats, indicators, icons } = statsData[currentIndex];



	return (

		<div className="relative">
			<div
				className="flex flex-col justify-between w-full h-[200px] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px] shadow-[0px_4px_14px_rgba(0,38,116,0.15)]"
				style={{ backgroundColor: background }} 	>

				<div className="flex items-center justify-between">
					<h3 className="w-[960px] h-[17px] font-medium text-[24px] leading-[32px] text-black">
						{title}
					</h3>
					<div className="flex items-center gap-2">
						<button
							disabled={currentIndex === 0}
							onClick={handlePrev}>
							<Image src={icons.down} alt="down" />
						</button>
						<button
							disabled={currentIndex === 5}
							onClick={handleNext}>
							<Image src={icons.up} alt="up" />
						</button>
					</div>
				</div>

				<div className={`grid ${stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
					{stats.map((stat, index) => (
						<div key={index}>
							<div className="flex items-center gap-2">
								<p className="font-medium text-[12px] leading-[16px] text-[#667085]">
									{stat.label}
								</p>
								<Image src={info} alt="info" />
							</div>
							<h1 className="font-medium text-[36px] leading-[49px] text-[#101828] whitespace-nowrap">
								{stat.value}
							</h1>
						</div>
					))}
				</div>

				<div className="flex items-center gap-2 justify-center">
					{indicators.map((color, index) => (
						<div
							key={index}
							className="w-[31px] h-0 border-t-[5px] rounded-full"
							style={{ borderColor: color }}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

export default BrandAwareness



// <div>
// 	<div className="flex flex-col justify-between w-full h-[180px] bg-[#E5F2F7] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px]">

// 		<div className='flex items-center justify-between'>
// 			<h3 className="w-[960px] h-[17px]  font-medium text-[24px] leading-[32px] text-black">Brand Awareness</h3>

// 			<div className='flex items-center gap-2'>
// 				<Image src={downoffline} alt="downoffline" />
// 				<Image src={upfull} alt="upfull" />
// 			</div>
// 		</div>



// 		<div className='grid grid-cols-2 '>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Reach</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					3,456,123</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Frequency</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					45.657%</h1>
// 			</div>
// 		</div>

// 		<div className='flex items-center gap-2 justify-center'>
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#3175FF] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 		</div>
// 	</div>
// 	<div className="flex flex-col justify-between w-full h-[180px] bg-[#E6F4D5] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px]">

// 		<div className='flex items-center justify-between'>
// 			<h3 className="w-[960px] h-[17px]  font-medium text-[24px] leading-[32px] text-black">Traffic</h3>

// 			<div className='flex items-center gap-2'>
// 				<Image src={downfull} alt="downfull" />
// 				<Image src={upfull} alt="upfull" />
// 			</div>
// 		</div>



// 		<div className='grid grid-cols-3 '>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">CTR</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					7,892,345</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Clicks</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					12.345%</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Clicks</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					78.901%</h1>
// 			</div>
// 		</div>

// 		<div className='flex items-center gap-2 justify-center'>
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#3175FF] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 		</div>
// 	</div>
// 	<div className="flex flex-col justify-between w-full h-[180px] bg-[#FFE2C5] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px]">

// 		<div className='flex items-center justify-between'>
// 			<h3 className="w-[960px] h-[17px]  font-medium text-[24px] leading-[32px] text-black">Purchase</h3>

// 			<div className='flex items-center gap-2'>
// 				<Image src={downfull} alt="downfull" />
// 				<Image src={upfull} alt="upfull" />
// 			</div>
// 		</div>



// 		<div className='grid grid-cols-3 '>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">CTR</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					1,234,567</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Clicks</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					56.789%</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Clicks</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					34.567%</h1>
// 			</div>
// 		</div>

// 		<div className='flex items-center gap-2 justify-center'>
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#3175FF] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 		</div>
// 	</div>
// 	<div className="flex flex-col justify-between w-full h-[180px] bg-[#E5F2F7] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px]">

// 		<div className='flex items-center justify-between'>
// 			<h3 className="w-[960px] h-[17px]  font-medium text-[24px] leading-[32px] text-black">Lead Generation</h3>

// 			<div className='flex items-center gap-2'>
// 				<Image src={downfull} alt="downfull" />
// 				<Image src={upfull} alt="upfull" />
// 			</div>
// 		</div>



// 		<div className='grid grid-cols-3 '>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">CVR</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					$9,12</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Leads</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					23456</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">CPL</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					67.890%</h1>
// 			</div>
// 		</div>

// 		<div className='flex items-center gap-2 justify-center'>
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#3175FF] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 		</div>
// 	</div>
// 	<div className="flex flex-col justify-between w-full h-[180px] bg-[#E6F4D5] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px]">

// 		<div className='flex items-center justify-between'>
// 			<h3 className="w-[960px] h-[17px]  font-medium text-[24px] leading-[32px] text-black">App Installs</h3>

// 			<div className='flex items-center gap-2'>
// 				<Image src={downfull} alt="downfull" />
// 				<Image src={upfull} alt="upfull" />
// 			</div>
// 		</div>



// 		<div className='grid grid-cols-3 '>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">CTR</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					7,892,345</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Clicks</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					12.345%</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Clicks</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					78.901%</h1>
// 			</div>
// 		</div>

// 		<div className='flex items-center gap-2 justify-center'>
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#3175FF] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 		</div>
// 	</div>
// 	<div className="flex flex-col justify-between w-full h-[180px] bg-[#FFE2C5] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px]">

// 		<div className='flex items-center justify-between'>
// 			<h3 className="w-[960px] h-[17px]  font-medium text-[24px] leading-[32px] text-black">Video Views</h3>

// 			<div className='flex items-center gap-2'>
// 				<Image src={downfull} alt="downoffline" />
// 				<Image src={upoffline} alt="upfull" />
// 			</div>
// 		</div>



// 		<div className='grid grid-cols-3 '>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">CTR</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					1,234,567</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Clicks</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					56.789%</h1>
// 			</div>
// 			<div>
// 				<div className='flex items-center gap-2'>
// 					<p className=" font-medium text-[12px] leading-[16px] text-[#667085]">Total Clicks</p>
// 					<Image src={info} alt="info" />
// 				</div>
// 				<h1 className=" font-medium text-[36px] leading-[49px] text-[#101828] white-space-nowrap">
// 					34.567%</h1>
// 			</div>
// 		</div>

// 		<div className='flex items-center gap-2 justify-center'>
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#C0C0C0] rounded-full" />
// 			<div className="w-[31px] h-0 border-t-[5px] border-[#3175FF] rounded-full" />
// 		</div>
// 	</div>
// </div>
// <div className="grid gap-4">
// 	{statsData.map((data, index) => (
// 		<StatsCard key={index} data={data} />
// 	))}
// </div>