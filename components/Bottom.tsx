"use client";
import Image from "next/image";
import clsx from "clsx";
import Continue from "../public/arrow-back-outline.svg";
import Back from "../public/eva_arrow-back-outline.svg";
import { useActive } from "../app/utils/ActiveContext";
import AlertMain from "../components/Alert/AlertMain";
import { useState, useEffect, useRef } from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { BiLoader } from "react-icons/bi";
import { removeKeysRecursively } from "../utils/removeID";
import { useSelectedDates } from "../app/utils/SelectedDatesContext";
import { useEditing } from "app/utils/EditingContext";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import { selectCurrency } from "./Options";
import { useUserPrivileges } from "utils/userPrivileges";
import { extractObjectives } from "app/creation/components/EstablishedGoals/table-view/data-processor";

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void;
}

const CHANNEL_TYPES = [
  { key: "social_media", title: "Social media" },
  { key: "display_networks", title: "Display Networks" },
  { key: "search_engines", title: "Search Engines" },
  { key: "streaming", title: "Streaming" },
  { key: "ooh", title: "OOH" },
  { key: "broadcast", title: "Broadcast" },
  { key: "messaging", title: "Messaging" },
  { key: "print", title: "Print" },
  { key: "e_commerce", title: "E Commerce" },
  { key: "in_game", title: "In Game" },
  { key: "mobile", title: "Mobile" },
];

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { active, setActive, subStep, setSubStep } = useActive();
  const { midcapEditing } = useEditing();
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
  const [isBuyingObjectiveError, setIsBuyingObjectiveError] = useState(false);
  const [isEditingError, setIsEditingError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [hasFormatSelected, setHasFormatSelected] = useState(false);
  const { isFinancialApprover, isAgencyApprover, isAdmin } =
    useUserPrivileges();
  const {
    createCampaign,
    updateCampaign,
    campaignData,
    campaignFormData,
    cId,
    getActiveCampaign,
    copy,
    isEditingBuyingObjective,
    isStepZeroValid,
    setIsStepZeroValid,
    selectedOption,
    setCampaignFormData,
    requiredFields,
    currencySign,
  } = useCampaigns();

  // --- Persist format selection for active === 4 ---
  const hasProceededFromFormatStep = useRef(false);

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
          ...(stageData.streaming || []),
          ...(stageData.ooh || []),
          ...(stageData.broadcast || []),
          ...(stageData.messaging || []),
          ...(stageData.print || []),
          ...(stageData.e_commerce || []),
          ...(stageData.in_game || []),
          ...(stageData.mobile || []),
        ].some(
          (platform) =>
            (platform.format?.length > 0 &&
              platform.format.some((f) => f.format_type && f.num_of_visuals)) ||
            platform.ad_sets?.some((adset) =>
              adset.format?.some((f) => f.format_type && f.num_of_visuals)
            )
        );

        const isStageValidated = validatedStages[stage];

        if (hasFormatSelected || isStageValidated) {
          hasValidFormat = true;
          break;
        }
      }
    }
    return hasValidFormat;
  };

  console.log("campaignFormData-campaignFormData", campaignFormData);

  // Only reset formats when entering active === 4 if the user has NOT already proceeded from step 4 with a valid format
  useEffect(() => {
    if (active === 4 && !hasProceededFromFormatStep.current) {
      setCampaignFormData((prev) => ({
        ...prev,
        channel_mix:
          prev.channel_mix?.map((mix) => ({
            ...mix,
            social_media: mix.social_media?.map((p) => ({ ...p, format: [] })),
            display_networks: mix.display_networks?.map((p) => ({
              ...p,
              format: [],
            })),
            search_engines: mix.search_engines?.map((p) => ({
              ...p,
              format: [],
            })),
            streaming: mix.streaming?.map((p) => ({ ...p, format: [] })),
            ooh: mix.ooh?.map((p) => ({ ...p, format: [] })),
            broadcast: mix.broadcast?.map((p) => ({ ...p, format: [] })),
            messaging: mix.messaging?.map((p) => ({ ...p, format: [] })),
            print: mix.print?.map((p) => ({ ...p, format: [] })),
            e_commerce: mix.e_commerce?.map((p) => ({ ...p, format: [] })),
            in_game: mix.in_game?.map((p) => ({ ...p, format: [] })),
            mobile: mix.mobile?.map((p) => ({ ...p, format: [] })),
          })) || [],
        validatedStages: {},
      }));
      setHasFormatSelected(false);
    }
  }, [active, setCampaignFormData]);

  // Update hasFormatSelected and log state
  useEffect(() => {
    const isFormatSelected = validateFormatSelection();
    setHasFormatSelected(isFormatSelected);
  }, [active, campaignFormData]);

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
      isBuyingObjectiveError ||
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
        setIsBuyingObjectiveError(false);
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
    isBuyingObjectiveError,
    validateStep,
    campaignFormData,
  ]);

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
        const hasValidChannel = CHANNEL_TYPES.some((channel) =>
          (stageData[channel.key] || []).some(
            (platform) => platform.buy_type && platform.objective_type
          )
        );

        if (hasValidChannel) {
          return true;
        }
      }
    }
    return false;
  };

  const validateChannelSelection = () => {
    const selectedStages = campaignFormData?.funnel_stages || [];
    if (!selectedStages.length || !campaignFormData?.channel_mix) {
      return false;
    }

    return campaignFormData.channel_mix.some((mix) =>
      CHANNEL_TYPES.some((channel) => mix[channel.key]?.length > 0)
    );
  };

  // --- Custom back handler for active === 5 to persist step 4 if user had format selected and continued ---
  const handleBack = () => {
    if (active === 5 && hasProceededFromFormatStep.current) {
      setActive(4);
      return;
    }
    if (subStep > 0) {
      setSubStep((prev) => prev - 1);
    } else {
      setActive((prev) => Math.max(0, prev - 1));
      if (active === 8) setSubStep(1);
    }
  };

  useEffect(() => {
    setIsStepZeroValid(requiredFields.every(Boolean));
  }, [requiredFields, setIsStepZeroValid]);

  const handleContinue = async () => {
    if (active === 6) {
      if (midcapEditing.isEditing) {
        let errorMessage = "";
        switch (midcapEditing.step) {
          case "Your channel mix":
            errorMessage =
              "Please confirm or cancel your channel mix changes before proceeding";
            break;
          case "Your funnel stages":
            errorMessage =
              "Please confirm or cancel your funnel changes before proceeding";
            break;
          case "Your format selections":
            errorMessage =
              "Please confirm or cancel your format selection changes before proceeding";
            break;
          case "Your Adset and Audiences":
            errorMessage =
              "Please confirm or cancel your Adset and Audiences changes before proceeding";
            break;
        }
        if (errorMessage) {
          setIsEditingError(true);
          setAlert({
            variant: "error",
            message: errorMessage,
            position: "bottom-right",
          });
          setLoading(false);
          return;
        }
      }

      if (isEditingBuyingObjective) {
        setIsBuyingObjectiveError(true);
        setAlert({
          variant: "error",
          message:
            "Please confirm or cancel your buying objective changes before proceeding",
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    let hasError = false;

    if (active === 1) {
      if (
        !campaignFormData?.funnel_stages ||
        campaignFormData.funnel_stages.length === 0
      ) {
        setTriggerFunnelError(true);
        setAlert({
          variant: "error",
          message: "Please select at least one stage!",
          position: "bottom-right",
        });
        hasError = true;
      }
    }

    if (active === 2) {
      const hasChannelSelected = validateChannelSelection();

      if (!hasChannelSelected) {
        setTriggerChannelMixError(true);
        setAlert({
          variant: "error",
          message: "Please select at least one channel before proceeding!",
          position: "bottom-right",
        });
        hasError = true;
      } else {
        setTriggerChannelMixError(false);
        setAlert(null);
      }
    }

    if (active === 8) {
      if (!campaignFormData?.campaign_budget?.budget_type) {
        toast("Please select how to set your budget", {
          style: {
            background: "#FFEBEE",
            color: "#F87171",
            marginBottom: "70px",
            padding: "16px",
            borderRadius: "8px",
            width: "320px",
            border: "1px solid red",
            borderLeft: "4px solid red",
          },
        });
        setLoading(false);
        return;
      }
      if (!campaignFormData?.campaign_budget?.amount) {
        toast("Please input a budget amount", {
          style: {
            background: "#FFEBEE",
            color: "red",
            marginBottom: "70px",
            padding: "16px",
            borderRadius: "8px",
            width: "320px",
            border: "1px solid red",
            borderLeft: "4px solid red",
          },
        });
        setLoading(false);
        return;
      }
      if (subStep > 0 && !campaignFormData?.campaign_budget?.sub_budget_type) {
        setAlert({
          variant: "error",
          message: "Please select what type of budget you want",
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }
    }

    if (active === 4) {
      const isValidFormat = validateFormatSelection();
      if (!isValidFormat) {
        setTriggerFormatError(true);
        setTriggerFormatErrorCount((prev) => prev + 1);
        hasError = true;
      } else {
        setTriggerFormatError(false);
        setTriggerFormatErrorCount(0);
        hasProceededFromFormatStep.current = true;
      }
    }

    if (active === 5) {
      const isValidBuyObjective = validateBuyObjectiveSelection();
      if (!isValidBuyObjective) {
        setTriggerBuyObjectiveError(true);
        setAlert({
          variant: "error",
          message:
            "Please select and validate at least one channel with buy type and objective before proceeding!",
          position: "bottom-right",
        });
        hasError = true;
      } else {
        setTriggerBuyObjectiveError(false);
        setAlert(null);
      }
    }

    if (active === 7) {
      if (
        campaignFormData?.campaign_timeline_start_date &&
        campaignFormData?.campaign_timeline_end_date
      ) {
        setSelectedDatesError(false);
      } else {
        if (
          (!selectedDates?.to?.day || !selectedDates?.from?.day) &&
          subStep < 1
        ) {
          setSelectedDatesError(true);
          setAlert({
            variant: "error",
            message: "Choose your start and end date!",
            position: "bottom-right",
          });
          hasError = true;
        }
      }
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    const updateCampaignData = async (data) => {
      const calcPercent = Math.ceil((active / 10) * 100);
      try {
        await updateCampaign({
          ...data,
          progress_percent:
            campaignFormData?.progress_percent > calcPercent
              ? campaignFormData?.progress_percent
              : calcPercent,
        });
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

    const cleanData = campaignData
      ? removeKeysRecursively(campaignData, [
          "id",
          "documentId",
          "createdAt",
          "publishedAt",
          "updatedAt",
          "_aggregated",
        ])
      : {};

    const handleStepZero = async () => {
      setLoading(true);

      try {
        if (!isStepZeroValid) {
          setAlert({
            variant: "error",
            message: "Please complete all required fields before proceeding.",
            position: "bottom-right",
          });
          setLoading(false);
          return;
        }

        const budgetDetails = {
          currency: campaignFormData?.budget_details_currency?.id,
          fee_type: campaignFormData?.budget_details_fee_type?.id,
          sub_fee_type: selectedOption,
          value: campaignFormData?.budget_details_value,
        };

        // Handle approver and client_approver as arrays of strings
        // const internalApprovers = Array.isArray(campaignFormData?.approver)
        //   ? campaignFormData.approver.filter((a) => a !== null && a !== undefined && a !== "")
        //   : [];

        // const clientApprovers = Array.isArray(campaignFormData?.client_approver)
        //   ? campaignFormData.client_approver.filter((a) => a !== null && a !== undefined && a !== "")
        //   : [];

        // Update campaignFormData with cleaned values and save to localStorage
        const cleanedFormData = {
          ...campaignFormData,
          internal_approver: campaignFormData?.internal_approver,
          client_approver: campaignFormData?.client_approver,
          budget_details_currency: {
            id: budgetDetails.currency,
            value: budgetDetails.currency,
            label:
              selectCurrency.find((c) => c.value === budgetDetails.currency)
                ?.label || budgetDetails.currency,
          },
        };
        setCampaignFormData(cleanedFormData);
        localStorage.setItem(
          "campaignFormData",
          JSON.stringify(cleanedFormData)
        );

        if (cId && campaignData) {
          const updatedData = {
            ...removeKeysRecursively(campaignData, [
              "id",
              "documentId",
              "createdAt",
              "publishedAt",
              "updatedAt",
              "_aggregated",
            ]),
            client: campaignFormData?.client_selection?.id,
            client_selection: {
              client: campaignFormData?.client_selection?.value,
              level_1: campaignFormData?.level_1?.id,
              level_2: campaignFormData?.level_2?.id,
              level_3: campaignFormData?.level_3?.id,
            },
            media_plan_details: {
              plan_name: campaignFormData?.media_plan,
              internal_approver: campaignFormData?.internal_approver,
              client_approver: campaignFormData?.client_approver,
            },
            budget_details: budgetDetails,
          };

          await updateCampaign(updatedData);

          setActive((prev) => prev + 1);
          setAlert({
            variant: "success",
            message: "Campaign updated successfully!",
            position: "bottom-right",
          });
        } else {
          const res = await createCampaign();
          const url = new URL(window.location.href);
          url.searchParams.set("campaignId", `${res?.data?.data.documentId}`);
          window.history.pushState({}, "", url.toString());
          await getActiveCampaign(res?.data?.data.documentId);

          setActive((prev) => prev + 1);
          setAlert({
            variant: "success",
            message: "Campaign created successfully!",
            position: "bottom-right",
          });
        }
      } catch (error) {
        setAlert({
          variant: "error",
          message: "Something went wrong. Please try again.",
          position: "bottom-right",
        });
      } finally {
        setLoading(false);
      }
    };

    const handleStepTwo = async () => {
      if (!campaignData || !cId) return;
      await updateCampaignData({
        ...cleanData,
        funnel_stages: campaignFormData?.funnel_stages,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
          "isValidated",
          "formatValidated",
          "validatedStages",
          "documentId",
          "_aggregated",
        ]),
        custom_funnels: campaignFormData?.custom_funnels,
        funnel_type: campaignFormData?.funnel_type,
      });
    };

    const handleStepThree = async () => {
      if (!campaignData || !cId) return;
      await updateCampaignData({
        ...cleanData,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
          "isValidated",
          "validatedStages",
          "documentId",
          "_aggregated",
        ]),
      });
    };

    const handleStepFour = async () => {
      if (!campaignData || !cId) return;
      if (active === 5) {
        const obj = extractObjectives(campaignFormData);
        setCampaignFormData((prev) => ({
          ...prev,
          table_headers: obj || {}
        }))
      }
      await updateCampaignData({
        ...cleanData,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
          "isValidated",
          "formatValidated",
          "validatedStages",
          "documentId",
          "_aggregated",
        ]),
      });
    };

    const handleStepSeven = async () => {
      if (!campaignData) return;
      await updateCampaignData({
        ...cleanData,
        funnel_stages: campaignFormData?.funnel_stages,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
          "isValidated",
          "documentId",
          "_aggregated",
        ]),
        campaign_budget: removeKeysRecursively(
          campaignFormData?.campaign_budget,
          ["id"]
        ),
        goal_level: campaignFormData?.goal_level,
      });
    };

    const handleDateStep = async () => {
      if (!campaignData) return;
      const currentYear = new Date().getFullYear();
      const campaign_timeline_start_date =
        dayjs(
          new Date(
            currentYear,
            selectedDates?.from?.month,
            selectedDates.from?.day
          )
        ).format("YYYY-MM-DD") ||
        campaignFormData?.campaign_timeline_start_date;

      const campaign_timeline_end_date =
        dayjs(
          new Date(currentYear, selectedDates?.to?.month, selectedDates.to?.day)
        ).format("YYYY-MM-DD") || campaignFormData?.campaign_timeline_end_date;
      await updateCampaignData({
        ...cleanData,
        campaign_timeline_start_date:
          campaign_timeline_start_date === "Invalid Date"
            ? campaignFormData?.campaign_timeline_start_date
            : campaign_timeline_start_date,
        campaign_timeline_end_date:
          campaign_timeline_end_date === "Invalid Date"
            ? campaignFormData?.campaign_timeline_end_date
            : campaign_timeline_end_date,
        funnel_stages: campaignFormData?.funnel_stages,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
          "isValidated",
          "documentId",
          "_aggregated",
        ]),
        campaign_budget: removeKeysRecursively(
          campaignFormData?.campaign_budget,
          ["id"]
        ),
        goal_level: campaignFormData?.goal_level,
      });
    };

    try {
      if (active === 0) {
        await handleStepZero();
      } else if (active === 1) {
        await handleStepTwo();
      } else if (active === 2) {
        await handleStepThree();
      } else if (active === 3) {
        await handleStepThree();
      } else if (active === 8) {
        await handleStepSeven();
      } else if (active === 6) {
        await handleStepSeven();
      } else if (active === 7) {
        await handleDateStep();
      } else if (active > 3 && subStep < 2) {
        await handleStepFour();
      }

      if (active === 7) {
        if (subStep < 1) {
          setSubStep((prev) => prev + 1);
        } else {
          setActive((prev) => prev + 1);
          setSubStep(0);
        }
      } else if (active !== 0) {
        setActive((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error in handleContinue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setActive((prev) => Math.min(9, prev + 1));
  };

  return (
    <footer id="footer" className="w-full">
      <Toaster position="bottom-right" />
      {alert && <AlertMain alert={alert} />}
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
            message: "Please select at least one stage!",
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
            message: "Please select at least one channel before proceeding!",
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
          isFinancialApprover || isAgencyApprover || isAdmin ? (
            <button
              className="bottom_black_next_btn hover:bg-blue-500"
              onClick={() =>
                campaignFormData?.isApprove
                  ? toast.error("This Plan has already been approved!")
                  : setIsOpen(true)
              }
            >
              <p>Confirm</p>
              <Image src={Continue} alt="Continue" />
            </button>
          ) : (
            <button
              className="bottom_black_next_btn hover:bg-blue-500"
              onClick={() => toast.error("Role doesn't have permission!")}
            >
              <p>Confirm</p>
              <Image src={Continue} alt="Continue" />
            </button>
          )
        ) : (
          <div className="flex justify-center items-center gap-3">
            <button
              className={clsx(
                "bottom_black_next_btn whitespace-nowrap",
                active === 10 && "opacity-50 cursor-not-allowed",
                active < 10 && "hover:bg-blue-500"
              )}
              onClick={
                active === 4 && !hasFormatSelected ? handleSkip : handleContinue
              }
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
                      : active === 4 && !hasFormatSelected
                      ? "Skip"
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
