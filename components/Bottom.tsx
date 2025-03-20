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
import { useVerification } from "app/utils/VerificationContext";

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { validateStep, verifybeforeMove } = useVerification();
  const { active, setActive, subStep, setSubStep } = useActive();
  const { selectedObjectives } = useObjectives();
  const [triggerObjectiveError, setTriggerObjectiveError] = useState(false);
  const [setupyournewcampaignError, SetupyournewcampaignError] = useState(false);
  const [triggerFunnelError, setTriggerFunnelError] = useState(false);
  const [selectedDatesError, setSelectedDatesError] = useState(false);
  const [incompleteFieldsError, setIncompleteFieldsError] = useState(false);
  const [triggerFormatError, setTriggerFormatError] = useState(false);
  const { selectedDates } = useSelectedDates();
  const [triggerChannelMixError, setTriggerChannelMixError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const {
    createCampaign,
    updateCampaign,
    campaignData,
    campaignFormData,
    cId,
    getActiveCampaign,
  } = useCampaigns();



  // Auto-hide errors after 3 seconds
  useEffect(() => {
    if (triggerObjectiveError || triggerFunnelError || selectedDatesError || setupyournewcampaignError || triggerChannelMixError || incompleteFieldsError || triggerFormatError) {
      const timer = setTimeout(() => {
        setTriggerObjectiveError(false);
        setTriggerFunnelError(false);
        setSelectedDatesError(false);
        SetupyournewcampaignError(false);
        setTriggerChannelMixError(false);
        setIncompleteFieldsError(false);
        setTriggerFormatError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [triggerObjectiveError, triggerFunnelError, selectedDatesError, setupyournewcampaignError, triggerChannelMixError, incompleteFieldsError, triggerFormatError]);

  const handleBack = () => {
    if (subStep > 0) {
      setSubStep((prev) => prev - 1);
    } else {
      setActive((prev) => Math.max(0, prev - 1));
      if (active === 8) setSubStep(1);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    let hasError = false;

    // Step 0 validation
    if (active === 0) {
      const isStep0Validated = verifybeforeMove?.step0 === false;
      const requiredFields = [
        campaignFormData?.client_selection?.value,
        campaignFormData?.media_plan,
        campaignFormData?.approver,
        campaignFormData?.budget_details_currency?.id,
        campaignFormData?.budget_details_fee_type?.id,
        campaignFormData?.budget_details_value,
      ];

      if (!isStep0Validated) {
        SetupyournewcampaignError(true);
        setAlert({
          variant: "error",
          message: "Please validate before proceeding!",
          position: "bottom-right",
        });
        hasError = true;
      }

      if (!requiredFields.every((field) => field)) {
        setIncompleteFieldsError(true);
        setAlert({
          variant: "error",
          message: "Please complete all required fields before proceeding!",
          position: "bottom-right",
        });
        hasError = true;
      }
    }

    // Step 1: Ensure at least one objective is selected
    if (active === 1 && selectedObjectives.length === 0) {
      setTriggerObjectiveError(true);
      setAlert({
        variant: "error",
        message: "Please define a campaign objective before proceeding!",
        position: "bottom-right",
      });
      hasError = true;
    }

    // Step 2: Ensure at least one funnel stage is selected
    if (active === 2 && (!campaignFormData?.funnel_stages || campaignFormData?.funnel_stages.length === 0)) {
      setTriggerFunnelError(true);
      setAlert({
        variant: "error",
        message: "Please select at least one funnel stage before continuing!",
        position: "bottom-right",
      });
      hasError = true;
    }

    // Step 3: Ensure at least one channel is validated
    if (active === 3) {
      const hasValidatedChannel = Object.values(campaignFormData?.validatedStages || {}).some((isValidated) => isValidated);
      if (!hasValidatedChannel) {
        setTriggerChannelMixError(true);
        hasError = true;
      }
    }

    // Step 4: Ensure at least one format is selected and validated
    if (active === 4) {
      const hasValidatedFormats = campaignFormData?.channel_mix?.some(
        (stage) =>
          stage.isValidated &&
          (stage.social_media?.some((platform) => platform.format?.length > 0) ||
            stage.display_networks?.some((platform) => platform.format?.length > 0) ||
            stage.search_engines?.some((platform) => platform.format?.length > 0))
      );
      if (!hasValidatedFormats) {
        setTriggerFormatError(true);
        hasError = true;
      }
    }

    // Step 7: Ensure dates are selected
    if (active === 7 && (!selectedDates?.to?.day || !selectedDates?.from?.day)) {
      setSelectedDatesError(true);
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    // Update campaign data
    const updateCampaignData = async (data) => {
      await updateCampaign(data);
      await getActiveCampaign(data);
    };

    const cleanData = removeKeysRecursively(campaignData, ["id", "documentId", "createdAt", "publishedAt", "updatedAt"]);

    const stepHandlers = {
      1: async () => {
        await updateCampaignData({
          ...cleanData,
          campaign_objective: campaignFormData?.campaign_objectives,
        });
      },
      2: async () => {
        await updateCampaignData({
          ...cleanData,
          funnel_stages: campaignFormData?.funnel_stages,
        });
      },
      3: async () => {
        await updateCampaignData({
          ...cleanData,
          channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, ["id", "isValidated"]),
        });
      },
      default: async () => {
        await updateCampaignData({
          ...cleanData,
          funnel_stages: campaignFormData?.funnel_stages,
          channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, ["id", "isValidated"]),
          campaign_budget: removeKeysRecursively(campaignFormData?.campaign_budget, ["id"]),
        });
      },
    };

    if (stepHandlers[active]) {
      await stepHandlers[active]();
    } else if (active > 2) {
      await stepHandlers.default();
    }

    // Proceed to the next step
    if (active === 7) {
      subStep < 1 ? setSubStep((prev) => prev + 1) : setActive((prev) => prev + 1);
    } else if (active === 8) {
      subStep < 2 ? setSubStep((prev) => prev + 1) : setActive((prev) => prev + 1);
    } else {
      setActive((prev) => Math.min(10, prev + 1));
    }

    setLoading(false);
  };


  return (


    <footer id="footer" className="w-full">
      {alert && <AlertMain alert={alert} />}
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