import { getSignedApproval } from 'features/Comment/commentSlice';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'store/useStore';


const ApproverContainer = () => {
	const { dataApprove, } = useAppSelector((state) => state.comment);
	const { data: session }: any = useSession();
	const dispatch = useAppDispatch();
	const id = session?.user?.id || {};



	useEffect(() => {
		dispatch(getSignedApproval(id));
	}, [dispatch, id]);

	const items = [
		{ label: "Agency", name: "Eurekads Pte. Ltd.", initials: null },
		{ label: "Client approver", name: "Chris Kalics", initials: "CK" },
		{ label: "Agency approver", name: "Julien Dahmoun", initials: "JD" },
		{ label: "Campaign builder", name: "Maxime Brevet", initials: "MB" },
	];

	return (
		<div className='flex flex-col gap-[24px]'>
			<div className="flex items-center justify-between">
				{items?.map((item, index) => (
					<div
						key={index}
						className="flex flex-col items-start p-5 gap-2 w-[235px] h-[95px] bg-white shadow-[0px_4px_14px_rgba(0,38,116,0.15)] rounded-[12px]"
					>
						<p className="h-[16px] font-[General Sans] font-medium text-[12px] leading-[16px] text-gray-500">
							{item.label}
						</p>
						<div className="flex items-center gap-2 mt-2">
							{item.initials && (
								<div className="flex items-center justify-center p-[6.54545px] gap-[4.36px] w-[24px] h-[24px] bg-[#E8F6FF] rounded-full font-semibold text-[9.42857px] leading-[13px] text-[#3175FF] text-center">
									{item.initials}
								</div>
							)}
							<p className="h-[27px] font-general font-medium text-[20px] leading-[27px] text-[#061237]">
								{item.name}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default ApproverContainer