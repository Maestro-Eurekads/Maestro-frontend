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
		isStepZeroValid,
		setIsStepZeroValid,
		selectedOption,
		setCampaignFormData,
		requiredFields,
		currencySign,
		jwt,
		agencyId,
	} = useCampaigns()

	const cancelSave = () => {
		setShowSave(false)
	}

	// Validate campaign data before saving
	const validateCampaignData = (data) => {
		if (!data) {
			throw new Error("Campaign data is missing");
		}

		if (!data.client_selection?.id) {
			throw new Error("Client selection is required");
		}

		if (!data.media_plan) {
			throw new Error("Media plan name is required");
		}

		if (!data.budget_details_currency?.id) {
			throw new Error("Currency is required");
		}

		if (!data.funnel_stages || data.funnel_stages.length === 0) {
			throw new Error("At least one funnel stage is required");
		}

		if (!data.channel_mix || data.channel_mix.length === 0) {
			throw new Error("Channel mix data is required");
		}

		// Validate channel mix structure
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

		return true;
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
			validateCampaignData(cleanedFormData);

			// Extract objectives and metrics
			const objectives = await extractObjectives(cleanedFormData);
			const selectedMetrics = await getFilteredMetrics(objectives);

			// Clean channel mix data
			const channelMixCleaned = removeKeysRecursively(cleanedFormData?.channel_mix, [
				"id",
				"isValidated",
				"formatValidated",
				"validatedStages",
				"documentId",
				"_aggregated",
			]);

			// Clean campaign budget data
			const campaignBudgetCleaned = removeKeysRecursively(cleanedFormData?.campaign_budget, ["id"]);

			const calcPercent = Math.ceil((active / 10) * 100);

			// Normalize approved_by to array of IDs (support objects or IDs)
			const existingApprovedByRaw = cleanedFormData?.media_plan_details?.approved_by;
			const existingApprovedBy = Array.isArray(existingApprovedByRaw)
				? existingApprovedByRaw.map((user: any) => (typeof user === "object" ? user.id : user))
				: [];

			// Validate user IDs
			const validateUserIds = (users) => {
				return users.filter(user => user && !isNaN(Number(user))).map(user => Number(user));
			};

			const payload = {
				data: {
					campaign_builder: loggedInUser?.id,
					client: cleanedFormData?.client_selection?.id,
					client_selection: {
						client: cleanedFormData?.client_selection?.value,
						level_1: cleanedFormData?.level_1,
					},
					media_plan_details: {
						plan_name: cleanedFormData?.media_plan,
						internal_approver: validateUserIds(cleanedFormData.internal_approver.map((item: any) => item.id)),
						client_approver: validateUserIds(cleanedFormData.client_approver.map((item: any) => item.id)),
						approved_by: validateUserIds(cleanedFormData.approved_by.map((item: any) => item.id)),
					},
					budget_details: {
						currency: cleanedFormData?.budget_details_currency?.id || "EUR",
						value: cleanedFormData?.country_details?.id,
					},
					campaign_budget: {
						...campaignBudgetCleaned,
						currency: cleanedFormData?.budget_details_currency?.id || "EUR",
					},
					funnel_stages: cleanedFormData?.funnel_stages,
					channel_mix: channelMixCleaned,
					custom_funnels: cleanedFormData?.custom_funnels,
					funnel_type: cleanedFormData?.funnel_type,
					table_headers: objectives || {},
					selected_metrics: selectedMetrics || {},
					goal_level: cleanedFormData?.goal_level,
					campaign_timeline_start_date: cleanedFormData?.campaign_timeline_start_date,
					campaign_timeline_end_date: cleanedFormData?.campaign_timeline_end_date,
					agency_profile: agencyId,
					progress_percent:
						campaignFormData?.progress_percent > calcPercent ? campaignFormData?.progress_percent : calcPercent,
					campaign_version: cleanedFormData?.campaign_version || "V1",
				},
			};

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
						...cleanedFormData.internal_approver.map((item: any) => String(item.id)),
						...cleanedFormData.client_approver.map((item: any) => String(item.id)),
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
