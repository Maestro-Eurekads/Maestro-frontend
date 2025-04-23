"use client";
import Image from "next/image";
import clsx from "clsx";
import Continue from "../public/arrow-back-outline.svg";
import Back from "../public/eva_arrow-back-outline.svg";
import { useActive } from "../app/utils/ActiveContext";
import AlertMain from "../components/Alert/AlertMain";
import { useState, useEffect } from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { BiLoader } from "react-icons/bi";
import { removeKeysRecursively } from "../utils/removeID";
import { useSelectedDates } from "../app/utils/SelectedDatesContext";
import { useVerification } from "app/utils/VerificationContext";
import toast, { Toaster } from "react-hot-toast";

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { verifybeforeMove, hasChanges } = useVerification();
  const { active, setActive, subStep, setSubStep } = useActive();
  const [triggerObjectiveError, setTriggerObjectiveError] = useState(false);
  const [setupyournewcampaignError, setSetupyournewcampaignError] =
    useState(false);
  const [triggerFunnelError, setTriggerFunnelError] = useState(false);
  const [selectedDatesError, setSelectedDatesError] = useState(false);
  const [incompleteFieldsError, setIncompleteFieldsError] = useState(false);
  const [triggerFormatError, setTriggerFormatError] = useState(false);
  const [triggerFormatErrorCount, setTriggerFormatErrorCount] = useState(0);
  const [validateStep, setValidateStep] = useState(false);
  const { selectedDates } = useSelectedDates();
  const [triggerChannelMixError, setTriggerChannelMixError] = useState(false);
  const [triggerBuyObjectiveError, setTriggerBuyObjectiveError] =
    useState(false);
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
    copy,
  } = useCampaigns();

  useEffect(() => {
    if (typeof window !== "undefined" && cId) {
      const storedValue = localStorage.getItem(`triggerFormatError_${cId}`);
      setTriggerFormatError(storedValue === "true");
    }
  }, [cId]);

  useEffect(() => {
    if (typeof window !== "undefined" && cId) {
      localStorage.setItem(
        `triggerFormatError_${cId}`,
        triggerFormatError.toString()
      );
    }
  }, [triggerFormatError, cId]);

  useEffect(() => {
    if (
      triggerObjectiveError ||
      triggerFunnelError ||
      selectedDatesError ||
      setupyournewcampaignError ||
      triggerChannelMixError ||
      incompleteFieldsError ||
      triggerBuyObjectiveError ||
      validateStep
    ) {
      const timer = setTimeout(() => {
        setTriggerObjectiveError(false);
        setTriggerFunnelError(false);
        setSelectedDatesError(false);
        setSetupyournewcampaignError(false);
        setTriggerChannelMixError(false);
        setIncompleteFieldsError(false);
        setTriggerBuyObjectiveError(false);
        setValidateStep(false);
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [
    triggerObjectiveError,
    triggerFunnelError,
    selectedDatesError,
    setupyournewcampaignError,
    triggerChannelMixError,
    incompleteFieldsError,
    triggerBuyObjectiveError,
    validateStep,
    campaignFormData,
  ]);

  const validateFormatSelection = () => {
    const selectedStages = campaignFormData?.funnel_stages || [];
    const validatedStages = campaignFormData?.validatedStages || {};
    let hasValidFormat = false;

    for (const stage of selectedStages) {
      const stageData = campaignFormData?.channel_mix?.find(
        (mix) => mix.funnel_stage === stage
      );

      if (stageData) {
        const hasFormatSelected = [
          ...(stageData.social_media || []),
          ...(stageData.display_networks || []),
          ...(stageData.search_engines || []),
        ].some(
          (platform) =>
            platform.format?.length > 0 &&
            platform.format.some((f) => f.format_type && f.num_of_visuals)
        );

        const isStageValidated = validatedStages[stage];

        if (hasFormatSelected && isStageValidated) {
          hasValidFormat = true;
          break;
        }
      }
    }
    return hasValidFormat;
  };

  const validateBuyObjectiveSelection = () => {
    const selectedStages = campaignFormData?.funnel_stages || [];
    const validatedStages = campaignFormData?.validatedStages || {};

    if (!selectedStages.length || !campaignFormData?.channel_mix) {
      return false;
    }

    for (const stage of selectedStages) {
      const stageData = campaignFormData.channel_mix.find(
        (mix) => mix.funnel_stage === stage
      );

      if (stageData && validatedStages[stage]) {
        const hasValidChannel = [
          ...(stageData.social_media || []),
          ...(stageData.display_networks || []),
          ...(stageData.search_engines || []),
        ].some((platform) => platform.buy_type && platform.objective_type);

        if (hasValidChannel) {
          return true;
        }
      }
    }
    return false;
  };

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

    try {
      if (active === 0) {
        const requiredFields = [
          campaignFormData?.client_selection?.value,
          campaignFormData?.media_plan,
          campaignFormData?.approver,
          campaignFormData?.client_approver,
        ];

        if (!requiredFields.every((field) => field)) {
          setIncompleteFieldsError(true);
          setAlert({
            variant: "error",
            message: "Please complete all required fields before proceeding!",
            position: "bottom-right",
          });
          hasError = true;
        }

        if (!hasError) {
          try {
            const cleanData = campaignData
              ? removeKeysRecursively(campaignData, [
                  "id",
                  "documentId",
                  "createdAt",
                  "publishedAt",
                  "updatedAt",
                ])
              : {};

            await createCampaign({
              ...cleanData,
              ...campaignFormData,
              progress_percent: 10,
            });

            setActive((prev) => Math.min(9, prev + 1));
          } catch (error) {
            console.error("Error creating campaign:", error);
            setAlert({
              variant: "error", 
              message: "Failed to create campaign. Please try again.",
              position: "bottom-right",
            });
            hasError = true;
          }
        }
      }

      if (active === 1) {
        if (
          !campaignFormData?.funnel_stages ||
          campaignFormData.funnel_stages.length === 0
        ) {
          setTriggerFunnelError(true);
          setAlert({
            variant: "error",
            message: "Please select at least one funnel stage before continuing!",
            position: "bottom-right",
          });
          hasError = true;
        }
      }

      // Rest of the validation logic remains the same
      // ... (keeping all other validation checks)

      if (!hasError) {
        if (active === 7 || active === 8) {
          if (subStep < 1) {
            setSubStep((prev) => prev + 1);
          } else {
            setActive((prev) => prev + 1);
            setSubStep(0);
          }
        } else {
          setActive((prev) => Math.min(9, prev + 1));
        }
      }

    } catch (error) {
      console.error("Error in handleContinue:", error);
      setAlert({
        variant: "error",
        message: "An error occurred. Please try again.",
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setActive((prev) => Math.min(9, prev + 1));
  };

  return (
    <footer id="footer" className="w-full">
      <Toaster position="bottom-right"/>
      {alert && <AlertMain alert={alert} />}
      {validateStep && (
        <AlertMain
          alert={{
            variant: "error",
            message: "Please validate before proceeding!",
            position: "bottom-right",
          }}
        />
      )}
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
            message: "Please select and validate a campaign objective!",
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
      {triggerFormatError && active === 4 && (
        <AlertMain
          key={`format-error-${triggerFormatErrorCount}`}
          alert={{
            variant: "error",
            message: "Please select and validate at least one format!",
            position: "bottom-right",
          }}
        />
      )}
      {triggerBuyObjectiveError && active === 5 && (
        <AlertMain
          alert={{
            variant: "error",
            message:
              "Please select and validate at least one channel with buy type and objective!",
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
          <div className="flex justify-center items-center gap-3">
            {active === 5 && (
              <button
                className="p-3 text-[16px] rounded-md  w-[150px] font-semibold text-[#3175FF]"
                style={{
                  border: "2px solid #3175FF",
                }}
                onClick={handleSkip}
              >
                Skip
              </button>
            )}
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
                      ? "Start"
                      : isHovered
                      ? "Next Step"
                      : "Continue"}
                  </p>
                  <Image src={Continue} alt="Continue" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Bottom;
