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

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { verifybeforeMove, hasChanges } = useVerification();
  const { active, setActive, subStep, setSubStep } = useActive();
  const [triggerObjectiveError, setTriggerObjectiveError] = useState(false);
  const [setupyournewcampaignError, SetupyournewcampaignError] = useState(false);
  const [triggerFunnelError, setTriggerFunnelError] = useState(false);
  const [selectedDatesError, setSelectedDatesError] = useState(false);
  const [incompleteFieldsError, setIncompleteFieldsError] = useState(false);
  const [triggerFormatError, setTriggerFormatError] = useState(false);
  const [validateStep, setValidateStep] = useState(false);
  const { selectedDates } = useSelectedDates();
  const [triggerChannelMixError, setTriggerChannelMixError] = useState(false);
  const [triggerBuyObjectiveError, setTriggerBuyObjectiveError] = useState(false);
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

  // Auto-hide errors after 3 seconds
  useEffect(() => {
    if (
      triggerObjectiveError ||
      triggerFunnelError ||
      selectedDatesError ||
      setupyournewcampaignError ||
      triggerChannelMixError ||
      incompleteFieldsError ||
      triggerFormatError ||
      triggerBuyObjectiveError ||
      validateStep
    ) {
      const timer = setTimeout(() => {
        setTriggerObjectiveError(false);
        setTriggerFunnelError(false);
        setSelectedDatesError(false);
        SetupyournewcampaignError(false);
        setTriggerChannelMixError(false);
        setIncompleteFieldsError(false);
        setTriggerFormatError(false);
        setTriggerBuyObjectiveError(false);
        setValidateStep(false);
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
    triggerFormatError,
    triggerBuyObjectiveError,
    validateStep
  ]);

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
      const requiredFields = [
        campaignFormData?.client_selection?.value,
        campaignFormData?.media_plan,
        campaignFormData?.approver,
        campaignFormData?.budget_details_currency?.id,
        campaignFormData?.budget_details_fee_type?.id,
        campaignFormData?.budget_details_value,
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


      if (hasChanges) {
        setValidateStep(true);
        hasError = true;
      }
    }

    // Step 1: Campaign Objective validation
    if (active === 1) {
      if (hasChanges) {
        setValidateStep(true);
        hasError = true;
      }
    }

    // Step 2: Ensure at least one funnel stage is selected
    if (active === 2) {
      if (!campaignFormData?.funnel_stages || campaignFormData.funnel_stages.length === 0) {
        setTriggerFunnelError(true);

        setAlert({
          variant: "error",
          message: "Please select at least one funnel stage before continuing!",
          position: "bottom-right",
        });

        hasError = true;
      }

      if (hasChanges) {
        setValidateStep(true);
        hasError = true;
      }


    }


    // Step 3: Ensure at least one channel is validated
    if (active === 3) {
      const selectedStages = campaignFormData?.funnel_stages || [];
      const validatedStages = campaignFormData?.validatedStages || {};

      const hasUnvalidatedSelectedStage = selectedStages.some((stage) => {
        const isSelected = campaignFormData?.channel_mix?.some((mix) =>
          mix.funnel_stage === stage &&
          (mix.social_media?.length > 0 || mix.display_networks?.length > 0 || mix.search_engines?.length > 0)
        );
        return isSelected && !validatedStages[stage];
      });

      if (hasUnvalidatedSelectedStage || !Object.values(validatedStages).some(Boolean)) {
        setTriggerChannelMixError(true);
        setAlert({
          variant: "error",
          message: "Please select and validate at least one channel!",
          position: "bottom-right",
        });
        hasError = true;
      }
    }

    // Step 4: Updated validation for FormatSelection
    if (active === 4) {
      const selectedStages = campaignFormData?.funnel_stages || [];
      let hasValidFormat = false;

      for (const stage of selectedStages) {
        const stageData = campaignFormData?.channel_mix?.find(
          (mix) => mix.funnel_stage === stage
        );

        if (stageData) {
          const hasFormatSelected = [
            ...(stageData.social_media || []),
            ...(stageData.display_networks || []),
            ...(stageData.search_engines || [])
          ].some(platform =>
            platform.format?.length > 0 &&
            platform.format.some(f => f.format_type && f.num_of_visuals)
          );

          const isStageValidated = campaignFormData?.validatedStages?.[stage];

          if (hasFormatSelected && isStageValidated) {
            hasValidFormat = true;
            break;
          }
        }
      }

      if (!hasValidFormat) {
        setTriggerFormatError(true);
        setAlert({
          variant: "error",
          message: "Please select and validate at least one format for a funnel stage!",
          position: "bottom-right",
        });
        hasError = true;
      }
    }

    // Step 5: Ensure Buy and objectives are validated
    if (active === 5) {
      const selectedStages = campaignFormData?.funnel_stages || [];
      const validatedStages = campaignFormData?.validatedStages || {};

      const hasUnvalidatedSelectedStage = selectedStages.some((stage) => {
        const isSelected = campaignFormData?.channel_mix?.some((mix) =>
          mix.funnel_stage === stage &&
          (mix.social_media?.length > 0 || mix.display_networks?.length > 0 || mix.search_engines?.length > 0)
        );
        return isSelected && !validatedStages[stage];
      });

      if (hasUnvalidatedSelectedStage) {
        setTriggerBuyObjectiveError(true);
        setAlert({
          variant: "error",
          message: "Please validate all selected stages before proceeding!",
          position: "bottom-right",
        });
        hasError = true;
      }

      const hasAnyValidatedBUObjective = Object.values(validatedStages).some(
        (isValidated) => isValidated === true
      );
      if (!hasAnyValidatedBUObjective) {
        setTriggerBuyObjectiveError(true);
        setAlert({
          variant: "error",
          message: "Please validate at least one stage before proceeding!",
          position: "bottom-right",
        });
        hasError = true;
      }
    }

    // Step 7: Ensure dates are selected
    if (active === 7) {
      if ((!selectedDates?.to?.day || !selectedDates?.from?.day) && subStep < 1) {
        setSelectedDatesError(true);
        setAlert({
          variant: "error",
          message: "Choose your start and end date!",
          position: "bottom-right",
        });
        hasError = true;
      }

      if (hasChanges) {
        setValidateStep(true);
        hasError = true;
      }
    }


    if (hasError) {
      setLoading(false);
      return;
    }

    const updateCampaignData = async (data) => {
      try {
        await updateCampaign(data);
        await getActiveCampaign(data);
      } catch (error) {
        setAlert({
          variant: "error",
          message: "Failed to update campaign data",
          position: "bottom-right",
        });
        throw error;
      }
    };

    const cleanData = campaignData ? removeKeysRecursively(campaignData, [
      "id",
      "documentId",
      "createdAt",
      "publishedAt",
      "updatedAt",
    ]) : {};

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
        try {
          const res = await createCampaign();
          const url = new URL(window.location.href);
          url.searchParams.set("campaignId", `${res?.data?.data.documentId}`);
          window.history.pushState({}, "", url.toString());
          await getActiveCampaign(res?.data?.data.documentId);
        } catch (error) {
          setAlert({
            variant: "error",
            message: "Failed to create campaign",
            position: "bottom-right",
          });
          throw error;
        }
      }
    };

    const handleStepOne = async () => {
      if (!campaignData || !cId) return;
      await updateCampaignData({
        ...cleanData,
        campaign_objective: campaignFormData?.campaign_objectives,
      });
    };

    const handleStepTwo = async () => {
      if (!campaignData || !cId) return;
      await updateCampaignData({
        ...cleanData,
        funnel_stages: campaignFormData?.funnel_stages,
      });
    };

    const handleStepThree = async () => {
      if (!campaignData || !cId) return;
      await updateCampaignData({
        ...cleanData,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
          "isValidated",
        ]),
      });
    };

    const handleStepFour = async () => {
      if (!campaignData || !cId) return;
      await updateCampaignData({
        ...cleanData,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
          "isValidated",
          "formatValidated"
        ]),
      });
    };

    const handleStepFive = async () => {
      if (!campaignData || !cId) return;
      await updateCampaignData({
        ...cleanData,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
          "isValidated",
        ]),
      });
    };

    const handleStepSeven = async () => {
      if (!campaignData) return;

      if (active === 7 && subStep === 1) {
        await updateCampaignData({
          ...cleanData,
          funnel_stages: campaignFormData?.funnel_stages,
          channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
            "id",
            "isValidated",
          ]),
          campaign_budget: removeKeysRecursively(copy?.campaign_budget, ["id"]),
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
          goal_level: campaignFormData?.goal_level
        });
      }
    };

    try {
      if (active === 0) {
        await handleStepZero();
      } else if (active === 1) {
        await handleStepOne();
      } else if (active === 2) {
        await handleStepTwo();
      } else if (active === 3) {
        await handleStepThree();
      } else if (active === 4) {
        await handleStepFour();
      } else if (active === 5) {
        await handleStepFive();
      } else if (active === 7) {
        await handleStepSeven();
      } else if (active > 2 && subStep < 1) {
        await handleStepThree();
      } else if (active > 2 && subStep > 0) {
        await handleStepFour();
      }

      // Proceed to the next step only if no errors
      if (active === 7) {
        subStep < 1 ? setSubStep((prev) => prev + 1) : setActive((prev) => prev + 1);
      } else if (active === 8) {
        subStep < 2 ? setSubStep((prev) => prev + 1) : setActive((prev) => prev + 1);
      } else {
        setActive((prev) => Math.min(10, prev + 1));
      }
    } catch (error) {
      console.error("Error in handleContinue:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer id="footer" className="w-full">
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
      {triggerFormatError && (
        <AlertMain
          alert={{
            variant: "error",
            message: "Please select and validate at least one format!",
            position: "bottom-right",
          }}
        />
      )}
      {triggerBuyObjectiveError && (
        <AlertMain
          alert={{
            variant: "error",
            message: "Please validate all selected stages before proceeding!",
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