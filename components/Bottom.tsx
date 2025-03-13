"use client";
import Image from "next/image";
import clsx from "clsx";
import Continue from "../public/arrow-back-outline.svg";
import Back from "../public/eva_arrow-back-outline.svg";
import { useActive } from "../app/utils/ActiveContext";
import AlertMain from "../components/Alert/AlertMain";
import { useState, useEffect } from "react";
import { useObjectives } from "../app/utils/useObjectives";
import { useCampaigns } from "../app/utils/CampaignsContext";
import axios from "axios";
import { BiLoader } from "react-icons/bi";
import { removeKeysRecursively } from "../utils/removeID";

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { active, setActive, subStep, setSubStep } = useActive();
  const { selectedObjectives, selectedFunnels } = useObjectives();
  const [triggerObjectiveError, setTriggerObjectiveError] = useState(false);
  const [triggerFunnelError, setTriggerFunnelError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    createCampaign,
    updateCampaign,
    campaignData,
    campaignFormData,
    cId,
    getActiveCampaign,
  } = useCampaigns();

  // Hide alerts after a few seconds
  useEffect(() => {
    if (triggerObjectiveError || triggerFunnelError) {
      const timer = setTimeout(() => {
        setTriggerObjectiveError(false);
        setTriggerFunnelError(false);
      }, 3000); // Hides alert after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [triggerObjectiveError, triggerFunnelError]);

  const handleBack = () => {
    if (subStep > 0) {
      setSubStep((prev) => prev - 1);
    } else if (active === 7 && subStep === 0) {
      setActive((prev) => Math.max(0, prev - 1));
      setSubStep(1); // Ensure it correctly navigates back to Step 7's sub-step
    } else {
      if (active === 8) {
        setSubStep(1);
      } else {
        setSubStep(0);
      }
      setActive((prev) => Math.max(0, prev - 1));
    }
  };

  const handleContinue = async () => {
    let hasError = false;
    setLoading(true);

    const updateCampaignData = async (data: any) => {
      await updateCampaign(data);
      await getActiveCampaign(data);
    };

    // const {
    //   id,
    //   documentId,
    //   createdAt,
    //   publishedAt,
    //   updatedAt,
    //   client,
    //   budget_details,
    //   client_selection,
    //   media_plan_details,
    //   channel_mix,
    //   ...updatedCampaignData
    // } = campaignData;
    // const { documentId: clientDocumentId, ...restClientData } = client;
    // const { id: bId, restB } = budget_details;
    // const { id: clId, restC } = client_selection;
    // const { id: mId, restM } = budget_details;

    const cleanData = removeKeysRecursively(campaignData, [
      "id",
      "documentId",
      "createdAt",
      "publishedAt",
      "updatedAt",
    ]);
    const handleStepZero = async () => {
      // const updatedChannelMix = channel_mix.map(({ id, ...rest }) => rest);
      if (cId && campaignData) {
        await updateCampaignData({
          ...cleanData,
          client: campaignFormData?.client_selection?.id,
          client_selection: {
            client: campaignFormData?.client_selection?.value,
            level_1: campaignFormData?.level_1?.id,
            level_2: campaignFormData?.level_2?.id,
            level_3: campaignFormData?.level_3?.id,
          },
          media_plan_details: {
            plan_name: campaignFormData?.media_plan,
            internal_approver: campaignFormData?.approver,
          },
          budget_details: {
            currency: campaignFormData?.budget_details_currency?.id,
            fee_type: campaignFormData?.budget_details_fee_type?.id,
            sub_fee_type: campaignFormData?.budget_details_sub_fee_type,
            value: campaignFormData?.budget_details_value,
          },
        });
      } else {
        const res = await createCampaign();
        const url = new URL(window.location.href);
        url.searchParams.set("campaignId", `${res?.data?.data.documentId}`);
        window.history.pushState({}, "", url.toString());
        await getActiveCampaign(res?.data?.data.documentId);
      }
    };

    const handleStepOne = async () => {
      if (!campaignData) return;
      await updateCampaignData({
        ...cleanData,
        campaign_objective: campaignFormData?.campaign_objectives,
      });
    };

    const handleStepTwo = async () => {
      if (!campaignData) return;

      await updateCampaignData({
        ...cleanData,
        funnel_stages: campaignFormData?.funnel_stages,
      });
    };

    const handleStepThree = async () => {
      if (!campaignData) return;

      await updateCampaignData({
        ...cleanData,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
        ]),
      });
    };

    if (active === 0) {
      await handleStepZero();
    } else if (active === 1) {
      await handleStepOne();
    } else if (active === 2) {
      await handleStepTwo();
    } else if (active === 3 || active === 4 || active === 5) {
      await handleStepThree();
    }

    if (active === 1 && selectedObjectives.length === 0) {
      setTriggerObjectiveError(true);
      hasError = true;
    }

    if (active === 2 && campaignFormData?.funnel_stages?.length === 0) {
      setTriggerFunnelError(true);
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    setTriggerObjectiveError(false);
    setTriggerFunnelError(false);

    if (active === 7) {
      if (subStep < 1) {
        setSubStep((prev) => prev + 1);
      } else {
        setSubStep(0);
        setActive((prev) => prev + 1);
      }
    } else if (active === 8) {
      if (subStep < 2) {
        setSubStep((prev) => prev + 1);
      } else {
        setSubStep(0);
        setActive((prev) => prev + 1);
      }
    } else {
      setSubStep(0);
      setActive((prev) => Math.min(10, prev + 1));
    }

    setLoading(false);
  };

  return (
    <footer id="footer" className="w-full">
      {/* Show alert only when needed */}
      {triggerObjectiveError && (
        <AlertMain
          alert={{
            variant: "error",
            message: "Please select at least one campaign objective!",
            position: "bottom-right",
          }}
        />
      )}
      {triggerFunnelError && (
        <AlertMain
          alert={{
            variant: "error",
            message: "Please select at least one funnel stage!",
            position: "bottom-right",
          }}
        />
      )}


      <div className="flex justify-between w-full">
        {/* Back Button */}
        {active === 0 ? (
          <div />
        ) : (
          <button
            className={clsx(
              "bottom_black_back_btn",
              active === 0 && subStep === 0 && "opacity-50 cursor-not-allowed",
              active > 0 && "hover:bg-gray-200"
            )}
            onClick={handleBack}
            disabled={active === 0 && subStep === 0}
          >
            <Image src={Back} alt="Back" />
            <p>Back</p>
          </button>
        )}
        {/* Continue Button */}
        {active === 10 ? (
          <button
            className="bottom_black_next_btn hover:bg-blue-500"
            onClick={() => setIsOpen(true)}
          >
            <p>Confirm</p>
            <Image src={Continue} alt="Continue" />
          </button>
        ) : (
          <button
            className={clsx(
              "bottom_black_next_btn whitespace-nowrap",
              active === 10 && "opacity-50 cursor-not-allowed",
              active < 10 && "hover:bg-blue-500"
            )}
            onClick={handleContinue}
            disabled={active === 10}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {loading ? (
              <center>
                <BiLoader className="animate-spin" />
              </center>
            ) : (
              <>
                <p>
                  {active === 0
                    ? "Start Creating"
                    : isHovered
                    ? "Next Step"
                    : "Continue"}
                </p>
                <Image src={Continue} alt="Continue" />
              </>
            )}
          </button>
        )}
      </div>
    </footer>
  );
};

export default Bottom;
