"use client";
import { getInitials } from "components/Options";
import { getSignedApproval } from "features/Comment/commentSlice";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { useAppDispatch, useAppSelector } from "store/useStore";

const ApproverContainer = ({ campaign, loading, isLoadingCampaign }) => {
	const { data: session }: any = useSession();
	const dispatch = useAppDispatch();
	const id = session?.user?.id || null;

	useEffect(() => {
		if (id) {
			dispatch(getSignedApproval(id));
		}
	}, [dispatch, id]);



	const items = [
		{
			label: "Agency",
			name: "Eurekads Pte. Ltd.",
			initials: getInitials("Eurekads"),
		},
		{
			label: "Client approver",
			name: campaign?.media_plan_details?.client_approver || "-",
			initials: getInitials(campaign?.media_plan_details?.client_approver),
		},
		{
			label: "Agency approver",
			name: campaign?.media_plan_details?.internal_approver || "-",
			initials: getInitials(campaign?.media_plan_details?.internal_approver),
		},
		{
			label: "Campaign builder",
			name: "Maxime Brevet", // Dummy or static; replace if dynamic source is available
			initials: getInitials("Maxime Brevet"),
		},
	];

	return (
		<div className="flex flex-col gap-[24px]">
			<div className="flex items-center justify-between flex-wrap gap-4">
				{items.map((item, index) => (
					<div
						key={index}
						className="flex flex-col items-start p-5 gap-2 w-[235px] h-[95px] bg-white shadow-[0px_4px_14px_rgba(0,38,116,0.15)] rounded-[12px]"
					>
						{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
							<p className="font-medium text-[12px] leading-[16px] text-gray-500">
								{item?.label}
							</p>}
						{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
							<div className="flex items-center gap-2 mt-2">
								{item?.initials && (
									<div className="flex items-center justify-center p-[6.5px] w-[24px] h-[24px] bg-[#E8F6FF] rounded-full font-semibold text-[9.4px] text-[#3175FF]">
										{item?.initials.toUpperCase()}
									</div>
								)}
								<p className="font-medium text-[20px] leading-[27px] text-[#061237]">
									{item?.name}
								</p>
							</div>}
					</div>
				))}
			</div>
		</div>
	);
};

export default ApproverContainer;
