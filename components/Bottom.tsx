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
import { useVerification, validationRules } from "app/utils/VerificationContext";

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { validateStep, validatedSteps, setValidatedSteps, stepHasChanged, setStepHasChanged } = useVerification();
  const { active, setActive, subStep, setSubStep } = useActive();
  const { selectedObjectives } = useObjectives();
  const [triggerObjectiveError, setTriggerObjectiveError] = useState(false);
  const [setupyournewcampaignError, SetupyournewcampaignError] = useState(false);
  const [triggerFunnelError, setTriggerFunnelError] = useState(false);
  const [selectedDatesError, setSelectedDateslError] = useState(false);
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
    setLoading(true);

    let hasError = false;

    // Step 0: Validate "Set up your new campaign"
    if (active === 0) {
      const requiredFields = [
        campaignFormData?.client_selection?.value,
        campaignFormData?.media_plan,
        campaignFormData?.approver,
        campaignFormData?.budget_details_currency?.id,
        campaignFormData?.budget_details_fee_type?.id,
        campaignFormData?.budget_details_value,
      ];

      const stepNames = [
        "Set up your new campaign",
        "Define campaign objective",
        "Map funnel stages",
        "Select channel mix",
        "Formats selection",
        "Set buy objectives and types",
        "Plan campaign schedule",
        "Configure ad sets and budget",
        "Establish goals",
        "Overview of your campaign",
      ];

      const currentStepName = stepNames[active];

      console.log(`Validating step: ${currentStepName}`);
      console.log("Campaign Form Data:", campaignFormData);

      const isValids = validateStep(currentStepName, campaignFormData);
      console.log(`Validation result for ${currentStepName}:`, isValids);

      if (!isValids) {
        setAlert({
          variant: "error",
          message: "Please complete all required fields before proceeding!",
          position: "bottom-right",
        });
        // console.error("Validation failed. Missing fields:", campaignFormData);
        setLoading(false);
        return;
      }

      console.log("Validation passed!");
      //     const filledFields = requiredFields.filter((field) => field);

      //     if (
      //       filledFields.length > 0 &&
      //       filledFields.length < requiredFields.length
      //     ) {
      //       setIncompleteFieldsError(true); // Show alert for incomplete fields
      //       setLoading(false);
      //       return;
      //     }


      //     if (filledFields.length === 0) {
      //       SetupyournewcampaignError(true);
      //       hasError = true;
      //     }
      //   }
      const isValid = requiredFields.every((field) => field !== undefined && field !== null && field !== "");

      if (!isValid) {
        SetupyournewcampaignError(true);
        setAlert({
          variant: "error",
          message: "Please complete all required fields before proceeding!",
          position: "bottom-right",
        });
        setLoading(false);
        return; // Stop execution
      }
    }

    // Step 1: Validate "Define campaign objective"
    if (active === 1 && selectedObjectives.length === 0) {
      setTriggerObjectiveError(true);
      setAlert({
        variant: "error",
        message: "Please define a campaign objective before proceeding!",
        position: "bottom-right",
      });
      setLoading(false);
      return; // Stop execution
    }

    // Step 2: Validate "Map funnel stages"
    if (active === 2 && (!campaignFormData?.funnel_stages || campaignFormData?.funnel_stages.length === 0)) {
      setTriggerFunnelError(true);
      setAlert({
        variant: "error",
        message: "Please select at least one funnel stage before continuing!",
        position: "bottom-right",
      });
      setLoading(false);
      return; // Stop execution
    }

    // Step 7: Validate "Plan campaign schedule"
    if (active === 7 && (!selectedDates?.to?.day || !selectedDates?.from?.day)) {
      setSelectedDateslError(true);
      setAlert({
        variant: "error",
        message: "Please choose a start and end date before proceeding!",
        position: "bottom-right",
      });
      setLoading(false);
      return; // Stop execution
    }

    // Step 3: Validate "Select channel mix" (if needed)
    // if (active === 3 && (!selectedChannels || Object.keys(selectedChannels).length === 0)) {
    //   setTriggerChannelMixError(true);
    //   setAlert({
    //     variant: "error",
    //     message: "Please select at least one channel mix before proceeding!",
    //     position: "bottom-right",
    //   });
    //   setLoading(false);
    //   return; // Stop execution
    // }

    // Process valid steps and update campaign
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

    if (active === 1) {
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
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, ["id", "isValidated"]),
      });
    };

    const handleStepFour = async () => {
      if (!campaignData) return;

      await updateCampaignData({
        ...cleanData,
        funnel_stages: campaignFormData?.funnel_stages,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id", "isValidated",
        ]),
        campaign_budget: removeKeysRecursively(
          campaignFormData?.campaign_budget,
          ["id"]
        ),
      });
    };

    if (active === 1) {
      await handleStepOne();
    } else if (active === 2) {
      await handleStepTwo();
    } else if (active > 2 && subStep < 1) {
      await handleStepThree();
    } else if (active > 2 && subStep > 1) {
      await handleStepFour();
    }

    // Proceed to next step logic
    if (active === 7) {
      subStep < 1 ? setSubStep((prev) => prev + 1) : setActive((prev) => prev + 1);
    } else if (active === 8) {
      subStep < 2 ? setSubStep((prev) => prev + 1) : setActive((prev) => prev + 1);
    } else {
      setActive((prev) => Math.min(10, prev + 1));
    }

    setLoading(false);
  };


  // const handleContinue = async () => {
  //   setLoading(true);
  //   let hasError = false;

  //   // Validate current step based on `active` step
  //   const validationCheck = [
  //     validationRules["Set up your new campaign"](campaignFormData), // Step 0
  //     // validationRules["Define campaign objective"](campaignFormData), // Step 1
  //     // validationRules["Map funnel stages"](campaignFormData), // Step 2
  //     // validationRules["Select channel mix"](campaignFormData), // Step 3
  //     // validationRules["Plan campaign schedule"](campaignFormData), // Step 7
  //   ];

  //   // If validation fails, show an alert and stop execution
  //   if (!validationCheck[active]) {
  //     if (active === 0) setIncompleteFieldsError(true);
  //     if (active === 1) setTriggerObjectiveError(true);
  //     if (active === 2) setTriggerFunnelError(true);
  //     if (active === 7) setSelectedDateslError(true);

  //     setLoading(false);
  //     return;
  //   }

  //   const updateCampaignData = async (data: any) => {
  //     await updateCampaign(data);
  //     await getActiveCampaign(data);
  //   };

  //   const cleanData = removeKeysRecursively(campaignData, [
  //     "id",
  //     "documentId",
  //     "createdAt",
  //     "publishedAt",
  //     "updatedAt",
  //   ]);

  //   if (active === 1) {
  //     await updateCampaignData({
  //       ...cleanData,
  //       campaign_objective: campaignFormData?.campaign_objectives,
  //     });
  //   } else if (active === 2) {
  //     await updateCampaignData({
  //       ...cleanData,
  //       funnel_stages: campaignFormData?.funnel_stages,
  //     });
  //   } else if (active > 2) {
  //     await updateCampaignData({
  //       ...cleanData,
  //       funnel_stages: campaignFormData?.funnel_stages,
  //       channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, ["id"]),
  //     });
  //   }

  //   // Proceed to next step logic
  //   if (active === 7) {
  //     subStep < 1 ? setSubStep((prev) => prev + 1) : setActive((prev) => prev + 1);
  //   } else if (active === 8) {
  //     subStep < 2 ? setSubStep((prev) => prev + 1) : setActive((prev) => prev + 1);
  //   } else {
  //     setActive((prev) => Math.min(10, prev + 1));
  //   }

  //   setLoading(false);
  // };


  // const handleContinue = async () => {
  //   let hasError = false;
  //   setLoading(true);

  //   if (active === 0) {
  //     const requiredFields = [
  //       campaignFormData?.client_selection?.value,
  //       campaignFormData?.media_plan,
  //       campaignFormData?.approver,
  //       campaignFormData?.budget_details_currency?.id,
  //       campaignFormData?.budget_details_fee_type?.id,
  //       campaignFormData?.budget_details_value,
  //     ];

  //     const filledFields = requiredFields.filter((field) => field);

  //     if (
  //       filledFields.length > 0 &&
  //       filledFields.length < requiredFields.length
  //     ) {
  //       setIncompleteFieldsError(true); // Show alert for incomplete fields
  //       setLoading(false);
  //       return;
  //     }


  //     if (filledFields.length === 0) {
  //       SetupyournewcampaignError(true);
  //       hasError = true;
  //     }
  //   }
  //   if (active === 1 && selectedObjectives.length === 0) {
  //     setTriggerObjectiveError(true);
  //     hasError = true;
  //   }

  //   if (active === 2 && campaignFormData?.funnel_stages?.length === 0) {
  //     setTriggerFunnelError(true);
  //     hasError = true;
  //   }
  //   if (active === 7 && selectedDates?.to?.day === undefined) {
  //     setSelectedDateslError(true);
  //     hasError = true;
  //   }

  //   // if (active === 3 && (!selectedChannels || Object.keys(selectedChannels).length === 0)) {
  //   //   setTriggerChannelMixError(true);
  //   //   hasError = true;
  //   // }

  //   if (hasError) {
  //     setLoading(false);
  //     return;
  //   }
  //   const updateCampaignData = async (data: any) => {
  //     await updateCampaign(data);
  //     await getActiveCampaign(data);
  //   };



  //   const cleanData = removeKeysRecursively(campaignData, [
  //     "id",
  //     "documentId",
  //     "createdAt",
  //     "publishedAt",
  //     "updatedAt",
  //   ]);


  //   const handleStepOne = async () => {
  //     if (!campaignData) return;
  //     await updateCampaignData({
  //       ...cleanData,
  //       campaign_objective: campaignFormData?.campaign_objectives,
  //     });
  //   };

  //   const handleStepTwo = async () => {
  //     if (!campaignData) return;

  //     await updateCampaignData({
  //       ...cleanData,
  //       funnel_stages: campaignFormData?.funnel_stages,
  //     });
  //   };

  //   const handleStepThree = async () => {
  //     if (!campaignData) return;

  //     await updateCampaignData({
  //       ...cleanData,
  //       funnel_stages: campaignFormData?.funnel_stages,
  //       channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
  //         "id",
  //       ]),
  //     });
  //   };

  //   if (active === 1) {
  //     await handleStepOne();
  //   } else if (active === 2) {
  //     await handleStepTwo();
  //   } else if (active > 2) {
  //     await handleStepThree();
  //   }
  //   // if (active === 0) {
  //   //   await handleStepZero();
  //   // } else if (active === 1) {
  //   //   await handleStepOne();
  //   // } else if (active === 2) {
  //   //   await handleStepTwo();
  //   // } else if (active > 2) {
  //   //   await handleStepThree();
  //   // }

  //   if (active === 7) {
  //     if (subStep < 1) {
  //       setSubStep((prev) => prev + 1);
  //     } else {
  //       setSubStep(0);
  //       setActive((prev) => prev + 1);
  //     }
  //   } else if (active === 8) {
  //     if (subStep < 2) {
  //       setSubStep((prev) => prev + 1);
  //     } else {
  //       setSubStep(0);
  //       setActive((prev) => prev + 1);
  //     }
  //   } else {
  //     setSubStep(0);
  //     setActive((prev) => Math.min(10, prev + 1));
  //   }

  //   setLoading(false);
  // };

  return (
    <footer id="footer" className="w-full">
      {alert && <AlertMain alert={alert} />}
      {/* Show alert only when needed */}
      {/* {setupyournewcampaignError && (
        <AlertMain
          alert={{
            variant: "info",
            message: "Please set up your new campaign!",
            position: "bottom-right",
          }}
        />
      )} */}
      {/* Show alert when some fields are filled but not all */}
      {/* {incompleteFieldsError && (
        <AlertMain
          alert={{
            variant: "info",
            message: "All fields must be filled before proceeding!",
            position: "bottom-right",
          }}
        />
      )} */}
      {triggerObjectiveError && (
        <AlertMain
          alert={{
            variant: "info",
            message: "Please select at least one campaign objective!",
            position: "bottom-right",
          }}
        />
      )}
      {triggerFunnelError && (
        <AlertMain
          alert={{
            variant: "info",
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