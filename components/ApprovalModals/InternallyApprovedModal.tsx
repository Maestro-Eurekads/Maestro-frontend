"use client";

import { CheckCircle, X } from "lucide-react";
import { SVGLoader } from "components/SVGLoader";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useUserPrivileges } from "utils/userPrivileges";
import Continue from "../../public/arrow-back-outline.svg";
import Image from "next/image";
import { updateUsersWithCampaign } from "app/homepage/functions/clients";
import {
  extractObjectives,
  getFilteredMetrics,
} from "app/creation/components/EstablishedGoals/table-view/data-processor";
import { useActive } from "app/utils/ActiveContext";
import { useSearchParams } from "next/navigation";
import { removeKeysRecursively } from "utils/removeID";

const InternallyApprovedModal = ({ isOpen, setIsOpen, setChange }) => {
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [loadingc, setLoadingc] = useState(false);

  const {
    campaignData,
    campaignFormData,
    setCampaignFormData,
    cId,
    getActiveCampaign,
    jwt,
    agencyId,
  } = useCampaigns();
  const { loggedInUser } = useUserPrivileges();

  const { active } = useActive();
  const [showVersionPrompt, setShowVersionPrompt] = useState(false);
  const [showPlanInfoModal, setShowPlanInfoModal] = useState(false);
  const [versionAction, setVersionAction] = useState<"maintain" | "new" | null>(
    null
  );

  const query = useSearchParams();
  const campaignId = query.get("campaignId");

  const clearChannelStateForNewCampaign = () => {
    if (typeof window === "undefined") return;
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("channelLevelAudienceState_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
      if ((window as any).channelLevelAudienceState) {
        Object.keys((window as any).channelLevelAudienceState).forEach(
          (stageName) => {
            delete (window as any).channelLevelAudienceState[stageName];
          }
        );
      }
      console.log("Cleared all channel state for new campaign");
    } catch (error) {
      console.error("Error clearing channel state:", error);
    }
  };

  const updateVersion = async (stage, label, versionData = null) => {
    if (!cId) {
      toast.error("No campaign ID provided.");
      return;
    }
    setLoading(true);

    try {
      const basePatchData = { campaign_version: versionData.version };

      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        { data: basePatchData },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      getActiveCampaign(campaignId);
      setIsOpen(false);
      setShowVersionPrompt(false);
      toast.success(
        `Media plan marked as '${label}'${
          versionData ? `: ${versionData.plan_name}` : ""
        }`
      );
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      } else {
        toast.error(error?.message || "Failed to update status");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChoice = async (choice) => {
    if (choice === "maintain") {
      toast.success("Media plan updated and submitted for internal review.");
    } else {
      const currentVersion = campaignData?.campaign_version || 1;
      const newVersion = currentVersion + 1;
      const versionData = {
        plan_name: `Media Plan V${newVersion}`,
        version: newVersion,
      };
      await updateVersion("approved", "Approved", versionData);
      toast.success(`New version created: Media Plan V${newVersion}`);
    }
    setVersionAction(null);
    setShowVersionPrompt(false);
  };

  const handleApprove = async () => {
    if (!cId) {
      toast.error("No campaign ID");
      return;
    }

    setLoading(true);
    try {
      const newStatus = {
        stage: "internally_approved",
        label: "Internally Approved",
        actor: {
          id: loggedInUser?.id,
          name: loggedInUser?.username,
          role: loggedInUser?.user_type,
        },
        date: new Date().toISOString(),
      };

      const updatedData = {
        isStatus: newStatus,
        media_plan_details: {
          plan_name: campaignData?.media_plan_details?.plan_name || "",
          internal_approver: (
            campaignData?.media_plan_details?.internal_approver || []
          ).map((approver) => String(approver.id)),
          client_approver: (
            campaignData?.media_plan_details?.client_approver || []
          ).map((approver) => String(approver.id)),
          approved_by: [String(loggedInUser?.id)],
        },
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        { data: updatedData },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      await getActiveCampaign(campaignId);
      toast.success("Media plan approved internally.");
      setIsOpen(false);
      setChange(false);
    } catch (err) {
      toast.error("Failed to approve plan internally.");
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
        <p>Approval Internally</p>
        <Image src={Continue} alt="Continue" />
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg w-[440px] p-6 shadow-xl text-center">
            <button
              disabled={loading || loadings}
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
              Approve Internally?
            </h2>
            <p className="text-sm text-[#535862] mb-4">
              Are you sure you want to approve this media plan internally?
            </p>

            <div className="flex flex-col gap-4 mt-4">
              <button
                className="btn_model_active w-full"
                onClick={handleApprove}
                disabled={loading || loadings}>
                {loading ? (
                  <SVGLoader width="30px" height="30px" color="#fff" />
                ) : (
                  "Approve Internally"
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

export default InternallyApprovedModal;
