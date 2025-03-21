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
import { BiLoader } from "react-icons/bi";
import { removeKeysRecursively } from "../utils/removeID";
import { useSelectedDates } from "../app/utils/SelectedDatesContext";

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { active, setActive, subStep, setSubStep } = useActive();
  const { selectedObjectives } = useObjectives();
  const [triggerObjectiveError, setTriggerObjectiveError] = useState(false);
  const [setupyournewcampaignError, SetupyournewcampaignError] =
    useState(false);
  const [triggerFunnelError, setTriggerFunnelError] = useState(false);
  const [selectedDatesError, setSelectedDateslError] = useState(false);
  const [incompleteFieldsError, setIncompleteFieldsError] = useState(false);
  const [triggerFormatError, setTriggerFormatError] = useState(false);
  const { selectedDates } = useSelectedDates();
  const [triggerChannelMixError, setTriggerChannelMixError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    createCampaign,
    updateCampaign,
    campaignData,
    campaignFormData,
    cId,
    getActiveCampaign,
    copy
  } = useCampaigns();

  // Hide alerts after a few seconds
  useEffect(() => {
    if (
      triggerObjectiveError ||
      triggerFunnelError ||
      selectedDatesError ||
      setupyournewcampaignError ||
      triggerChannelMixError ||
      incompleteFieldsError ||
      triggerFormatError
    ) {
      const timer = setTimeout(() => {
        setTriggerObjectiveError(false);
        setTriggerFunnelError(false);
        setSelectedDateslError(false);
        SetupyournewcampaignError(false);
        setTriggerChannelMixError(false);
        setIncompleteFieldsError(false);
        setTriggerFormatError(false);
      }, 3000); // Hides alert after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [
    triggerObjectiveError,
    triggerFunnelError,
    selectedDatesError,
    setupyournewcampaignError,
    triggerChannelMixError,
    incompleteFieldsError,
    triggerFormatError,
  ]);

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

    // ✅ Step Zero Validation - Ensure all fields are filled
    if (active === 0) {
      const requiredFields = [
        campaignFormData?.client_selection?.value,
        campaignFormData?.media_plan,
        campaignFormData?.approver,
        campaignFormData?.budget_details_currency?.id,
        campaignFormData?.budget_details_fee_type?.id,
        campaignFormData?.budget_details_value,
      ];

      const filledFields = requiredFields.filter((field) => field);

      if (
        filledFields.length > 0 &&
        filledFields.length < requiredFields.length
      ) {
        setIncompleteFieldsError(true);
        setLoading(false);
        return;
      }

      if (filledFields.length === 0) {
        SetupyournewcampaignError(true);
        hasError = true;
      }
    }

    // ✅ Step One Validation - Ensure at least one objective is selected
    if (active === 1 && selectedObjectives.length === 0) {
      setTriggerObjectiveError(true);
      hasError = true;
    }

    // ✅ Step Two Validation - Ensure at least one funnel stage is selected
    if (active === 2 && campaignFormData?.funnel_stages?.length === 0) {
      setTriggerFunnelError(true);
      hasError = true;
    }

    // ✅ Step Three Validation - Check if at least one channel is validated
    if (active === 3) {
      const hasAnyValidatedStage =
        campaignFormData?.validatedStages &&
        Object.values(campaignFormData.validatedStages).some(
          (isValidated) => isValidated === true
        );
      if (!hasAnyValidatedStage) {
        setTriggerChannelMixError(true);
        hasError = true;
      }
    }

    // ✅ Step Four Validation - Ensure at least one format is selected and validated
    if (active === 4) {
      const hasValidatedFormats = campaignFormData?.channel_mix?.some(
        (stage) =>
          stage.isValidated &&
          (stage.social_media?.some(
            (platform) => platform.format?.length > 0
          ) ||
            stage.display_networks?.some(
              (platform) => platform.format?.length > 0
            ) ||
            stage.search_engines?.some(
              (platform) => platform.format?.length > 0
            ))
      );
      if (!hasValidatedFormats) {
        setTriggerFormatError(true);
        hasError = true;
      }
    }

    // ✅ Step Seven Validation - Ensure dates are selected
    if (active === 7 && selectedDates?.to?.day === undefined && subStep <1) {
      setSelectedDateslError(true);
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    const updateCampaignData = async (data: any) => {
      await updateCampaign(data);
      await getActiveCampaign(data);
    };

    const cleanData = removeKeysRecursively(campaignData, [
      "id",
      "documentId",
      "createdAt",
      "publishedAt",
      "updatedAt",
    ]);

    const handleStepZero = async () => {
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
          "isValidated",
        ]),
      });
    };

    const handleStepFour = async () => {
      if (!campaignData) return;

      if (active === 7 && subStep === 1) {
        await updateCampaignData({
          ...cleanData,
          funnel_stages: copy?.funnel_stages,
          channel_mix: removeKeysRecursively(copy?.channel_mix, [
            "id",
            "isValidated",
          ]),
          campaign_budget: removeKeysRecursively(
            copy?.campaign_budget,
            ["id"]
          ),
        });
      } else {
        await updateCampaignData({
          ...cleanData,
          funnel_stages: campaignFormData?.funnel_stages,
          channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
            "id",
            "isValidated",
          ]),
          campaign_budget: removeKeysRecursively(
            campaignFormData?.campaign_budget,
            ["id"]
          ),
        });
      }
    };

    if (active === 0) {
      await handleStepZero();
    } else if (active === 1) {
      await handleStepOne();
    } else if (active === 2) {
      await handleStepTwo();
    } else if (active > 2 && subStep < 1) {
      await handleStepThree();
    } else if (active > 2 && subStep > 0) {
      await handleStepFour();
    }

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
      {setupyournewcampaignError && (
        <AlertMain
          alert={{
            variant: "error",
            message: "Set up your new campaign cannot be empty!",
            position: "bottom-right",
          }}
        />
      )}
      {incompleteFieldsError && (
        <AlertMain
          alert={{
            variant: "error",
            message: "All fields must be filled before proceeding!",
            position: "bottom-right",
          }}
        />
      )}

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
      {selectedDatesError && (
        <AlertMain
          alert={{
            variant: "error",
            message: "Choose your start and end date!",
            position: "bottom-right",
          }}
        />
      )}

      {triggerChannelMixError && (
        <AlertMain
          alert={{
            variant: "error",
            message: "Please select and validate at least one channel!",
            position: "bottom-right",
          }}
        />
      )}
      {triggerFormatError && (
        <AlertMain
          alert={{
            variant: "error",
            message: "Please select and validate at least one format!",
            position: "bottom-right",
          }}
        />
      )}

      <div className="flex justify-between w-full">
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
