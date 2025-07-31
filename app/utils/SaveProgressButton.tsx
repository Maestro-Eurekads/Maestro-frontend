"use client"
import Image from "next/image"
import clsx from "clsx"
import Continue from "../../public/arrow-back-outline.svg"
import { useState, useEffect, useRef } from "react"
import { BiLoader } from "react-icons/bi"
import { useEditing } from "app/utils/EditingContext"
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
import { SVGLoader } from "components/SVGLoader"
import { toast } from "sonner"

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

const SaveProgressButton = ({ setIsOpen }) => {

	const { active, setActive, subStep, setSubStep, setChange } = useActive()
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

	const {
		createCampaign,
		updateCampaign,
		campaignData,
		campaignFormData,
		cId,
		getActiveCampaign,
		copy,
		isEditingBuyingObjective,
		selectedOption,
		setCampaignFormData,
		setCampaignData,
		currencySign,
		jwt,
		agencyId,
	} = useCampaigns()

	const isInternalApprover = isAdmin || isAgencyApprover || isFinancialApprover

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
				// Check all channel types for formats
				const channelTypes = [
					'social_media', 'display_networks', 'search_engines', 'streaming', 'ooh',
					'broadcast', 'messaging', 'print', 'e_commerce', 'in_game', 'mobile'
				];

				const hasFormatSelected = channelTypes.some(channelType => {
					const platforms = stageData[channelType] || [];
					return platforms.some(platform => {
						// Check if platform has formats at channel level
						const hasChannelFormats = platform?.format?.length > 0 &&
							platform.format.some(f => f.format_type && f.num_of_visuals);

						// Check if platform has formats at adset level
						const hasAdsetFormats = platform?.ad_sets?.some(adset =>
							adset?.format?.length > 0 &&
							adset.format.some(f => f.format_type && f.num_of_visuals)
						);

						return hasChannelFormats || hasAdsetFormats;
					});
				});

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

	const cancelSave = () => {
		setShowSave(false)
	}

	const handleContinue = () => {
		setShowSave(true)
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
					toast.error(errorMessage)
					setLoading(false)
					return
				}
			}

			if (isEditingBuyingObjective) {
				setIsBuyingObjectiveError(true)
				toast.error("Please confirm or cancel your buying objective changes before proceeding")
				setLoading(false)
				return
			}
		}

		setLoading(true)
		let hasError = false

		if (active === 1) {
			if (!campaignFormData?.funnel_stages || campaignFormData.funnel_stages.length === 0) {
				setTriggerFunnelError(true)
				toast.error("Please select at least one stage!")
				setLoading(false)
				return
			}
		}

		if (active === 2) {
			const hasChannelSelected = validateChannelSelection()
			if (!hasChannelSelected) {
				toast.error("Please select at least one channel before proceeding!")
			}
		}

		// FIXED: Clear channel state when moving to step 3 (Adset and Audiences step)
		if (active === 3) {
			clearChannelStateForNewCampaign()
		}

		if (active === 8) {
			// Check if budget type is selected
			if (!campaignFormData?.campaign_budget?.budget_type) {
				toast.error("Please select how to set your budget")
				setLoading(false)
				return
			}

			// Check if budget amount is provided
			if (!campaignFormData?.campaign_budget?.amount) {
				toast.error("Please input a budget amount")
				setLoading(false)
				return
			}

			// For top-down approach, check if sub_budget_type is selected when in substep
			if (
				campaignFormData?.campaign_budget?.budget_type === "top_down" &&
				subStep > 0 &&
				!campaignFormData?.campaign_budget?.sub_budget_type
			) {
				toast.error("Please select what type of budget you want")
				setLoading(false)
				return
			}

			// Check if granularity level is selected
			if (!campaignFormData?.campaign_budget?.level) {
				toast.error("Please select a granularity level (Channel level or Adset level)")
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
					toast.error("Choose your start and end date!")
					setLoading(false)
					return
				}
			}
		}

		if (hasError) {
			setLoading(false)
			return
		}

		const updateCampaignData = async (data) => {
			const calcPercent = Math.ceil((active / 10) * 100)

			// Clean and validate data before sending
			const cleanData = (obj) => {
				if (obj === null || obj === undefined) return null
				if (typeof obj !== 'object') return obj
				if (Array.isArray(obj)) {
					return obj.map(cleanData).filter(item => item !== null && item !== undefined)
				}
				const cleaned = {}
				for (const [key, value] of Object.entries(obj)) {
					if (value !== null && value !== undefined) {
						cleaned[key] = cleanData(value)
					}
				}
				return Object.keys(cleaned).length > 0 ? cleaned : null
			}

			// Use the same date validation approach as SaveAllProgressButton
			const validateAndFormatDates = (data) => {
				const isValidDate = (d) => {
					if (!d || d === "" || d === null || d === undefined) {
						return null;
					}
					// Check if it's already in yyyy-MM-dd format
					if (typeof d === 'string' && d.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
						return d;
					}
					// Try to parse and format the date
					try {
						const date = new Date(d);
						if (isNaN(date.getTime())) {
							return null;
						}
						return date.toISOString().split('T')[0]; // Convert to yyyy-MM-dd format
					} catch (error) {
						return null;
					}
				};

				return {
					...data,
					campaign_timeline_start_date: isValidDate(data?.campaign_timeline_start_date),
					campaign_timeline_end_date: isValidDate(data?.campaign_timeline_end_date),
				};
			};

			// Special handling for channel_mix to ensure it's properly structured
			const validateChannelMix = (channelMix) => {
				if (!channelMix || !Array.isArray(channelMix)) {
					console.warn("validateChannelMix: channelMix is not an array:", channelMix)
					return []
				}

				return channelMix.map(stage => {
					if (!stage || typeof stage !== 'object') return null

					const cleanedStage = { ...stage }

					// Format date fields in the stage
					const formatDateField = (value) => {
						if (!value) return value
						if (value instanceof Date) {
							return value.toISOString().split('T')[0]
						}
						if (typeof value === 'string') {
							try {
								const date = new Date(value)
								if (!isNaN(date.getTime())) {
									return date.toISOString().split('T')[0]
								}
							} catch (e) {
								// Keep original if parsing fails
							}
						}
						return value
					}

					// Format stage-level date fields
					if (cleanedStage.funnel_stage_timeline_start_date) {
						cleanedStage.funnel_stage_timeline_start_date = formatDateField(cleanedStage.funnel_stage_timeline_start_date)
					}
					if (cleanedStage.funnel_stage_timeline_end_date) {
						cleanedStage.funnel_stage_timeline_end_date = formatDateField(cleanedStage.funnel_stage_timeline_end_date)
					}

					// Clean each channel type
					CHANNEL_TYPES.forEach(({ key }) => {
						if (cleanedStage[key] && Array.isArray(cleanedStage[key])) {
							cleanedStage[key] = cleanedStage[key].map(platform => {
								if (!platform || typeof platform !== 'object') return null

								// Remove any undefined or null values from platform
								const cleanedPlatform = {}
								Object.entries(platform).forEach(([k, v]) => {
									if (v !== null && v !== undefined) {
										// Format date fields in platforms
										if (k.includes('_date') || k.includes('Date')) {
											cleanedPlatform[k] = formatDateField(v)
										} else {
											cleanedPlatform[k] = v
										}
									}
								})

								return Object.keys(cleanedPlatform).length > 0 ? cleanedPlatform : null
							}).filter(Boolean)
						}
					})

					return cleanedStage
				}).filter(Boolean)
			}

			const cleanedData = cleanData({
				...data,
				channel_mix: data.channel_mix ? validateChannelMix(data.channel_mix) : (Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []),
				progress_percent:
					campaignFormData?.progress_percent > calcPercent ? campaignFormData?.progress_percent : calcPercent,
			})

			// Apply date validation using the same approach as SaveAllProgressButton
			const dataWithValidatedDates = validateAndFormatDates(cleanedData)

			// Log the data being sent for debugging
			console.log("Sending campaign update data:", dataWithValidatedDates)

			// Deep search for any date-like values that might be causing issues
			const findDateFields = (obj, path = '') => {
				if (obj === null || obj === undefined) return
				if (typeof obj === 'string') {
					// Check if string looks like a date but not in yyyy-MM-dd format
					if (obj.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) ||
						obj.match(/^\d{4}\/\d{2}\/\d{2}/) ||
						obj.match(/^\d{2}\/\d{2}\/\d{4}/) ||
						obj.match(/^\d{2}-\d{2}-\d{4}/)) {
						console.warn(`Potential date format issue at ${path}:`, obj)
					}
					return
				}
				if (typeof obj === 'object') {
					if (Array.isArray(obj)) {
						obj.forEach((item, index) => {
							findDateFields(item, `${path}[${index}]`)
						})
					} else {
						Object.entries(obj).forEach(([key, value]) => {
							const newPath = path ? `${path}.${key}` : key
							findDateFields(value, newPath)
						})
					}
				}
			}

			findDateFields(dataWithValidatedDates)

			// Don't send if data is empty or null
			if (!dataWithValidatedDates || Object.keys(dataWithValidatedDates).length === 0) {
				console.warn("No valid data to update, skipping update")
				toast.success("Campaign updated!")
				setChange(false)
				return
			}

			try {
				await updateCampaign(dataWithValidatedDates)
				await getActiveCampaign()
				toast.success("Campaign updated!")
				setChange(false)
			} catch (error) {
				if (error?.response?.status === 401) {
					const event = new Event("unauthorizedEvent")
					window.dispatchEvent(event)
				}
				console.error("Update campaign error:", error)
				console.error("Error response data:", error?.response?.data)
				toast.error(`Failed to update campaign data: ${error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || "Unknown error"}`)
				setLoading(false)
				throw error
			}
		}

		// Helper function to ensure campaign exists and context is updated
		const ensureCampaignExists = async () => {
			if (campaignData && cId) {
				console.log("ensureCampaignExists: Campaign already exists - cId:", cId)
				return true
			}

			console.log("ensureCampaignExists: No campaign exists, creating one...")
			try {
				await handleStepZero(true) // Skip validation for step 0 fields

				// Wait for context to be updated - check multiple times
				let attempts = 0
				const maxAttempts = 20
				while ((!campaignData || !cId) && attempts < maxAttempts) {
					console.log(`ensureCampaignExists: Waiting for context update... attempt ${attempts + 1}/${maxAttempts}`)
					console.log(`ensureCampaignExists: Current state - campaignData:`, campaignData, "cId:", cId)
					await new Promise(resolve => setTimeout(resolve, 300))
					attempts++
				}

				// Final check
				if (!campaignData || !cId) {
					console.error("ensureCampaignExists: Campaign creation failed after all attempts")
					console.error("ensureCampaignExists: Final state - campaignData:", campaignData, "cId:", cId)
					return false
				}

				console.log("ensureCampaignExists: Campaign created successfully - cId:", cId)
				return true
			} catch (error) {
				console.error("ensureCampaignExists: Error creating campaign:", error)
				return false
			}
		}

		// Helper function to ensure context is updated after campaign creation
		const updateContextAfterCreation = async (response) => {
			const documentId = response?.data?.data?.documentId
			const campaignId = response?.data?.data?.id

			if (documentId) {
				console.log("updateContextAfterCreation: Updating context with documentId:", documentId)

				try {
					// Update campaignFormData with new IDs immediately
					setCampaignFormData(prev => ({
						...prev,
						cId: documentId,
						campaign_id: campaignId,
						// Ensure channel_mix is always an array
						channel_mix: Array.isArray(prev.channel_mix) ? prev.channel_mix : []
					}))

					// Update campaignData immediately
					if (response?.data?.data) {
						setCampaignData(response?.data?.data)
					}

					// Call getActiveCampaign to ensure full context sync
					console.log("updateContextAfterCreation: Calling getActiveCampaign...")
					await getActiveCampaign(documentId)
					console.log("updateContextAfterCreation: getActiveCampaign completed")

					// Force a small delay to ensure state updates are processed
					await new Promise(resolve => setTimeout(resolve, 100))

					// Double-check that context is updated
					console.log("updateContextAfterCreation: Final context check - cId:", cId, "campaignData:", campaignData)

					console.log("updateContextAfterCreation: Context update completed successfully")
				} catch (error) {
					console.error("updateContextAfterCreation: Error updating context:", error)
					throw error
				}
			} else {
				console.error("updateContextAfterCreation: No documentId found in response:", response)
				throw new Error("No documentId found in campaign creation response")
			}
		}

		const handleStepZero = async (skipValidation = false) => {
			setLoading(true)
			try {
				let hasError = false
				// Validation function
				const getFieldValue = (field: any): boolean => {
					if (Array.isArray(field)) return field.length > 0
					if (typeof field === "object" && field !== null) return Object.keys(field).length > 0
					return Boolean(field)
				}

				// Error collector
				const errors: string[] = []

				// Only validate if not skipping validation (i.e., when called from step 0)
				if (!skipValidation) {
					// Check each field, and if invalid, set flag and trigger alert
					if (!getFieldValue(campaignFormData?.media_plan)) {
						errors.push("Media plan name is required.")
						hasError = true
					}

					if (!getFieldValue(campaignFormData?.budget_details_currency?.id)) {
						errors.push("Currency is required.")
						hasError = true
					}

					if (hasError) {
						toast.error(errors.join(" "))
						setValidateStep(true)
						setLoading(false)
						return
					}
				}

				// Clean and store form
				const cleanedFormData = {
					...campaignFormData,
					internal_approver: campaignFormData?.internal_approver || [],
					client_approver: campaignFormData?.client_approver || [],
					approved_by: campaignFormData?.approved_by || [],
				}

				setCampaignFormData(cleanedFormData)
				localStorage.setItem("campaignFormData", JSON.stringify(cleanedFormData))

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
							approved_by: cleanedFormData.approved_by.map((item: any) => Number(item.id)),
						},
						budget_details: {
							currency: campaignFormData?.budget_details_currency?.id || "EUR",
							value: campaignFormData?.country_details?.id,
						},
						campaign_budget: {
							currency: campaignFormData?.budget_details_currency?.id || "EUR",
						},
						agency_profile: agencyId,
						campaign_version: cleanedFormData?.campaign_version || "V1",
					},
				}

				const config = {
					headers: {
						Authorization: `Bearer ${jwt}`,
					},
				}

				// Update or Create
				if (cId && campaignData) {
					console.log("handleStepZero: Updating existing campaign with cId:", cId)
					await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`, payload, config)
					setChange(false)
					toast.success("Campaign updated successfully!")
				} else {
					console.log("handleStepZero: Creating new campaign with payload:", payload)
					const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`, payload, config)
					console.log("handleStepZero: Campaign creation response:", response?.data)

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

					console.log("handleStepZero: Calling getActiveCampaign with documentId:", response?.data?.data.documentId)

					// Update context state after campaign creation
					await updateContextAfterCreation(response)

					setChange(false)
					toast.success("Campaign created successfully!")
					// FIXED: Clear channel state when creating a new campaign
					clearChannelStateForNewCampaign()
				}
			} catch (error) {
				console.error("handleStepZero: Error occurred:", error)
				console.error("handleStepZero: Error response:", error?.response?.data)

				if (error?.response?.status === 401) {
					const event = new Event("unauthorizedEvent")
					window.dispatchEvent(event)
				} else if (error?.response?.status === 400) {
					toast.error(error?.response?.data?.error?.message || "Invalid data provided. Please check your inputs.")
				} else if (error?.response?.status === 422) {
					toast.error("Validation failed. Please check your campaign data.")
				} else if (error?.response?.status >= 500) {
					toast.error("Server error. Please try again later.")
				} else if (error?.message) {
					toast.error(error.message)
				} else {
					toast.error("Something went wrong. Please try again.")
				}

				setLoading(false)
				throw error // Re-throw to be caught by the calling function
			} finally {
				setLoading(false)
			}
		}

		const handleStepOne = async () => {
			// Ensure campaign exists and context is updated
			const campaignExists = await ensureCampaignExists()
			if (!campaignExists) {
				toast.error("Failed to create campaign. Please try again.")
				return
			}

			console.log("Step 1 - Saving funnel stages data:", campaignFormData?.funnel_stages)
			await updateCampaignData({
				funnel_stages: campaignFormData?.funnel_stages,
			})
		}

		const handleStepTwo = async () => {
			// Ensure campaign exists and context is updated
			const campaignExists = await ensureCampaignExists()
			if (!campaignExists) {
				toast.error("Failed to create campaign. Please try again.")
				return
			}
			console.log("Step 2 - Original channel_mix data:", campaignFormData?.channel_mix)
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
			// Ensure campaign exists and context is updated
			const campaignExists = await ensureCampaignExists()
			if (!campaignExists) {
				toast.error("Failed to create campaign. Please try again.")
				return
			}
			console.log("Step 3 - Original channel_mix data:", campaignFormData?.channel_mix)
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
			// Ensure campaign exists and context is updated
			const campaignExists = await ensureCampaignExists()
			if (!campaignExists) {
				toast.error("Failed to create campaign. Please try again.")
				return
			}
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
				table_headers: updatedCampaignFormData?.table_headers,
				selected_metrics: updatedCampaignFormData?.selected_metrics,
			})
		}

		const handleStepSeven = async () => {
			// Ensure campaign exists and context is updated
			const campaignExists = await ensureCampaignExists()
			if (!campaignExists) {
				toast.error("Failed to create campaign. Please try again.")
				return
			}
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
			// Ensure campaign exists and context is updated
			const campaignExists = await ensureCampaignExists()
			if (!campaignExists) {
				toast.error("Failed to create campaign. Please try again.")
				return
			}

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
				await handleStepOne()
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

			// if (active === 7) {
			// 	if (subStep < 1) {
			// 		setSubStep((prev) => prev + 1)
			// 	} else {
			// 		setActive((prev) => prev + 1)
			// 		setSubStep(0)
			// 	}
			// } else if (active === 5) {
			// 	setActive(7)
			// } else if (active !== 0) {
			// 	setActive((prev) => prev + 1)
			// }
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



	const internalApproverEmails = campaignFormData?.internal_approver?.map((a) => a?.email) || []

	const showConfirm =
		active === 10 && (isInternalApprover ? isAdmin || internalApproverEmails.includes(loggedInUser.email) : false)

	return (
		<div >
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

			<div>


				{active === 10 ? "" :
					<div className="flex justify-center items-center gap-3">
						<button
							className={clsx(
								"bottom_blue_save_btn whitespace-nowrap",
								active === 10 && "opacity-50 cursor-not-allowed",
								active < 10 && "hover:bg-blue-500",
								active === 4 && !hasFormatSelected && "px-3 py-2"
							)}
							onClick={
								active === 4 && !hasFormatSelected ? handleSkip : handleContinue
							}
							disabled={active === 10}
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
						>
							Save
						</button>

					</div>}
			</div>
			{showSave && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-xl shadow-lg w-[400px] p-6 text-center">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Save</h2>
						<p className="text-gray-700 mb-6">
							Do you want to save this step progress?
						</p>
						<div className="flex flex-row gap-4">
							<button
								className="btn_model_outline w-full"
								onClick={cancelSave}
							>
								No
							</button>
							<button
								className=" btn_model_active w-full"
								onClick={handleSave}
							>
								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : 'Save'}
							</button>
						</div>
					</div>
				</div>
			)}

		</div>
	);
};

export default SaveProgressButton