"use client";

import { CheckCircle, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useUserPrivileges } from "utils/userPrivileges";
import { SVGLoader } from "components/SVGLoader";

const InternalReviewModal = ({ isOpen, setIsOpen }) => {
  const [loading, setLoading] = useState(false);
  const { cId, jwt, getActiveCampaign, campaignData } = useCampaigns();

  const { loggedInUser } = useUserPrivileges();

  const handleSubmitForReview = async () => {
    if (!cId) {
      toast.error("No campaign ID found");
      return;
    }

    setLoading(true);

    try {
      const newStatus = {
        stage: "in_internal_review",
        label: "In Internal Review",
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
          data: { isStatus: newStatus },
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      await getActiveCampaign(campaignData?.documentId);
      toast.success("Media plan submitted for internal review.");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-[440px] p-6 shadow-xl text-center">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4">
          <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </button>

        <div className="w-full flex justify-center pt-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <CheckCircle className="text-blue-600 w-7 h-7" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-[#181D27] mb-2">
          Submit for Internal Review
        </h2>
        <p className="text-sm text-[#535862] mb-4">
          Are you ready to submit this media plan for internal review?
        </p>

        <div className="flex flex-col gap-4 mt-4">
          <button
            className="btn_model_active w-full"
            onClick={handleSubmitForReview}
            disabled={loading}>
            {loading ? (
              <SVGLoader width="30px" height="30px" color="#fff" />
            ) : (
              "Submit for Internal Review"
            )}
          </button>
          <button
            className="btn_model_outline w-full"
            onClick={() => setIsOpen(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalReviewModal;
