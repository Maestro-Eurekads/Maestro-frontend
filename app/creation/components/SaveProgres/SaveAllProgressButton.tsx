import { updateUsersWithCampaign } from 'app/homepage/functions/clients';
import { useActive } from 'app/utils/ActiveContext';
import { useCampaigns } from 'app/utils/CampaignsContext';
import axios from 'axios';
import React, { useState } from 'react'
import { toast, Toaster } from 'sonner';
import { removeKeysRecursively } from 'utils/removeID';
import { useUserPrivileges } from 'utils/userPrivileges';
import { extractObjectives, getFilteredMetrics } from '../EstablishedGoals/table-view/data-processor';
import { BiLoader } from 'react-icons/bi';
import { SVGLoader } from 'components/SVGLoader';

const SaveAllProgressButton = () => {
	const { isClient, loggedInUser } = useUserPrivileges();
	const [loading, setLoading] = useState(false);
	const { setChange } = useActive()
	const [showSave, setShowSave] = useState(false)
	const { active, subStep } = useActive();

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
		currencySign,
		jwt,
		agencyId,
	} = useCampaigns()

	const cancelSave = () => {
		setShowSave(false)
	}

	// Validate campaign data before saving - more flexible for partial saves
	const validateCampaignData = (data) => {
		if (!data) {
			throw new Error("Campaign data is missing");
		}

		// Only validate required fields for campaign creation
		if (!data.client_selection?.id) {
			throw new Error("Client selection is required");
		}

		if (!data.media_plan) {
			throw new Error("Media plan name is required");
		}

		if (!data.budget_details_currency?.id) {
			throw new Error("Currency is required");
		}

		// For funnel stages, only validate if they exist (allow partial saves)
		if (data.funnel_stages && data.funnel_stages.length === 0) {
			throw new Error("At least one funnel stage is required");
		}

		// For channel mix, only validate structure if it exists (allow partial saves)
		if (data.channel_mix && data.channel_mix.length > 0) {
			data.channel_mix.forEach((mix, index) => {
				if (!mix.funnel_stage) {
					throw new Error(`Funnel stage is missing for channel mix at index ${index}`);
				}

				// Ensure all required channel types exist
				const requiredChannelTypes = [
					'social_media', 'display_networks', 'search_engines', 'streaming', 'ooh',
					'broadcast', 'messaging', 'print', 'e_commerce', 'in_game', 'mobile'
				];

				requiredChannelTypes.forEach(channelType => {
					if (!Array.isArray(mix[channelType])) {
						throw new Error(`Channel type '${channelType}' is not an array in stage '${mix.funnel_stage}'`);
					}
				});
			});
		}

		return true;
	};

	// Validate and format dates
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

	// Clean and sanitize campaign data
	const sanitizeCampaignData = (data) => {
		try {
			// Deep clone to avoid mutating original data
			const cleanedData = JSON.parse(JSON.stringify(data));

			// Ensure all required arrays exist
			cleanedData.internal_approver = cleanedData?.internal_approver || [];
			cleanedData.client_approver = cleanedData?.client_approver || [];
			cleanedData.approved_by = cleanedData?.approved_by || [];

			// Clean channel mix data
			if (cleanedData.channel_mix) {
				cleanedData.channel_mix = cleanedData.channel_mix.map(mix => {
					const cleanedMix = { ...mix };

					// Ensure all channel types exist
					['social_media', 'display_networks', 'search_engines', 'streaming', 'ooh',
						'broadcast', 'messaging', 'print', 'e_commerce', 'in_game', 'mobile'].forEach(channelType => {
							if (!cleanedMix[channelType]) {
								cleanedMix[channelType] = [];
							}
						});

					return cleanedMix;
				});
			}

			return cleanedData;
		} catch (error) {
			console.error("Error sanitizing campaign data:", error);
			throw new Error("Failed to process campaign data");
		}
	};

	const handleSaveAllSteps = async () => {
		setLoading(true);

		try {
			// Validate and sanitize campaign data
			const cleanedFormData = sanitizeCampaignData(campaignFormData);
			const dataWithValidatedDates = validateAndFormatDates(cleanedFormData);

			// Only validate if we have the minimum required data for campaign creation
			if (!campaignFormData.cId) {
				validateCampaignData(dataWithValidatedDates);
			}

			// Extract objectives and metrics
			const objectives = await extractObjectives(cleanedFormData);
			const selectedMetrics = await getFilteredMetrics(objectives);

			// Clean channel mix data - only if it exists
			const channelMixCleaned = dataWithValidatedDates?.channel_mix
				? removeKeysRecursively(dataWithValidatedDates.channel_mix, [
					"id",
					"isValidated",
					"formatValidated",
					"validatedStages",
					"documentId",
					"_aggregated",
				])
				: [];

			// Clean campaign budget data - only if it exists
			const campaignBudgetCleaned = dataWithValidatedDates?.campaign_budget
				? removeKeysRecursively(dataWithValidatedDates.campaign_budget, ["id"])
				: {};

			const calcPercent = Math.ceil((active / 10) * 100);

			// Normalize approved_by to array of IDs (support objects or IDs)
			const existingApprovedByRaw = dataWithValidatedDates?.media_plan_details?.approved_by;
			const existingApprovedBy = Array.isArray(existingApprovedByRaw)
				? existingApprovedByRaw.map((user: any) => (typeof user === "object" ? user.id : user))
				: [];

			// Validate user IDs
			const validateUserIds = (users) => {
				return users.filter(user => user && !isNaN(Number(user))).map(user => Number(user));
			};

			// Build payload with only available data
			const payload = {
				data: {
					campaign_builder: loggedInUser?.id,
					client: dataWithValidatedDates?.client_selection?.id,
					client_selection: {
						client: dataWithValidatedDates?.client_selection?.value,
						level_1: dataWithValidatedDates?.level_1,
					},
					media_plan_details: {
						plan_name: dataWithValidatedDates?.media_plan,
						internal_approver: validateUserIds(dataWithValidatedDates.internal_approver.map((item: any) => item.id)),
						client_approver: validateUserIds(dataWithValidatedDates.client_approver.map((item: any) => item.id)),
						approved_by: validateUserIds(dataWithValidatedDates.approved_by.map((item: any) => item.id)),
					},
					budget_details: {
						currency: dataWithValidatedDates?.budget_details_currency?.id || "EUR",
						value: dataWithValidatedDates?.country_details?.id,
					},
					campaign_budget: {
						...campaignBudgetCleaned,
						currency: dataWithValidatedDates?.budget_details_currency?.id || "EUR",
					},
					agency_profile: agencyId,
					progress_percent:
						campaignFormData?.progress_percent > calcPercent ? campaignFormData?.progress_percent : calcPercent,
					campaign_version: dataWithValidatedDates?.campaign_version || "V1",
				},
			};

			// Add optional fields only if they exist
			if (dataWithValidatedDates?.funnel_stages) {
				(payload.data as any).funnel_stages = dataWithValidatedDates.funnel_stages;
			}
			if (channelMixCleaned.length > 0) {
				(payload.data as any).channel_mix = channelMixCleaned;
			}
			if (dataWithValidatedDates?.custom_funnels) {
				(payload.data as any).custom_funnels = dataWithValidatedDates.custom_funnels;
			}
			if (dataWithValidatedDates?.funnel_type) {
				(payload.data as any).funnel_type = dataWithValidatedDates.funnel_type;
			}
			if (objectives) {
				(payload.data as any).table_headers = objectives;
			}
			if (selectedMetrics) {
				(payload.data as any).selected_metrics = selectedMetrics;
			}
			if (dataWithValidatedDates?.goal_level) {
				(payload.data as any).goal_level = dataWithValidatedDates.goal_level;
			}
			if (dataWithValidatedDates?.campaign_timeline_start_date) {
				(payload.data as any).campaign_timeline_start_date = dataWithValidatedDates.campaign_timeline_start_date;
			}
			if (dataWithValidatedDates?.campaign_timeline_end_date) {
				(payload.data as any).campaign_timeline_end_date = dataWithValidatedDates.campaign_timeline_end_date;
			}

			const config = {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			};

			// CREATE or UPDATE logic
			if (campaignFormData.cId) {
				await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignFormData.cId}`, payload, config);
				toast.success("Campaign updated successfully!");
			} else {
				const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`, payload, config);

				const url = new URL(window.location.href);
				url.searchParams.set("campaignId", `${response?.data?.data.documentId}`);
				window.history.pushState({}, "", url.toString());

				await updateUsersWithCampaign(
					[
						...(Array.isArray(loggedInUser?.id) ? loggedInUser?.id : [loggedInUser?.id]),
						...dataWithValidatedDates.internal_approver.map((item: any) => String(item.id)),
						...dataWithValidatedDates.client_approver.map((item: any) => String(item.id)),
					],
					response?.data?.data?.id,
					jwt
				);

				await getActiveCampaign(response?.data?.data.documentId);
				toast.success("Campaign created successfully!");
				clearChannelStateForNewCampaign?.();
			}

			setChange(false);
			setShowSave(false);
		} catch (error: any) {
			if (error?.response?.status === 401) {
				window.dispatchEvent(new Event("unauthorizedEvent"));
			} else if (error?.response?.status === 400) {
				toast.error(error?.response?.data?.error?.message || "Invalid data provided. Please check your inputs.");
			} else if (error?.response?.status === 422) {
				toast.error("Validation failed. Please check your campaign data.");
			} else if (error?.response?.status >= 500) {
				toast.error("Server error. Please try again later.");
			} else if (error?.message) {
				toast.error(error.message);
			} else {
				toast.error("Something went wrong. Please try again.");
			}

			setLoading(false);
			setShowSave(false);
		} finally {
			setLoading(false);
			setShowSave(false);
		}
	};

	return (
		<div >
			<div  >
				<button
					className={"bottom_blue_save_btn whitespace-nowrap"}
					onClick={() => setShowSave(true)}
				>
					Save
				</button>
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
								className="btn_model_outline  w-full"
								onClick={cancelSave}
							>
								No
							</button>
							<button
								className="btn_model_active w-full"
								onClick={handleSaveAllSteps}
							>
								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : 'Save'}
							</button>
						</div>
					</div>
				</div>
			)}

		</div>
	)
}

export default SaveAllProgressButton
