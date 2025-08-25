"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useUserPrivileges } from "utils/userPrivileges";
import { SVGLoader } from "components/SVGLoader";

const ClientReviewModal = ({ isOpen, setIsOpen }) => {
  const [loading, setLoading] = useState(false);
  const [loadingc, setLoadingc] = useState(false);

  const { cId, jwt, campaignData, getActiveCampaign } = useCampaigns();
  const { loggedInUser, isClient } = useUserPrivileges();

  const handleApprove = async () => {
    // Check if user is a client (Client overview || Campaign viewer) - they cannot approve
    if (isClient) {
      toast.error(
        "Client overview and Campaign viewer users cannot approve media plans."
      );
      return;
    }

    setLoading(true);

    try {
      const newStatus = {
        stage: "approved",
        label: "Approved",
        actor: {
          id: loggedInUser?.id,
          name: loggedInUser?.username,
          role: loggedInUser?.user_type,
        },
        date: new Date().toISOString(),
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        { data: { isStatus: newStatus } },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      await getActiveCampaign(campaignData?.documentId);
      toast.success("Media plan approved by client.");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to approve media plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    // Check if user is a client (Client overview || Campaign viewer) - they cannot request changes
    if (isClient) {
      toast.error(
        "Client overview and Campaign viewer users cannot request changes to media plans."
      );
      return;
    }

    setLoadingc(true);

    try {
      const newStatus = {
        stage: "client_changes_needed",
        label: "Client Changes Needed",
        actor: {
          id: loggedInUser?.id,
          name: loggedInUser?.username,
          role: loggedInUser?.user_type,
        },
        date: new Date().toISOString(),
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        { data: { isStatus: newStatus } },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      await getActiveCampaign(campaignData?.documentId);
      toast.success("Change request sent to creator.");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to request changes.");
    } finally {
      setLoadingc(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-[440px] p-6 shadow-xl text-center">
        <button
          disabled={loading || loadingc}
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4">
          <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </button>

        <div className="w-full flex justify-center pt-2">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="text-green-600 w-7 h-7" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-[#181D27] mb-2">
          Client Review
        </h2>
        <p className="text-sm text-[#535862] mb-4">
          Do you want to approve or request changes to this plan?
        </p>

        <div className="flex flex-col gap-4 mt-4">
          <button
            disabled={loading || loadingc}
            className="btn_model_active w-full"
            onClick={handleApprove}>
            {loading ? (
              <SVGLoader width="30px" height="30px" color="#fff" />
            ) : (
              "Approve Plan"
            )}
          </button>
          <button
            disabled={loadingc || loading}
            className="btn_model_outline w-full"
            onClick={handleRequestChanges}>
            {loadingc ? (
              <SVGLoader width="30px" height="30px" color="#000" />
            ) : (
              "Request Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientReviewModal;
