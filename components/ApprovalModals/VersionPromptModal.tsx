'use client';

import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import Continue from "../../public/arrow-back-outline.svg";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import { useActive } from 'app/utils/ActiveContext';
import { extractObjectives, getFilteredMetrics } from 'app/creation/components/EstablishedGoals/table-view/data-processor';
import { removeKeysRecursively } from 'utils/removeID';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { updateUsersWithCampaign } from 'app/homepage/functions/clients';
import { useSearchParams } from 'next/navigation';
import { useUserPrivileges } from 'utils/userPrivileges';
import { SVGLoader } from 'components/SVGLoader';

const VersionPromptModal = () => {
	const {
		campaignData,
		campaignFormData,
		setCampaignFormData,
		cId,
		getActiveCampaign,
		jwt,
		agencyId
	} = useCampaigns();
	const {
		loggedInUser
	} = useUserPrivileges();

	const { active } = useActive();
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingc, setLoadingc] = useState(false);
	const [showVersionPrompt, setShowVersionPrompt] = useState(false);
	const [showPlanInfoModal, setShowPlanInfoModal] = useState(false);
	const [versionAction, setVersionAction] = useState<'maintain' | 'new' | null>(null);
	const { setChange } = useActive();
	const query = useSearchParams();
	const campaignId = query.get('campaignId');

	const clearChannelStateForNewCampaign = () => {
		if (typeof window === "undefined") return;
		try {
			const keysToRemove = [];
			for (let i = 0; i < sessionStorage.length; i++) {
				const key = sessionStorage.key(i);
				if (key && key.startsWith("channelLevelAudienceState_")) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach(key => sessionStorage.removeItem(key));
			if ((window as any).channelLevelAudienceState) {
				Object.keys((window as any).channelLevelAudienceState).forEach(stageName => {
					delete (window as any).channelLevelAudienceState[stageName];
				});
			}
			console.log("Cleared all channel state for new campaign");
		} catch (error) {
			console.error("Error clearing channel state:", error);
		}
	};

	// const updateVersion = async (stage, label, versionData = null) => {
	// 	if (!cId) {
	// 		toast.error('No campaign ID provided.');
	// 		return;
	// 	}
	// 	setLoading(true);

	// 	try {
	// 		const basePatchData = { campaign_version: versionData.version };

	// 		await axios.put(
	// 			`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
	// 			{ data: basePatchData },
	// 			{
	// 				headers: {
	// 					Authorization: `Bearer ${jwt}`,
	// 				},
	// 			}
	// 		);

	// 		getActiveCampaign(campaignId);
	// 		setIsOpen(false);
	// 		setShowVersionPrompt(false);
	// 		toast.success(`Media plan marked as '${label}'${versionData ? `: ${versionData.plan_name}` : ''}`);
	// 	} catch (error) {
	// 		if (error?.response?.status === 401) {
	// 			const event = new Event('unauthorizedEvent');
	// 			window.dispatchEvent(event);
	// 		} else {
	// 			toast.error(error?.message || 'Failed to update status');
	// 		}
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const handleVersionChoice = async (choice) => {
	// 	if (choice === 'maintain') {
	// 		toast.success('Media plan updated and submitted for internal review.');
	// 	} else {
	// 		const currentVersion = campaignData?.campaign_version || 1;
	// 		const newVersion = currentVersion + 1;
	// 		const versionData = {
	// 			plan_name: `Media Plan V${newVersion}`,
	// 			version: newVersion,
	// 		};
	// 		await updateVersion('approved', 'Approved', versionData);
	// 		toast.success(`New version created: Media Plan V${newVersion}`);
	// 	}
	// 	setVersionAction(null);
	// 	setShowVersionPrompt(false);
	// };

	// Enhanced version handling with SaveAllProgressButton patterns
	const sanitizeVersionData = (versionData) => {
		try {
			// Deep clone to avoid mutating original data
			const cleanedData = JSON.parse(JSON.stringify(versionData || {}));

			// Ensure version has proper format
			if (!cleanedData.campaign_version || typeof cleanedData.campaign_version !== 'string') {
				cleanedData.campaign_version = "V1";
			}

			// Validate version format
			const versionMatch = cleanedData.campaign_version.match(/^V\d+$/);
			if (!versionMatch) {
				cleanedData.campaign_version = "V1";
			}

			return cleanedData;
		} catch (error) {
			console.error("Error sanitizing version data:", error);
			return { campaign_version: "V1" };
		}
	};

	const getNextVersion = (currentVersion) => {
		// Sanitize input
		const sanitizedVersion = sanitizeVersionData({ campaign_version: currentVersion });
		const version = sanitizedVersion.campaign_version;

		if (!version || version === "V1") {
			return "V2";
		}

		// Extract version number and increment
		const versionMatch = version.match(/V(\d+)/);
		if (versionMatch) {
			const versionNumber = parseInt(versionMatch[1]);
			return `V${versionNumber + 1}`;
		}

		return "V2"; // Fallback
	};

	const validateVersionChoice = (choice) => {
		const validChoices = ['new', 'maintain', 'overwrite'];
		if (!validChoices.includes(choice)) {
			throw new Error("Invalid version choice");
		}
		return choice;
	};

	const handleVersionChoice = async (choice?: string) => {
		const versionChoice = choice || 'maintain';
		setLoading(true);

		try {
			// Validate choice
			const validatedChoice = validateVersionChoice(choice);

			// Sanitize and validate campaign data
			const sanitizedData = sanitizeVersionData(campaignFormData);

			// Clean up & transform fields from all steps (using SaveAllProgressButton pattern)
			const cleanedFormData = {
				...sanitizedData,
				internal_approver: sanitizedData?.internal_approver || [],
				client_approver: sanitizedData?.client_approver || [],
				approved_by: sanitizedData?.approved_by || [],
			};

			// Extract objectives and metrics
			const objectives = await extractObjectives(cleanedFormData);
			const selectedMetrics = await getFilteredMetrics(objectives);

			// Clean channel mix data - only if it exists (SaveAllProgressButton pattern)
			const channelMixCleaned = cleanedFormData?.channel_mix
				? removeKeysRecursively(cleanedFormData.channel_mix, [
					"id",
					"isValidated",
					"formatValidated",
					"validatedStages",
					"documentId",
					"_aggregated",
				])
				: [];

			// Clean campaign budget data - only if it exists (SaveAllProgressButton pattern)
			const campaignBudgetCleaned = cleanedFormData?.campaign_budget
				? removeKeysRecursively(cleanedFormData.campaign_budget, ["id"])
				: {};

			const calcPercent = Math.ceil((active / 10) * 100);

			// Validate user IDs (SaveAllProgressButton pattern)
			const validateUserIds = (users) => {
				return users.filter(user => user && !isNaN(Number(user))).map(user => Number(user));
			};

			// Determine version based on choice
			let versionLabel;
			if (validatedChoice === 'new') {
				versionLabel = getNextVersion(campaignData?.campaign_version);
			} else {
				versionLabel = campaignData?.campaign_version || "V1";
			}

			// Build payload with only available data (SaveAllProgressButton pattern)
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
					agency_profile: agencyId,
					progress_percent:
						campaignFormData?.progress_percent > calcPercent ? campaignFormData?.progress_percent : calcPercent,
					campaign_version: versionLabel,
				},
			};

			// Add optional fields only if they exist (SaveAllProgressButton pattern)
			if (cleanedFormData?.funnel_stages) {
				(payload.data as any).funnel_stages = cleanedFormData.funnel_stages;
			}
			if (channelMixCleaned.length > 0) {
				(payload.data as any).channel_mix = channelMixCleaned;
			}
			if (cleanedFormData?.custom_funnels) {
				(payload.data as any).custom_funnels = cleanedFormData.custom_funnels;
			}
			if (cleanedFormData?.funnel_type) {
				(payload.data as any).funnel_type = cleanedFormData.funnel_type;
			}
			if (objectives) {
				(payload.data as any).table_headers = objectives;
			}
			if (selectedMetrics) {
				(payload.data as any).selected_metrics = selectedMetrics;
			}
			if (cleanedFormData?.goal_level) {
				(payload.data as any).goal_level = cleanedFormData.goal_level;
			}
			if (cleanedFormData?.campaign_timeline_start_date) {
				(payload.data as any).campaign_timeline_start_date = cleanedFormData.campaign_timeline_start_date;
			}
			if (cleanedFormData?.campaign_timeline_end_date) {
				(payload.data as any).campaign_timeline_end_date = cleanedFormData.campaign_timeline_end_date;
			}

			const config = {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			};

			// CREATE or UPDATE logic with enhanced error handling
			if (cId) {
				// Update existing campaign
				await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`, payload, config);
				toast.success(`Campaign ${validatedChoice === 'new' ? 'updated with new version' : 'maintained successfully'}!`);
			} else {
				// Create new campaign if plan doesn't exist yet
				const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`, payload, config);

				// Update URL with new campaign ID
				const url = new URL(window.location.href);
				url.searchParams.set("campaignId", `${response?.data?.data.documentId}`);
				window.history.pushState({}, "", url.toString());

				// Update users with campaign
				await updateUsersWithCampaign(
					[
						...(Array.isArray(loggedInUser?.id) ? loggedInUser?.id : [loggedInUser?.id]),
						...cleanedFormData.internal_approver.map((item: any) => String(item.id)),
						...cleanedFormData.client_approver.map((item: any) => String(item.id)),
					],
					response?.data?.data?.id,
					jwt
				);

				// Refresh campaign data
				await getActiveCampaign(response?.data?.data.documentId);
				toast.success("Campaign created successfully!");
				clearChannelStateForNewCampaign?.();
			}

			setIsOpen(false);
			setChange(false);
		} catch (error: any) {
			if (error?.response?.status === 401) {
				window.dispatchEvent(new Event("unauthorizedEvent"));
			}
			toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
			setLoading(false);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateNewVersion = async () => {
		setLoadingc(true);

		try {
			// Sanitize and validate campaign data
			const sanitizedData = sanitizeVersionData(campaignFormData);

			// Clean up & transform fields from all steps (using SaveAllProgressButton pattern)
			const cleanedFormData = {
				...sanitizedData,
				internal_approver: sanitizedData?.internal_approver || [],
				client_approver: sanitizedData?.client_approver || [],
				approved_by: sanitizedData?.approved_by || [],
			};

			// Extract objectives and metrics
			const objectives = await extractObjectives(cleanedFormData);
			const selectedMetrics = await getFilteredMetrics(objectives);

			// Clean channel mix data - only if it exists (SaveAllProgressButton pattern)
			const channelMixCleaned = cleanedFormData?.channel_mix
				? removeKeysRecursively(cleanedFormData.channel_mix, [
					"id",
					"isValidated",
					"formatValidated",
					"validatedStages",
					"documentId",
					"_aggregated",
				])
				: [];

			// Clean campaign budget data - only if it exists (SaveAllProgressButton pattern)
			const campaignBudgetCleaned = cleanedFormData?.campaign_budget
				? removeKeysRecursively(cleanedFormData.campaign_budget, ["id"])
				: {};

			const calcPercent = Math.ceil((active / 10) * 100);

			// Get next version using enhanced version handling
			const currentVersion = campaignData?.campaign_version || 'V1';
			// If no campaign exists yet, start with V1, otherwise get next version
			const newVersion = campaignData?.id ? getNextVersion(currentVersion) : 'V1';

			// Validate user IDs (SaveAllProgressButton pattern)
			const validateUserIds = (users) => {
				return users.filter(user => user && !isNaN(Number(user))).map(user => Number(user));
			};

			const config = {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			};

			// Build payload with only available data (SaveAllProgressButton pattern)
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
					agency_profile: agencyId,
					progress_percent:
						campaignFormData?.progress_percent > calcPercent ? campaignFormData?.progress_percent : calcPercent,
					campaign_version: newVersion,
				},
			};

			// Add optional fields only if they exist (SaveAllProgressButton pattern)
			if (cleanedFormData?.funnel_stages) {
				(payload.data as any).funnel_stages = cleanedFormData.funnel_stages;
			}
			if (channelMixCleaned.length > 0) {
				(payload.data as any).channel_mix = channelMixCleaned;
			}
			if (cleanedFormData?.custom_funnels) {
				(payload.data as any).custom_funnels = cleanedFormData.custom_funnels;
			}
			if (cleanedFormData?.funnel_type) {
				(payload.data as any).funnel_type = cleanedFormData.funnel_type;
			}
			if (objectives) {
				(payload.data as any).table_headers = objectives;
			}
			if (selectedMetrics) {
				(payload.data as any).selected_metrics = selectedMetrics;
			}
			if (cleanedFormData?.goal_level) {
				(payload.data as any).goal_level = cleanedFormData.goal_level;
			}
			if (cleanedFormData?.campaign_timeline_start_date) {
				(payload.data as any).campaign_timeline_start_date = cleanedFormData.campaign_timeline_start_date;
			}
			if (cleanedFormData?.campaign_timeline_end_date) {
				(payload.data as any).campaign_timeline_end_date = cleanedFormData.campaign_timeline_end_date;
			}

			// First: Update old campaign to maintain current version (only if campaign exists)
			if (campaignFormData.cId) {
				const currentVersionPayload = {
					...payload,
					data: {
						...payload.data,
						campaign_version: currentVersion, // keep current version unchanged
					}
				};

				await axios.put(
					`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignFormData.cId}`,
					currentVersionPayload,
					config
				);
			}



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
			toast.success(campaignData?.id ? "New campaign version created successfully!" : "Campaign created successfully!");
			clearChannelStateForNewCampaign?.();

			setIsOpen(false);
			setChange(false);
		} catch (error: any) {
			if (error?.response?.status === 401) {
				window.dispatchEvent(new Event("unauthorizedEvent"));
			}
			toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
		} finally {
			setLoadingc(false);
		}
	};



	return (
		<>
			<button className="bottom_black_next_btn hover:bg-blue-500 whitespace-nowrap" onClick={() => setIsOpen(true)}>
				<p>Save</p>
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
						<button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
							<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
						</button>
						<div className="w-full flex justify-center pt-2">
							<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
								<CheckCircle className="text-blue-600 w-7 h-7" />
							</div>
						</div>
						<h2 className="text-xl font-semibold text-[#181D27] mb-2">
							{campaignData?.id ? 'Media Plan Version' : 'Save Media Plan'}
						</h2>
						<p className="text-sm text-[#535862] mb-4">
							{campaignData?.id
								? 'Would you like to create a new version or maintain the same version?'
								: 'Would you like to save your media plan?'
							}
						</p>

						<div className="flex flex-col gap-4">
							<button
								className="btn_model_active w-full"
								onClick={() => handleVersionChoice('maintain')}
							>
								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : (campaignData?.id ? 'Maintain Same Version' : 'Save Plan')}
							</button>
							<button
								className="btn_model_outline w-full"
								onClick={handleCreateNewVersion}
								disabled={loadingc}
							>
								{loadingc ? <SVGLoader width="30px" height="30px" color="#000" /> : (campaignData?.id ? 'Create New Version' : 'Save as New Version')}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default VersionPromptModal;
