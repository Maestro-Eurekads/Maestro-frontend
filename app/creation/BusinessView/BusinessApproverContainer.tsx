"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import { cleanName, getInitials } from "components/Options";
import { getSignedApproval } from "features/Comment/commentSlice";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { useAppDispatch, useAppSelector } from "store/useStore";

const BusinessApproverContainer = ({
  campaign,
  loading,
  isLoadingCampaign,
  campaignFormData
}) => {
  const { data: session }: any = useSession();
  const { jwt } = useCampaigns();
  const dispatch = useAppDispatch();
  const id = session?.user?.id || null;

  useEffect(() => {
    if (id) {
      dispatch(getSignedApproval({ id, jwt }));
    }
  }, [dispatch, id]);



  const internalApprovers =
    campaign?.media_plan_details?.internal_approver?.map((a) => a?.username) || campaignFormData?.media_plan_details?.internal_approver?.map(
      (a) => a?.username
    ) || [
      "-",
    ];
  const clientApprovers = campaign?.media_plan_details?.client_approver?.map(
    (a) => a?.username
  ) || campaignFormData?.media_plan_details?.client_approver?.map(
    (a) => a?.username
  ) || ["-"];

  const items = [
    {
      label: "Agency",
      name: cleanName(campaign?.client_selection?.client || campaignFormData?.client_selection?.client || "-"),
      nameList: [cleanName(campaign?.client_selection?.client || campaignFormData?.client_selection?.client || "-")],
      initials: getInitials(cleanName(campaign?.client_selection?.client || campaignFormData?.client_selection?.client || "-")),
    },
    {
      label: "Client approver",
      name: cleanName(clientApprovers[0]),
      nameList: clientApprovers,
      initials: getInitials(cleanName(clientApprovers[0])),
    },
    {
      label: "Agency approver",
      name: cleanName(internalApprovers[0]),
      nameList: internalApprovers,
      initials: getInitials(cleanName(internalApprovers[0])),
    },
    {
      label: "Campaign builder",
      name: cleanName(campaign?.campaign_builder?.username || campaignFormData?.campaign_builder?.username || "-"),
      nameList: [
        cleanName(campaign?.campaign_builder?.username || campaignFormData?.campaign_builder?.username || "-")
      ],
      initials: getInitials(
        cleanName(campaign?.campaign_builder?.username || campaignFormData?.campaign_builder?.username || "-")
      ),
    }

  ];

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-start p-5 gap-2 w-[235px] h-[100px] bg-white shadow-[0px_4px_14px_rgba(0,38,116,0.15)] rounded-[12px]"
          >
            {loading || isLoadingCampaign ? (
              <Skeleton height={20} width={100} />
            ) : (
              <p className="font-medium text-[12px] h-5 leading-[16px] text-gray-500 truncate w-full">
                {item.label}
              </p>
            )}

            {loading || isLoadingCampaign ? (
              <Skeleton height={20} width={200} />
            ) : (
              <div className="flex items-center gap-2 mt-2 w-full relative group">
                {item.initials && (
                  <div className="flex items-center justify-center p-[6.5px] w-[24px] h-[24px] bg-[#E8F6FF] rounded-full font-semibold text-[9.4px] text-[#3175FF]">
                    {item.initials.toUpperCase()}
                  </div>
                )}
                <p className="font-medium text-[20px] leading-[27px] text-[#061237] truncate whitespace-nowrap overflow-hidden max-w-[170px]">
                  {item.name}
                </p>

                {/* Tooltip for multiple names */}
                {item.nameList.length > 1 && (
                  <div className="absolute top-full mt-1 left-0 z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-normal max-w-[220px] shadow-md">
                    {item.nameList.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessApproverContainer;
