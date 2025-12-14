"use client"
import Image from "next/image"
import clsx from "clsx"
import Continue from "../../public/arrow-back-outline.svg"
import left_arrow from "../../public/blue_back_arrow.svg";

import { useState, useEffect, useRef, useMemo } from "react"
import { BiLoader } from "react-icons/bi"
import { useEditing } from "app/utils/EditingContext"
import toast, { Toaster } from "react-hot-toast"
import { useUserPrivileges } from "utils/userPrivileges"
import {
	extractObjectives,
	getFilteredMetrics,
} from "app/creation/components/EstablishedGoals/table-view/data-processor"
import axios from "axios"
import { updateUsersWithCampaign } from "app/homepage/functions/clients"
import { useSelectedDates } from "./SelectedDatesContext"
import { removeKeysRecursively } from "utils/removeID"
import AlertMain from "components/Alert/AlertMain"
import { useCampaigns } from "./CampaignsContext"
import { useActive } from "app/utils/ActiveContext"
import { areObjectsSimilar } from "./similarityCheck"
import { useRouter } from "next/navigation"

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

// FIXED: Add function to clear channel state when starting new campaign
const clearChannelStateForNewCampaign = () => {
	if (typeof window === "undefined") return
	try {
		// Clear all channel state keys from sessionStorage
		const keysToRemove = []
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i)
			if (key && key.startsWith("channelLevelAudienceState_")) {
				keysToRemove.push(key)
			}
		}
		keysToRemove.forEach((key) => sessionStorage.removeItem(key))
		// Clear global state
		if ((window as any).channelLevelAudienceState) {
			Object.keys((window as any).channelLevelAudienceState).forEach((stageName) => {
				delete (window as any).channelLevelAudienceState[stageName]
			})
		}
		console.log("Cleared all channel state for new campaign")
	} catch (error) {
		console.error("Error clearing channel state:", error)
	}
}

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

const SaveProgressButton = ({ isBackToDashboardButton }: { isBackToDashboardButton?: boolean }) => {

	const { active, setActive, subStep, setSubStep, setChange, change } = useActive()
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
	const [showSave, setShowSave] = useState(false)
	const { isFinancialApprover, isAgencyApprover, isAdmin, loggedInUser } = useUserPrivileges()
	const router = useRouter();

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
		loadingCampaign,
		agencyId,
		kpiChanged, setKpiChanged
	} = useCampaigns()

	const isInternalApprover = isAdmin || isAgencyApprover || isFinancialApprover

	const hasChanges = useMemo(() => {
		if (!campaignData || !campaignFormData) return false;
		return kpiChanged || !areObjectsSimilar(campaignFormData, campaignData, ['objective_level']);
	}, [campaignFormData, campaignData]);

	// --- Persist format selection for active === 4 ---
	const hasProceededFromFormatStep = useRef(false)
	const hasInitializedStep4 = useRef(false)

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

	const cancelSave = () => {
		if (isBackToDashboardButton) {
			router.push(`/`)
		}
		setShowSave(false)
	}

	const handleContinue = () => {
		setShowSave(true)
	}

	const handleBackToDashboard = () => {
		if (hasChanges || kpiChanged) {
			setShowSave(true)
		} else {
			router.push(`/`)
		}
	}

	// Creates a new campaign if cId is not present, otherwise updates existing campaign
	const handleSavingConfirmation = async () => {
		if (cId) {
			await handleSave();
			setKpiChanged(false)
		} else {
			setLoading(true);
			const response = await createCampaign(campaignFormData);
			setLoading(false);
			setShowSave(false);
			setActive(1)
			router.push(`/creation?campaignId=${response?.data?.data?.documentId}`);
		}
		if (isBackToDashboardButton) {
			router.push(`/`)
		}
	}

	const handleSave = async () => {

		if (active === 6) {
			if (midcapEditing.isEditing) {
				let errorMessage = ""
				switch (midcapEditing.step) {
					case "Your channel mix":
						errorMessage = "Please confirm or cancel your channel mix changes before proceeding"
						break
					case "Your funnel stages":
						errorMessage = "Please confirm or cancel your funnel changes before proceeding"
						break
					case "Your format selections":
						errorMessage = "Please confirm or cancel your format selection changes before proceeding"
						break
					case "Your Adset and Audiences":
						errorMessage = "Please confirm or cancel your Adset and Audiences changes before proceeding"
						break
				}

				if (errorMessage) {
					setIsEditingError(true)
					setAlert({
						variant: "error",
						message: errorMessage,
						position: "bottom-right",
					})
					setLoading(false)
					return
				}
			}

			if (isEditingBuyingObjective) {
				setIsBuyingObjectiveError(true)
				setAlert({
					variant: "error",
					message: "Please confirm or cancel your buying objective changes before proceeding",
					position: "bottom-right",
				})
				setLoading(false)
				return
			}
		}

		setLoading(true)
		let hasError = false

		if (active === 1) {
			if (!campaignFormData?.funnel_stages || campaignFormData.funnel_stages.length === 0) {
				setTriggerFunnelError(true)
				setAlert({
					variant: "error",
					message: "Please select at least one stage!",
					position: "bottom-right",
				})
				hasError = true
			}
		}

		if (active === 2) {
			const hasChannelSelected = validateChannelSelection()
			if (!hasChannelSelected) {
				setTriggerChannelMixError(true)
				setAlert({
					variant: "error",
					message: "Please select at least one channel before proceeding!",
					position: "bottom-right",
				})
				hasError = true
			} else {
				setTriggerChannelMixError(false)
				setAlert(null)
			}
		}

		// FIXED: Clear channel state when moving to step 3 (Adset and Audiences step)
		if (active === 3) {
			clearChannelStateForNewCampaign()
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
				})
				setLoading(false)
				return
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
				})
				setLoading(false)
				return
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
				})
				setLoading(false)
				return
			}

			// Check if granularity level is selected
			if (!campaignFormData?.campaign_budget?.level) {
				toast("Please select a granularity level (Channel level or Adset level)", {
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
				})
				setLoading(false)
				return
			}
		}

		if (active === 4) {
			const isValidFormat = validateFormatSelection()
			if (!isValidFormat) {
				setTriggerFormatError(true)
				setTriggerFormatErrorCount((prev) => prev + 1)
				hasError = true
			} else {
				setTriggerFormatError(false)
				setTriggerFormatErrorCount(0)
				hasProceededFromFormatStep.current = true
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
			if (campaignFormData?.campaign_timeline_start_date && campaignFormData?.campaign_timeline_end_date) {
				setSelectedDatesError(false)
			} else {
				if ((!selectedDates?.to?.day || !selectedDates?.from?.day) && subStep < 1) {
					setSelectedDatesError(true)
					setAlert({
						variant: "error",
						message: "Choose your start and end date!",
						position: "bottom-right",
					})
					hasError = true
				}
			}
		}

		if (hasError) {
			setLoading(false)
			return
		}

		const updateCampaignData = async (data) => {
			const calcPercent = Math.ceil((active / 10) * 100)
			try {
				await updateCampaign({
					...data,
					selected_preset_idx: campaignFormData?.selected_preset_idx ?? null,
					goal_level: campaignFormData?.goal_level ?? null,
					progress_percent:
						campaignFormData?.progress_percent > calcPercent ? campaignFormData?.progress_percent : calcPercent,
				})
				await getActiveCampaign(data)
			} catch (error) {
				if (error?.response?.status === 401) {
					const event = new Event("unauthorizedEvent")
					window.dispatchEvent(event)
				}
				setAlert({
					variant: "error",
					message: "Failed to update campaign data",
					position: "bottom-right",
				})
				throw error
			}
		}

		const handleStepZero = async () => {
			setLoading(true)
			try {
				// Clean and store form
				const cleanedFormData = {
					...campaignFormData,
					internal_approver: campaignFormData?.internal_approver || [],
					client_approver: campaignFormData?.client_approver || [],
				}

				setCampaignFormData(cleanedFormData)
				localStorage.setItem("campaignFormData", JSON.stringify(cleanedFormData))
				const payload = {
					data: {
						campaign_builder: loggedInUser?.id,
						// client: campaignFormData?.client_selection?.id,
						client_selection: {
							client: campaignFormData?.client_selection?.value,
							level_1: campaignFormData?.client_selection?.level_1,
						},
						campaign_budget: {
							currency: campaignFormData?.campaign_budget?.currency || campaignFormData?.budget_details?.currency || "EUR",
						},
						media_plan_details: {
							plan_name: campaignFormData?.media_plan_details?.plan_name,
							internal_approver: (campaignFormData?.media_plan_details?.internal_approver || []).map((item: any) => Number(item.id)),
							client_approver: (campaignFormData?.media_plan_details?.client_approver || []).map((item: any) => Number(item.id)),
						},
						budget_details: {
							currency: campaignFormData?.campaign_budget?.currency || campaignFormData?.budget_details?.currency || "EUR",
							value: campaignFormData?.country_details?.value || campaignFormData?.budget_details?.value,
						},
						agency_profile: agencyId,
					},
				}

				const config = {
					headers: {
						Authorization: `Bearer ${jwt}`,
					},
				}

				// Update or Create
				if (cId && campaignData) {
					await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`, payload, config)
					setChange(false)
					setAlert({ variant: "success", message: "Campaign updated successfully!", position: "bottom-right" })
				} else {
					const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`, payload, config)
					const url = new URL(window.location.href)
					url.searchParams.set("campaignId", `${response?.data?.data.documentId}`)
					window.history.pushState({}, "", url.toString())
					await updateUsersWithCampaign(
						[
							...(Array.isArray(loggedInUser?.id) ? loggedInUser?.id : [loggedInUser?.id]),
							...(campaignFormData?.internal_approver || []).map((item: any) => String(item.id)),
							...(campaignFormData?.client_approver || []).map((item: any) => Number(item.id)),
						],
						response?.data?.data?.id,
						jwt,
					)
					await getActiveCampaign(response?.data?.data.documentId)
					setChange(false)
					setAlert({ variant: "success", message: "Campaign created successfully!", position: "bottom-right" })
					// FIXED: Clear channel state when creating a new campaign
					clearChannelStateForNewCampaign()
				}
			} catch (error) {
				if (error?.response?.status === 401) {
					const event = new Event("unauthorizedEvent")
					window.dispatchEvent(event)
				}
				setAlert({
					variant: "error",
					message: error.response?.data?.message || "Something went wrong. Please try again.",
					position: "bottom-right",
				})
				if (error?.response?.status === 401) {
					const event = new Event("unauthorizedEvent")
					window.dispatchEvent(event)
				}
			} finally {
				setLoading(false)
			}
		}

		const handleStepTwo = async () => {
			if (!campaignData || !cId) return
			await updateCampaignData({
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
			})
		}

		const handleStepThree = async () => {
			if (!campaignData || !cId) return
			await updateCampaignData({
				channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
					"id",
					"isValidated",
					"validatedStages",
					"documentId",
					"_aggregated",
				]),
			})
		}

		const handleStepFour = async () => {
			if (!campaignData || !cId) return
			let updatedCampaignFormData = campaignFormData

			if (active === 5) {
				const obj = await extractObjectives(campaignFormData)
				const sMetrics = await getFilteredMetrics(obj)
				updatedCampaignFormData = {
					...campaignFormData,
					table_headers: obj || {},
					selected_metrics: sMetrics || {},
				}
				setCampaignFormData(updatedCampaignFormData)
			}

			await updateCampaignData({
				channel_mix: removeKeysRecursively(updatedCampaignFormData?.channel_mix, [
					"id",
					"isValidated",
					"formatValidated",
					"validatedStages",
					"documentId",
					"_aggregated",
				]),
				goal_level: updatedCampaignFormData?.goal_level,
				table_headers: updatedCampaignFormData?.table_headers,
				selected_metrics: updatedCampaignFormData?.selected_metrics,
			})
		}

		const handleStepSeven = async () => {
			if (!campaignData) return
			let updatedCampaignFormData = campaignFormData
			const obj = extractObjectives(campaignFormData)
			updatedCampaignFormData = {
				...campaignFormData,
				table_headers: obj || {},
			}
			setCampaignFormData(updatedCampaignFormData)

			await updateCampaignData({
				funnel_stages: updatedCampaignFormData?.funnel_stages,
				channel_mix: removeKeysRecursively(updatedCampaignFormData?.channel_mix, [
					"id",
					"isValidated",
					"documentId",
					"_aggregated",
				]),
				campaign_budget: removeKeysRecursively(updatedCampaignFormData?.campaign_budget, ["id"]),
				goal_level: updatedCampaignFormData?.goal_level,
				table_headers: updatedCampaignFormData?.table_headers,
			})
		}

		const handleDateStep = async () => {
			if (!campaignData) return

			await updateCampaignData({
				campaign_timeline_start_date: campaignFormData?.campaign_timeline_start_date,
				campaign_timeline_end_date: campaignFormData?.campaign_timeline_end_date,
				funnel_stages: campaignFormData?.funnel_stages,
				channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
					"id",
					"isValidated",
					"documentId",
					"_aggregated",
				]),
				campaign_budget: removeKeysRecursively(campaignFormData?.campaign_budget, ["id"]),
				goal_level: campaignFormData?.goal_level,
			})
		}

		try {
			if (active === 0) {
				await handleStepZero()
			} else if (active === 1) {
				await handleStepTwo()
			} else if (active === 2) {
				await handleStepThree()
			} else if (active === 3) {
				await handleStepThree()
			} else if (active === 8) {
				await handleStepSeven()
			} else if (active === 6) {
				await handleStepSeven()
			} else if (active === 7) {
				await handleDateStep()
			} else if (active > 3 && subStep < 2) {
				await handleStepFour()
			}

			if (active === 7) {
				if (subStep < 1) {
					setSubStep((prev) => prev + 1)
				} else {
					setActive((prev) => prev + 1)
					setSubStep(0)
				}
			} else if (active === 5) {
				setActive(7)
			} else if (active !== 0) {
				setActive((prev) => prev + 1)
			}
		} catch (error) {
			if (error?.response?.status === 401) {
				const event = new Event("unauthorizedEvent")
				window.dispatchEvent(event)
			}
			setShowSave(false)
		} finally {
			setLoading(false)
			setShowSave(false)
		}
	}

	const handleSkip = () => {
		setActive((prev) => Math.min(9, prev + 1))
	}

	const showError = (msg: string) => toast.error(msg, { position: "bottom-right" })

	const internalApproverEmails = campaignFormData?.internal_approver?.map((a) => a?.email) || []

	const showConfirm =
		active === 10 && (isInternalApprover ? isAdmin || internalApproverEmails.includes(loggedInUser.email) : false)

	const isButtonDisabled = useMemo(() => {
		// Always disable if campaign is loading
		if (loadingCampaign) return true;

		// If there's a cId (existing campaign), disable if no changes
		if (cId) return !kpiChanged && !hasChanges;

		// If no cId (new campaign), always enable
		return false;
	}, [loadingCampaign, cId, hasChanges, kpiChanged]);

	if (isBackToDashboardButton) {
		return (
			<>
				<button
					onClick={handleBackToDashboard}
					className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF] flex items-center gap-2"
				>
					<Image src={left_arrow} alt="menu" />
					<p>Back to Dashboard</p>
				</button>

				{showSave && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<div className="bg-white rounded-xl shadow-lg w-[400px] p-6 text-center">
							<h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Save</h2>
							<p className="text-gray-700 mb-6">
								{cId ? "Do you want to save this step progress?" : "Do you want to save your latest progress before leaving?"}
							</p>
							<div className="flex justify-center gap-4">
								<button
									className="border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-100"
									onClick={cancelSave}
								>
									Cancel
								</button>
								<button
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
									onClick={handleSavingConfirmation}
								>
									{loading ? (
										<center>
											<BiLoader className="animate-spin" size={20} />
										</center>
									) : (
										"Save"
									)}
								</button>
							</div>
						</div>
					</div>
				)}
			</>
		)
	}

	return (
		<div >
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
						message: "Please select and validate at least one channel with buy type and objective!",
						position: "bottom-right",
					}}
				/>
			)}

			<div  >

				{/* Confirmation Button on Step 10 */}
				{/* {active === 10 ? (
					isInternalApprover ? (
						showConfirm ? (
							<button
								className="bottom_black_next_btn hover:bg-blue-500"
								onClick={() => setIsOpen(true)}
							>
								<p>Confirm</p>
								<Image src={Continue} alt="Continue" />
							</button>
						) : (
							<button
								className="bottom_black_next_btn hover:bg-blue-500"
								onClick={() => showError("Not authorized to approve this plan.")}
							>
								<p>Confirm</p>
								<Image src={Continue} alt="Continue" />
							</button>
						)
					) : (
						<button
							className="bottom_blue_save_btn hover:bg-blue-500"
							onClick={() => showError("Role doesn't have permission!")}
						>
							<p>Confirm</p>
							<Image src={Continue} alt="Continue" />
						</button>
					)
					
				) : (  */}
				{(active === 10) ? "" :
					<div className="flex justify-center items-center gap-3">
						<button
							className={clsx(
								"bottom_blue_save_btn whitespace-nowrap",
								isButtonDisabled && "bg-gray-400 cursor-not-allowed",
								hasChanges && "hover:bg-blue-500",
								active === 4 && !hasFormatSelected && "px-3 py-2"
							)}
							onClick={
								active === 4 && !hasFormatSelected ? handleSkip : handleContinue
							}
							disabled={isButtonDisabled}
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
						>
							{cId ? "Save" : "Create"}
						</button>

					</div>}
			</div>
			{showSave && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-xl shadow-lg w-[400px] p-6 text-center">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Save</h2>
						<p className="text-gray-700 mb-6">
							{cId ? "Do you want to save this step progress?" : "Do you want to save your latest progress before leaving?"}
						</p>
						<div className="flex justify-center gap-4">
							<button
								className="border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-100"
								onClick={cancelSave}
							>
								Cancel
							</button>
							<button
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
								onClick={handleSavingConfirmation}
							>
								{loading ? (
									<center>
										<BiLoader className="animate-spin" size={20} />
									</center>
								) : (
									"Save"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SaveProgressButton
