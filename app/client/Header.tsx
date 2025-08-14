"use client";
import { useComments } from "app/utils/CommentProvider";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "store/useStore";
import { useEffect, useState, useMemo } from "react";
import { getSignedApproval } from "features/Comment/commentSlice";
import Skeleton from "react-loading-skeleton";
import tickcircles from "../../public/solid_circle-check.svg";
import ClientsCampaignDropdown from "./compoment/ClientsCampaignDropdown";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getFirstLetters } from "components/Options";
import { toast } from "sonner";

const Header = ({ setIsOpen, campaigns, loading }) => {
  const {
    isDrawerOpen,
    setModalOpen,
    createApprovalSuccess,
    setCreateApprovalSuccess,
    selected,
    setSelected,
    createCommentsSuccess,
  } = useComments();
  const { dataApprove, isLoadingApprove } = useAppSelector(
    (state) => state.comment
  );
  const { data: session }: any = useSession();
  const { jwt, campaignData } = useCampaigns();
  const dispatch = useAppDispatch();
  const id = session?.user?.id;
  const isdocumentId = campaignData?.documentId;
  const [show, setShow] = useState(false);
  const [showClientChangesModal, setShowClientChangesModal] = useState(false);

  // console.log("campaignData---", session);

  useEffect(() => {
    if (createApprovalSuccess) {
      setModalOpen(false);
      dispatch(getSignedApproval({ isdocumentId, jwt }));
      setCreateApprovalSuccess(null);
    }
    if (isdocumentId) {
      dispatch(getSignedApproval({ isdocumentId, jwt }));
    }
  }, [dispatch, id, createApprovalSuccess, isdocumentId]);

  // Refresh campaign data when comments are made
  useEffect(() => {
    if (createCommentsSuccess && isdocumentId && jwt) {
      dispatch(getSignedApproval({ isdocumentId, jwt }));
    }
  }, [createCommentsSuccess, isdocumentId, jwt, dispatch]);

  // Only refresh campaign data when there are actual changes (not continuously)
  // The data will be refreshed when comments are made or status changes

  const handleDrawerOpen = () => {
    setModalOpen(true);
    dispatch(getSignedApproval({ isdocumentId, jwt }));
  };

  const isSignature = dataApprove?.[0]?.isSignature || false;

  // Check campaign status with useMemo to ensure proper updates
  const campaignStatus = useMemo(
    () => campaignData?.isStatus?.stage,
    [campaignData?.isStatus?.stage]
  );
  const isClientChangesNeeded = useMemo(
    () => campaignStatus === "client_changes_needed",
    [campaignStatus]
  );

  // Check if user has any assigned campaigns
  const hasCampaigns = campaigns && `campaigns`?.length > 0;

  const isApproverForSelectedCampaign =
    campaigns
      ?.find((cam) => cam?.documentId === selected)
      ?.media_plan_details?.client_approver?.map((approver) => approver?.id)
      ?.filter((aId) => aId === id)?.length > 0;

  const handleCheckCampaign = () => {
    toast.error("Please Select a Campaign!");
  };

  return (
    <div
      id="client_header"
      className={`py-[2.8rem] px-[30px] ${
        isDrawerOpen ? "md:px-[50px]" : "xl:px-[100px]"
      } relative`}>
      <div className="flex items-end">
        {loading ? (
          <Skeleton height={20} width={200} />
        ) : hasCampaigns ? (
          <ClientsCampaignDropdown
            loadingClients={false}
            campaigns={campaigns}
            setSelected={setSelected}
            selected={selected}
          />
        ) : (
          <p className="text-gray-500">No campaigns assigned</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-8">
        <div>
          {isLoadingApprove ? (
            <Skeleton height={20} width={200} />
          ) : (
            hasCampaigns && (
              <div>
                {isSignature ? (
                  <button
                    className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start flex items-center	gap-[10px]"
                    style={{ border: "1px solid #3175FF" }}
                    onClick={handleDrawerOpen}>
                    <Image
                      src={tickcircles}
                      alt="tickcircle"
                      className="w-[18px] "
                    />
                    Approved
                  </button>
                ) : (
                  true && (
                    <button
                      className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
                      style={{ border: "1px solid #3175FF" }}
                      onClick={() => {
                        if (campaignData) {
                          if (isClientChangesNeeded) {
                            setShowClientChangesModal(true);
                          } else {
                            setIsOpen(true);
                          }
                        } else {
                          handleCheckCampaign();
                        }
                      }}>
                      {isClientChangesNeeded
                        ? "Client changes have been requested"
                        : "Approve & Sign Media plan"}
                    </button>
                  )
                )}
              </div>
            )
          )}
        </div>
        <div
          className="profile_container relative"
          onClick={() => setShow((prev) => !prev)}>
          <p className="capitalize">{getFirstLetters(session?.user?.name)}</p>

          {show && (
            <div className="absolute right-0 top-[55px] w-[200px] bg-white border border-gray-200   shadow-lg z-50 !rounded-[5px]">
              <div className="absolute top-[-4px] right-5 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-200"></div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-1">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 truncate mb-3">
                  {session?.user?.email || "??"}
                </p>
                <button
                  onClick={async () => {
                    localStorage.removeItem("campaignFormData");
                    localStorage.removeItem("selectedClient");
                    localStorage.removeItem("profileclients");
                    localStorage.removeItem(
                      session?.user?.data?.user?.id?.toString() || ""
                    );
                    await signOut({
                      callbackUrl: "/",
                    });
                  }}
                  className="w-full px-4 py-2 text-sm text-white !bg-[#3175FF]   hover:bg-blue-700 !rounded-[5px]">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Client Changes Modal */}
      {showClientChangesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-[10px] p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Client Changes Requested
              </h3>
              <p className="text-gray-600 mb-6">
                Client changes have been requested for this media plan.
              </p>
              <button
                onClick={() => setShowClientChangesModal(false)}
                className="bg-[#3175FF] text-white px-6 py-3 rounded-[10px] font-medium hover:bg-blue-700 transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
