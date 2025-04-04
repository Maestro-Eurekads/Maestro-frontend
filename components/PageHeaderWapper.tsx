import React from "react";

interface PageHeaderWrapperProps {
	t1: string;
	t2?: string;
	t3?: string; // Optional prop
	t4?: string; // Optional prop
	span?: number; // Optional prop
	className?: string; // Optional prop
}

const PageHeaderWrapper: React.FC<PageHeaderWrapperProps> = ({ t1, t2, t3, t4, span, className }) => {
	return (
		<div>
			<h1 className={`font-general-sans font-semibold  leading-[32px] text-[#292929] ${className ? className : `text-[24px]`}`}>
				{t1}
			</h1>
			{
				t2 && (
					<p className="font-general-sans font-medium text-[16px] py-2 leading-[22px] text-[rgba(0,0,0,0.9)] mt-2">
						{t2}
					</p>
				)
			}
			{
				t3 && (
					<p className="font-general-sans font-medium text-[16px] leading-[22px] text-[rgba(0,0,0,0.9)]">
						{t3}
					</p>
				)
			}
			{
				t4 && (
					<div className="flex items-center mt-[33px] gap-[12px]">
						<span className="flex justify-center w-[26px] h-[26px] bg-[#3175FF] rounded-full font-bold text-[16px] leading-[22px] items-center text-center text-white">
							{span}
						</span>
						<p className="font-[600] text-[18px] leading-[24px] text-[#3175FF]">
							{t4}
						</p>
					</div>
				)
			}
		</div >
	);
};

export default PageHeaderWrapper;
