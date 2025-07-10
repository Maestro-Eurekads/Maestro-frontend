"use client"
import Image from "next/image"
import clsx from "clsx"
import Continue from "../public/arrow-back-outline.svg"
import Back from "../public/eva_arrow-back-outline.svg"
import { useActive } from "../app/utils/ActiveContext"
import AlertMain from "../components/Alert/AlertMain"
import { useState, useEffect, useRef } from "react"
import { useCampaigns } from "../app/utils/CampaignsContext"
import { BiLoader } from "react-icons/bi"
import { removeKeysRecursively } from "../utils/removeID"
import { useSelectedDates } from "../app/utils/SelectedDatesContext"
import { useEditing } from "app/utils/EditingContext"
import toast, { Toaster } from "react-hot-toast"
import { useUserPrivileges } from "utils/userPrivileges"
import {
  extractObjectives,
  getFilteredMetrics,
} from "app/creation/components/EstablishedGoals/table-view/data-processor"
import axios from "axios"
import { updateUsersWithCampaign } from "app/homepage/functions/clients"
import SaveProgressButton from "app/utils/SaveProgressButton";

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void
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
]

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { active, setActive, subStep, setSubStep } = useActive()
  const { midcapEditing } = useEditing()
  const [triggerObjectiveError, setTriggerObjectiveError] = useState(false)
  const [setupyournewcampaignError, setSetupyournewcampaignError] = useState(false)
  const [triggerFunnelError, setTriggerFunnelError] = useState(false)
  const [selectedDatesError, setSelectedDatesError] = useState(false)
  const [incompleteFieldsError, setIncompleteFieldsError] = useState(false)
  const [triggerFormatError, setTriggerFormatError] = useState(false)
  const [triggerFormatErrorCount, setTriggerFormatErrorCount] = useState(0)
  const [validateStep, setValidateStep] = useState(false)
  const { selectedDates } = useSelectedDates()
  const [triggerChannelMixError, setTriggerChannelMixError] = useState(false)
  const [triggerBuyObjectiveError, setTriggerBuyObjectiveError] = useState(false)
  const [isBuyingObjectiveError, setIsBuyingObjectiveError] = useState(false)
  const [isEditingError, setIsEditingError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [hasFormatSelected, setHasFormatSelected] = useState(false)
  const { isFinancialApprover, isAgencyApprover, isAdmin, loggedInUser } = useUserPrivileges()

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
    jwt,
    agencyId,
  } = useCampaigns()

  // --- Persist format selection for active === 4 ---
  const hasProceededFromFormatStep = useRef(false)
  const hasInitializedStep4 = useRef(false)

  // Helper function to check if format has previews
  const formatHasPreviews = (format) => {
    return format && format.previews && format.previews.length > 0
  }

  // Helper function to preserve formats with previews
  const preserveFormatsWithPreviews = (platforms) => {
    if (!platforms) return []

    return platforms.map((platform) => {
      if (!platform.format) return { ...platform, format: [] }

      // Keep formats that have previews, remove others
      const formatsWithPreviews = platform.format.filter(formatHasPreviews)

      return { ...platform, format: formatsWithPreviews }
    })
  }

  const validateFormatSelection = () => {
    const selectedStages = campaignFormData?.funnel_stages || []
    const validatedStages = campaignFormData?.validatedStages || {}
    let hasValidFormat = false

    for (const stage of selectedStages) {
      const stageData = campaignFormData?.channel_mix?.find((mix) => mix?.funnel_stage === stage)
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
            (platform.format?.length > 0 && platform.format.some((f) => f.format_type && f.num_of_visuals)) ||
            platform.ad_sets?.some((adset) => adset.format?.some((f) => f.format_type && f.num_of_visuals)),
        )

        const isStageValidated = validatedStages[stage]
        if (hasFormatSelected || isStageValidated) {
          hasValidFormat = true
          break
        }
      }
    }

    return hasValidFormat
  }

  // Modified useEffect to preserve formats with previews
  useEffect(() => {
    if (active === 4 && !hasProceededFromFormatStep.current && !hasInitializedStep4.current) {
      hasInitializedStep4.current = true

      setCampaignFormData((prevFormData) => ({
        ...prevFormData,
        channel_mix:
          prevFormData.channel_mix?.map((mix) => ({
            ...mix,
            social_media: preserveFormatsWithPreviews(mix.social_media),
            display_networks: preserveFormatsWithPreviews(mix.display_networks),
            search_engines: preserveFormatsWithPreviews(mix.search_engines),
            streaming: preserveFormatsWithPreviews(mix.streaming),
            ooh: preserveFormatsWithPreviews(mix.ooh),
            broadcast: preserveFormatsWithPreviews(mix.broadcast),
            messaging: preserveFormatsWithPreviews(mix.messaging),
            print: preserveFormatsWithPreviews(mix.print),
            e_commerce: preserveFormatsWithPreviews(mix.e_commerce),
            in_game: preserveFormatsWithPreviews(mix.in_game),
            mobile: preserveFormatsWithPreviews(mix.mobile),
          })) || [],
        validatedStages: {},
      }))

      // Check if there are any formats with previews
      const hasExistingPreviews = campaignFormData.channel_mix?.some((mix) =>
        CHANNEL_TYPES.some(({ key }) => mix[key]?.some((platform) => platform.format?.some(formatHasPreviews))),
      )

      setHasFormatSelected(hasExistingPreviews)
    }
  }, [active, setCampaignFormData])

  // Reset initialization flag when leaving step 4
  useEffect(() => {
    if (active !== 4) {
      hasInitializedStep4.current = false
    }
  }, [active])

  // Update hasFormatSelected and log state
  useEffect(() => {
    const isFormatSelected = validateFormatSelection()
    setHasFormatSelected(isFormatSelected)
  }, [active, campaignFormData])

  useEffect(() => {
    if (typeof window !== "undefined" && cId) {
      const storedValue = localStorage.getItem(`triggerFormatError_${cId}`)
      setTriggerFormatError(storedValue === "true")
    }
  }, [cId])

  useEffect(() => {
    if (typeof window !== "undefined" && cId) {
      localStorage.setItem(`triggerFormatError_${cId}`, triggerFormatError.toString())
    }
  }, [triggerFormatError, cId])

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
        setTriggerObjectiveError(false)
        setTriggerFunnelError(false)
        setSelectedDatesError(false)
        setSetupyournewcampaignError(false)
        setTriggerChannelMixError(false)
        setIncompleteFieldsError(false)
        setTriggerBuyObjectiveError(false)
        setIsBuyingObjectiveError(false)
        setValidateStep(false)
        setAlert(null)
      }, 3000)
      return () => clearTimeout(timer)
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
  ])

  const validateBuyObjectiveSelection = () => {
    const selectedStages = campaignFormData?.funnel_stages || []
    const validatedStages = campaignFormData?.validatedStages || {}
    if (!selectedStages.length || !campaignFormData?.channel_mix) {
      return false
    }

    for (const stage of selectedStages) {
      const stageData = campaignFormData.channel_mix.find((mix) => mix.funnel_stage === stage)
      if (stageData && validatedStages[stage]) {
        const hasValidChannel = CHANNEL_TYPES.some((channel) =>
          (stageData[channel.key] || []).some((platform) => platform.buy_type && platform.objective_type),
        )
        if (hasValidChannel) {
          return true
        }
      }
    }
    return false
  }

  const validateChannelSelection = () => {
    const selectedStages = campaignFormData?.funnel_stages || []
    if (!selectedStages.length || !campaignFormData?.channel_mix) {
      return false
    }

    return campaignFormData.channel_mix.some((mix) => CHANNEL_TYPES.some((channel) => mix[channel.key]?.length > 0))
  }

  // --- Custom back handler for active === 5 to persist step 4 if user had format selected and continued ---
  const handleBack = () => {
    if (active === 5 && hasProceededFromFormatStep.current) {
      setActive(4)
      return
    }
    if (active === 7) {
      if (subStep > 0) {
        setSubStep((prev) => prev - 1)
      } else {
        setActive(5)
      }
    } else {
      if (subStep > 0) {
        setSubStep((prev) => prev - 1)
      } else {
        setActive((prev) => Math.max(0, prev - 1))
        if (active === 8) setSubStep(1)
      }
    }
  }

  useEffect(() => {
    setIsStepZeroValid(requiredFields.every(Boolean))
  }, [requiredFields, setIsStepZeroValid])

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
   // Check if budget type is selected
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

   // Check if budget amount is provided
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

   // For top-down approach, check if sub_budget_type is selected when in substep
   if (
    campaignFormData?.campaign_budget?.budget_type === "top_down" &&
    subStep > 0 &&
    !campaignFormData?.campaign_budget?.sub_budget_type
   ) {
    toast("Please select what type of budget you want", {
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

   // Check if granularity level is selected
   if (!campaignFormData?.campaign_budget?.level) {
    toast(
     "Please select a granularity level (Channel level or Adset level)",
     {
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
     }
    );
    setLoading(false);
    return;
   }

   // For top-down with fees, validate fee configuration
   // --- CHANGED: Fee is NOT compulsory, so skip this validation ---
   // if (
   //   campaignFormData?.campaign_budget?.budget_type === "top_down" &&
   //   campaignFormData?.campaign_budget?.sub_budget_type &&
   //   !campaignFormData?.campaign_budget?.budget_fees?.length
   // ) {
   //   toast("Please validate your fee configuration before proceeding", {
   //     style: {
   //       background: "#FFEBEE",
   //       color: "red",
   //       marginBottom: "70px",
   //       padding: "16px",
   //       borderRadius: "8px",
   //       width: "320px",
   //       border: "1px solid red",
   //       borderLeft: "4px solid red",
   //     },
   //   })
   //   setLoading(false)
   //   return
   // }
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
   // const isValidBuyObjective = validateBuyObjectiveSelection()
   // if (!isValidBuyObjective) {
   //   setTriggerBuyObjectiveError(true)
   //   setAlert({
   //     variant: "error",
   //     message: "Please select and validate at least one channel with buy type and objective before proceeding!",
   //     position: "bottom-right",
   //   })
   //   hasError = true
   // } else {
   //   setTriggerBuyObjectiveError(false)
   //   setAlert(null)
   // }
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
    if (error?.response?.status === 401) {
     const event = new Event("unauthorizedEvent");
     window.dispatchEvent(event);
    }

    setAlert({
     variant: "error",
     message: "Failed to update campaign data",
     position: "bottom-right",
    });
    throw error;
   }
  };




  const handleStepZero = async () => {
   setLoading(true);

   try {
    let hasError = false;

    // Validation function
    const getFieldValue = (field: any): boolean => {
     if (Array.isArray(field)) return field.length > 0;
     if (typeof field === "object" && field !== null)
      return Object.keys(field).length > 0;
     return Boolean(field);
    };

    // Error collector
    const errors: string[] = [];

    // Check each field, and if invalid, set flag and trigger alert
    if (!getFieldValue(campaignFormData?.media_plan)) {
     errors.push("Media plan name is required.");
     hasError = true;
    }

    if (!getFieldValue(campaignFormData?.budget_details_currency?.id)) {
     errors.push("Currency is required.");
     hasError = true;
    }

    if (!isStepZeroValid) {
     errors.push("Please complete all required fields before proceeding.");
     hasError = true;
    }

    if (hasError) {
     setAlert({
      variant: "error",
      message: errors.join(" "),
      position: "bottom-right",
     });
     setValidateStep(true);
     setLoading(false);
     return;
    }

    // Clean and store form
    const cleanedFormData = {
     ...campaignFormData,
     internal_approver: (campaignFormData?.internal_approver || []),
     client_approver: (campaignFormData?.client_approver || []),
    };


    setCampaignFormData(cleanedFormData);
    localStorage.setItem("campaignFormData", JSON.stringify(cleanedFormData));

    const payload = {
     data: {
      campaign_builder: loggedInUser?.id,
      client: campaignFormData?.client_selection?.id,
      client_selection: {
       client: campaignFormData?.client_selection?.value,
       level_1: campaignFormData?.level_1,
      },
      media_plan_details: {
       plan_name: campaignFormData?.media_plan,
       internal_approver: (campaignFormData?.internal_approver || []).map((item: any) => Number(item.id)),
       client_approver: (campaignFormData?.client_approver || []).map((item: any) => Number(item.id)),
      },
      budget_details: {
       currency: campaignFormData?.budget_details_currency?.id || "EUR",
       value: campaignFormData?.country_details?.id,
      },
      campaign_budget: {
       currency: campaignFormData?.budget_details_currency?.id || "EUR",
      },
      agency_profile: agencyId,
     },
    };

    const config = {
     headers: {
      Authorization: `Bearer ${jwt}`,
     },
    };

    // Update or Create
    if (cId && campaignData) {
     await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`, payload, config);
     setActive((prev) => prev + 1);
     setAlert({ variant: "success", message: "Campaign updated successfully!", position: "bottom-right" });
    } else {
     const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`, payload, config);

     const url = new URL(window.location.href);
     url.searchParams.set("campaignId", `${response?.data?.data.documentId}`);
     window.history.pushState({}, "", url.toString());

     await updateUsersWithCampaign(
      [
       ...(Array.isArray(loggedInUser?.id) ? loggedInUser?.id : [loggedInUser?.id]),
       ...(campaignFormData?.internal_approver || []).map((item: any) => String(item.id)),
       ...(campaignFormData?.client_approver || []).map((item: any) => Number(item.id)),
      ],
      response?.data?.data?.id,
      jwt
     );

     await getActiveCampaign(response?.data?.data.documentId);
     setActive((prev) => prev + 1);
     setAlert({ variant: "success", message: "Campaign created successfully!", position: "bottom-right" });
    }
   } catch (error) {
    if (error?.response?.status === 401) {
     const event = new Event("unauthorizedEvent");
     window.dispatchEvent(event);
    }
    setAlert({
     variant: "error",
     message: error.response?.data?.message || "Something went wrong. Please try again.",
     position: "bottom-right",
    });
    if (error?.response?.status === 401) {
     const event = new Event("unauthorizedEvent");
     window.dispatchEvent(event);
    }

   } finally {
    setLoading(false);
   }
  };


  const handleStepTwo = async () => {
   if (!campaignData || !cId) return;
   await updateCampaignData({
    // ...cleanData,
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
    // ...cleanData,
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
   let updatedCampaignFormData = campaignFormData;

   if (active === 5) {
    const obj = await extractObjectives(campaignFormData);
    const sMetrics = await getFilteredMetrics(obj);
    updatedCampaignFormData = {
     ...campaignFormData,
     table_headers: obj || {},
     selected_metrics: sMetrics || {},
    };
    setCampaignFormData(updatedCampaignFormData);
   }

   await updateCampaignData({
    channel_mix: removeKeysRecursively(
     updatedCampaignFormData?.channel_mix,
     [
      "id",
      "isValidated",
      "formatValidated",
      "validatedStages",
      "documentId",
      "_aggregated",
     ]
    ),
    table_headers: updatedCampaignFormData?.table_headers,
    selected_metrics: updatedCampaignFormData?.selected_metrics,
   });
  };

  const handleStepSeven = async () => {
   if (!campaignData) return;
   let updatedCampaignFormData = campaignFormData;

   const obj = extractObjectives(campaignFormData);
   updatedCampaignFormData = {
    ...campaignFormData,
    table_headers: obj || {},
   };
   setCampaignFormData(updatedCampaignFormData);

   await updateCampaignData({
    funnel_stages: updatedCampaignFormData?.funnel_stages,
    channel_mix: removeKeysRecursively(
     updatedCampaignFormData?.channel_mix,
     ["id", "isValidated", "documentId", "_aggregated"]
    ),
    campaign_budget: removeKeysRecursively(
     updatedCampaignFormData?.campaign_budget,
     ["id"]
    ),
    goal_level: updatedCampaignFormData?.goal_level,
    table_headers: updatedCampaignFormData?.table_headers,
   });
  };

  const handleDateStep = async () => {
   if (!campaignData) return;
   const currentYear = new Date().getFullYear();
   // const campaign_timeline_start_date =
   //   dayjs(
   //     new Date(
   //       currentYear,
   //       selectedDates?.from?.month,
   //       selectedDates.from?.day
   //     )
   //   ).format("YYYY-MM-DD") ||
   //   campaignFormData?.campaign_timeline_start_date;

   // const campaign_timeline_end_date =
   //   dayjs(
   //     new Date(currentYear, selectedDates?.to?.month, selectedDates.to?.day)
   //   ).format("YYYY-MM-DD") || campaignFormData?.campaign_timeline_end_date;
   await updateCampaignData({
    campaign_timeline_start_date:
     campaignFormData?.campaign_timeline_start_date,
    campaign_timeline_end_date: campaignFormData?.campaign_timeline_end_date,
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
   } else if (active === 5) {
    setActive(7)
   } else if (active !== 0) {
    setActive((prev) => prev + 1);
   }
  } catch (error) {
   if (error?.response?.status === 401) {
    const event = new Event("unauthorizedEvent");
    window.dispatchEvent(event);
   }

  } finally {
   setLoading(false);
  }
 };

  const handleSkip = () => {
    setActive((prev) => Math.min(9, prev + 1))
  }

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
     (isFinancialApprover || isAgencyApprover || isAdmin) ? (
      (() => {
       const internalApproverEmails = campaignFormData?.internal_approver?.map(
        (approver) => approver?.email
       ) || [];

       if (!isAdmin && !internalApproverEmails.includes(loggedInUser.email)) {
        return (
         <button
          className="bottom_black_next_btn hover:bg-blue-500"
          onClick={() =>
           toast.error("Not authorized to approve this plan.")
          }
         >
          <p>Confirm</p>
          <Image src={Continue} alt="Continue" />
         </button>
        );
       }

       return (
        <button
         className="bottom_black_next_btn hover:bg-blue-500"
         onClick={() => setIsOpen(true)}
        >
         <p>Confirm</p>
         <Image src={Continue} alt="Continue" />
        </button>
        // <button
        //  className="bottom_black_next_btn hover:bg-blue-500"
        //  onClick={() =>
        //   campaignFormData?.isApprove
        //    ? toast.error("This plan has already been approved!")
        //    : setIsOpen(true)
        //  }
        // >
        //  <p>Confirm</p>
        //  <Image src={Continue} alt="Continue" />
        // </button>
       );
      })()
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
        active < 10 && "hover:bg-blue-500",
        active === 4 && !hasFormatSelected && "px-3 py-2" // Add padding for longer text
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
         <p
          style={
           active === 4 && !hasFormatSelected
            ? {
             fontSize: "14px",
             whiteSpace: "normal",
             lineHeight: "16px",
             textAlign: "center",
             maxWidth: 120,
            }
            : {}
          }
         >
          {active === 0
           ? "Start"
           : active === 4 && !hasFormatSelected
            ? "Not mandatory step, skip"
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

export default Bottom
