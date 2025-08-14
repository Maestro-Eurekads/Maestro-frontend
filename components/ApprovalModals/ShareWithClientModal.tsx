// modals/ShareWithClientModal.tsx
import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useCampaigns } from "app/utils/CampaignsContext";
import axios from "axios";
import { SVGLoader } from "components/SVGLoader";
import { useUserPrivileges } from "utils/userPrivileges";
import Continue from "../../public/arrow-back-outline.svg";
import Image from "next/image";

const ShareWithClientModal = ({ isOpen, setIsOpen, campaignId, setChange }) => {
  const { cId, jwt, getActiveCampaign } = useCampaigns();
  const { loggedInUser } = useUserPrivileges();
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const newStatus = {
        stage: "shared_with_client",
        label: "Shared with Client",
        actor: {
          id: loggedInUser?.id,
          name: loggedInUser?.username,
          role: loggedInUser?.user_type,
        },
        date: new Date().toISOString(),
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        {
          data: {
            isStatus: newStatus,
            isApprove: true,
          },
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );

      await getActiveCampaign(campaignId);
      toast.success("Media plan shared with client");
      setIsOpen(false);
      setChange(false);
    } catch (err) {
      toast.error("Failed to share");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!cId) {
      toast.error("No campaign ID");
      return;
    }

    setLoadings(true);
    try {
      const newStatus = {
        stage: "changes_needed",
        label: "Changes Needed",
        actor: {
          id: loggedInUser?.id,
          name: loggedInUser?.username,
          role: loggedInUser?.user_type,
        },
        date: new Date().toISOString(),
      };

      const updatedData = {
        isStatus: newStatus,
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        { data: updatedData },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      await getActiveCampaign(campaignId);
      toast.success("Requested changes for the media plan.");
      setIsOpen(false);
      setChange(false);
    } catch (err) {
      toast.error("Failed to request changes.");
    } finally {
      setLoadings(false);
    }
  };

  return (
    <>
      {/* The trigger button */}
      <button
        className="bottom_black_next_btn hover:bg-blue-500 whitespace-nowrap"
        onClick={() => setIsOpen(true)}>
        <p>Share with Client</p>
        <Image src={Continue} alt="Continue" />
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg w-[440px] p-6 shadow-xl text-center">
            <button
              disabled={loading || loadings}
              className="absolute top-4 right-4"
              onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <CheckCircle className="text-green-600 w-10 h-10 mx-auto mb-3" />
            <h2 className="text-xl font-semibold">Ready to Share?</h2>
            <p className="text-sm text-gray-600 mb-4">
              This plan has been internally approved. Share it with the client
              now?
            </p>

            <div className="flex flex-col gap-4 mt-4">
              <button
                className="btn_model_active w-full"
                onClick={handleShare}
                disabled={loading || loadings}>
                {loading ? (
                  <SVGLoader width="30px" height="30px" color="#fff" />
                ) : (
                  "Share with Client"
                )}
              </button>

              <button
                className="btn_model_outline w-full"
                onClick={handleRequestChanges}
                disabled={loadings || loading}>
                {loadings ? (
                  <SVGLoader width="30px" height="30px" color="#0866FF" />
                ) : (
                  "Request Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareWithClientModal;
