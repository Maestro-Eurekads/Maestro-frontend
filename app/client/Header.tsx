"use client";
import { useComments } from "app/utils/CommentProvider";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "store/useStore";
import { useEffect } from "react";
import { getSignedApproval } from "features/Comment/commentSlice";
import Skeleton from "react-loading-skeleton";
import tickcircles from "../../public/solid_circle-check.svg";
import ClientsCampaignDropdown from "./compoment/ClientsCampaignDropdown";
import { useCampaigns } from "app/utils/CampaignsContext";

const Header = ({ setIsOpen, campaigns, loading }) => {
  const {
    isDrawerOpen,
    setModalOpen,
    createApprovalSuccess,
    setCreateApprovalSuccess,
    selected,
    setSelected,
  } = useComments();
  const { dataApprove, isLoadingApprove } = useAppSelector((state) => state.comment);
  const { data: session }: any = useSession();
  const {jwt} = useCampaigns()
  const dispatch = useAppDispatch();
  const id = session?.user?.id;

  useEffect(() => {
    if (createApprovalSuccess) {
      setModalOpen(false);
      dispatch(getSignedApproval(id, jwt));
      setCreateApprovalSuccess(null);
    }
    dispatch(getSignedApproval(id, jwt));
  }, [dispatch, id, createApprovalSuccess]);

  const handleDrawerOpen = () => {
    setModalOpen(true);
    dispatch(getSignedApproval(id, jwt));
  };

  const isSignature = dataApprove?.[0]?.isSignature || false;

  // Check if user has any assigned campaigns
  const hasCampaigns = campaigns && campaigns?.length > 0;




  const isApproverForSelectedCampaign = campaigns?.find((cam) => cam?.documentId === selected)?.media_plan_details?.client_approver?.map((approver) => approver?.id)?.filter((aId) => aId === id)?.length > 0


  return (
    <div
      id="client_header"
      className={`py-[2.8rem] px-[30px] ${isDrawerOpen ? "md:px-[50px]" : "xl:px-[100px]"
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
              ) : true && (
                <button
                  className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
                  style={{ border: "1px solid #3175FF" }}
                  onClick={() => setIsOpen(true)}>
                  Approve & Sign Media plan
                </button>
              )}
            </div>
          )
        )}
      </div>
      {isDrawerOpen ? (
        ""
      ) : (
        <div className="text-[18px] absolute right-[30px] top-[20px] cursor-pointer"
          onClick={async () => {
            localStorage.removeItem("campaignFormData");
            localStorage.removeItem("selectedClient");
            localStorage.removeItem("profileclients");
            localStorage.removeItem(session?.user?.data?.user?.id?.toString() || "");
            await signOut({
              callbackUrl: "/",
            });
          }}
        >
          Logout
        </div>
      )}
    </div>
  );
};

export default Header;
