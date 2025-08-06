"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import { cleanName, getInitials } from "components/Options";
import { getSignedApproval } from "features/Comment/commentSlice";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { useAppDispatch } from "store/useStore";

const BusinessApproverContainer = ({
  campaign,
  loading,
  isLoadingCampaign,
  campaignFormData
}) => {
  const { data: session }: any = useSession();
  const { jwt, campaignData } = useCampaigns();
  const dispatch = useAppDispatch();
  const id = session?.user?.id || null;
  const isdocumentId = campaignData?.documentId

  useEffect(() => {
    if (id) {
      dispatch(getSignedApproval({ isdocumentId, jwt }));
    }
  }, [dispatch, id]);



  // Extract approver names from campaignFormData structure with fallback to campaignData
  // Handle both populated (with user objects) and non-populated (just IDs) data structures
  const getApproverName = (approver) => {
    if (typeof approver === 'string' || typeof approver === 'number') {
      // Just an ID, return placeholder
      return "-";
    }
    // Object with user details
    return cleanName(approver?.user?.username || approver?.user?.email || approver?.label || approver?.username || approver?.email);
  };

  const internalApprovers = campaignFormData?.internal_approver?.map(getApproverName) ||
    campaign?.internal_approver?.map(getApproverName) ||
    campaignData?.media_plan_details?.internal_approver?.map(getApproverName) ||
    ["-"];
  const clientApprovers = campaignFormData?.client_approver?.map(getApproverName) ||
    campaign?.client_approver?.map(getApproverName) ||
    campaignData?.media_plan_details?.client_approver?.map(getApproverName) ||
    ["-"];




  const items = [
    {
      label: "Agency",
      name: cleanName(campaignFormData?.client_selection?.value || campaignData?.client?.client_name || "-"),
      nameList: [cleanName(campaignFormData?.client_selection?.value || campaignData?.client?.client_name || "-")],
      initials: getInitials(cleanName(campaignFormData?.client_selection?.value || campaignData?.client?.client_name || "-")),
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
      name: cleanName(campaignFormData?.campaign_builder?.username || campaignFormData?.campaign_builder?.label ||
        campaignData?.campaign_builder?.username || campaignData?.campaign_builder?.label || "-"),
      nameList: [
        cleanName(campaignFormData?.campaign_builder?.username || campaignFormData?.campaign_builder?.label ||
          campaignData?.campaign_builder?.username || campaignData?.campaign_builder?.label || "-")
      ],
      initials: getInitials(
        cleanName(campaignFormData?.campaign_builder?.username || campaignFormData?.campaign_builder?.label ||
          campaignData?.campaign_builder?.username || campaignData?.campaign_builder?.label || "-")
      ),
    }

  ];

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {items?.map((item, index) => (
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
