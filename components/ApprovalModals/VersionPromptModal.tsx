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

	const handleVersionChoice = async () => {
		setLoading(true);

		try {
			// Clean up & transform fields from all steps
			const cleanedFormData = {
				...campaignFormData,
				internal_approver: campaignFormData?.internal_approver || [],
				client_approver: campaignFormData?.client_approver || [],
				approved_by: campaignFormData?.approved_by || [],
			};

			const objectives = await extractObjectives(cleanedFormData);
			const selectedMetrics = await getFilteredMetrics(objectives);

			const channelMixCleaned = removeKeysRecursively(cleanedFormData?.channel_mix, [
				"id",
				"isValidated",
				"formatValidated",
				"validatedStages",
				"documentId",
				"_aggregated",
			]);

			const campaignBudgetCleaned = removeKeysRecursively(cleanedFormData?.campaign_budget, ["id"]);

			const calcPercent = Math.ceil((active / 10) * 100);


			const currentVersionNumber = Number((campaignData?.campaign_version || 'V1').replace('V', ''));
			const newVersionNumber = currentVersionNumber + 1;
			const versionLabel = `V${newVersionNumber}`; // This will be used as string in payload

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
						internal_approver: cleanedFormData.internal_approver.map((item: any) => Number(item.id)),
						client_approver: cleanedFormData.client_approver.map((item: any) => Number(item.id)),
						approved_by: cleanedFormData.approved_by.map((item: any) => Number(item.id)),
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
					campaign_version: versionLabel,
				},
			};

			const config = {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			};

			// CREATE or UPDATE logic
			if (cId) {
				await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`, payload, config);
				toast.success("Campaign Maintain successfully!");
			}

			setIsOpen(false);
			setChange(false);
		} catch (error: any) {
			if (error?.response?.status === 401) {
				window.dispatchEvent(new Event("unauthorizedEvent"));
			}
			toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
			setLoading(false);
			setChange(false);
		} finally {
			setLoading(false);
			setChange(false);
		}
	};

	const handleCreateNewVersion = async () => {
		setLoadingc(true);

		try {
			// Clean up & transform fields from all steps
			const cleanedFormData = {
				...campaignFormData,
				internal_approver: campaignFormData?.internal_approver || [],
				client_approver: campaignFormData?.client_approver || [],
				approved_by: campaignFormData?.approved_by || [],
			};

			const objectives = await extractObjectives(cleanedFormData);
			const selectedMetrics = await getFilteredMetrics(objectives);

			const channelMixCleaned = removeKeysRecursively(cleanedFormData?.channel_mix, [
				"id",
				"isValidated",
				"formatValidated",
				"validatedStages",
				"documentId",
				"_aggregated",
			]);

			const campaignBudgetCleaned = removeKeysRecursively(cleanedFormData?.campaign_budget, ["id"]);
			const calcPercent = Math.ceil((active / 10) * 100);

			const currentVersionNumber = Number((campaignData?.campaign_version || 'V1').replace('V', ''));
			const newVersionNumber = currentVersionNumber + 1;
			const versionLabel = `V${newVersionNumber}`;

			const config = {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			};

			// Then: Create new version
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
						internal_approver: cleanedFormData.internal_approver.map((item: any) => Number(item.id)),
						client_approver: cleanedFormData.client_approver.map((item: any) => Number(item.id)),
						approved_by: cleanedFormData.approved_by.map((item: any) => Number(item.id)),
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
					campaign_version: versionLabel,
				},
			};

			// First: Update old campaign
			if (campaignFormData.cId) {
				await axios.put(
					`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignFormData.cId}`,
					{
						data: {
							...payload?.data,
							campaign_version: `V${currentVersionNumber}`, // keep current version unchanged
						},
					},
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
			toast.success("New campaign version created successfully!");
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
			setChange(false);
		}
	};


	// const handleCreateNewVersion = async () => {
	// 	setLoadingc(true);

	// 	try {
	// 		// Clean up & transform fields from all steps
	// 		const cleanedFormData = {
	// 			...campaignFormData,
	// 			internal_approver: campaignFormData?.internal_approver || [],
	// 			client_approver: campaignFormData?.client_approver || [],
	// 			approved_by: campaignFormData?.approved_by || [],
	// 		};

	// 		const objectives = await extractObjectives(cleanedFormData);
	// 		const selectedMetrics = await getFilteredMetrics(objectives);

	// 		const channelMixCleaned = removeKeysRecursively(cleanedFormData?.channel_mix, [
	// 			"id",
	// 			"isValidated",
	// 			"formatValidated",
	// 			"validatedStages",
	// 			"documentId",
	// 			"_aggregated",
	// 		]);

	// 		const campaignBudgetCleaned = removeKeysRecursively(cleanedFormData?.campaign_budget, ["id"]);

	// 		const calcPercent = Math.ceil((active / 10) * 100);

	// 		// Normalize approved_by to array of IDs (support objects or IDs)
	// 		const existingApprovedByRaw = campaignFormData?.media_plan_details?.approved_by;
	// 		const existingApprovedBy = Array.isArray(existingApprovedByRaw)
	// 			? existingApprovedByRaw.map((user: any) => (typeof user === "object" ? user.id : user))
	// 			: [];

	// 		const currentVersionNumber = Number((campaignData?.campaign_version || 'V1').replace('V', ''));
	// 		const newVersionNumber = currentVersionNumber + 1;
	// 		const versionLabel = `V${newVersionNumber}`; // This will be used as string in payload

	// 		const payload = {
	// 			data: {
	// 				campaign_builder: loggedInUser?.id,
	// 				client: cleanedFormData?.client_selection?.id,
	// 				client_selection: {
	// 					client: cleanedFormData?.client_selection?.value,
	// 					level_1: cleanedFormData?.level_1,
	// 				},
	// 				media_plan_details: {
	// 					plan_name: cleanedFormData?.media_plan,
	// 					internal_approver: cleanedFormData.internal_approver.map((item: any) => Number(item.id)),
	// 					client_approver: cleanedFormData.client_approver.map((item: any) => Number(item.id)),
	// 					approved_by: cleanedFormData.approved_by.map((item: any) => Number(item.id)),
	// 				},
	// 				budget_details: {
	// 					currency: cleanedFormData?.budget_details_currency?.id || "EUR",
	// 					value: cleanedFormData?.country_details?.id,
	// 				},
	// 				campaign_budget: {
	// 					...campaignBudgetCleaned,
	// 					currency: cleanedFormData?.budget_details_currency?.id || "EUR",
	// 				},
	// 				funnel_stages: cleanedFormData?.funnel_stages,
	// 				channel_mix: channelMixCleaned,
	// 				custom_funnels: cleanedFormData?.custom_funnels,
	// 				funnel_type: cleanedFormData?.funnel_type,
	// 				table_headers: objectives || {},
	// 				selected_metrics: selectedMetrics || {},
	// 				goal_level: cleanedFormData?.goal_level,
	// 				campaign_timeline_start_date: cleanedFormData?.campaign_timeline_start_date,
	// 				campaign_timeline_end_date: cleanedFormData?.campaign_timeline_end_date,
	// 				agency_profile: agencyId,
	// 				progress_percent:
	// 					campaignFormData?.progress_percent > calcPercent ? campaignFormData?.progress_percent : calcPercent,
	// 				campaign_version: versionLabel,
	// 			},
	// 		};

	// 		const config = {
	// 			headers: {
	// 				Authorization: `Bearer ${jwt}`,
	// 			},
	// 		};

	// 		// CREATE or UPDATE logic
	// 		if (campaignFormData.cId) {
	// 			await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignFormData.cId}`, payload, config);
	// 			toast.success("Campaign updated successfully!");
	// 		} else {
	// 			const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`, payload, config);

	// 			const url = new URL(window.location.href);
	// 			url.searchParams.set("campaignId", `${response?.data?.data.documentId}`);
	// 			window.history.pushState({}, "", url.toString());

	// 			await updateUsersWithCampaign(
	// 				[
	// 					...(Array.isArray(loggedInUser?.id) ? loggedInUser?.id : [loggedInUser?.id]),
	// 					...cleanedFormData.internal_approver.map((item: any) => String(item.id)),
	// 					...cleanedFormData.client_approver.map((item: any) => String(item.id)),
	// 				],
	// 				response?.data?.data?.id,
	// 				jwt
	// 			);

	// 			await getActiveCampaign(response?.data?.data.documentId);
	// 			toast.success("Campaign created successfully!");
	// 			clearChannelStateForNewCampaign?.();
	// 		}

	// 		setIsOpen(false);
	// 		setChange(false);
	// 	} catch (error: any) {
	// 		if (error?.response?.status === 401) {
	// 			window.dispatchEvent(new Event("unauthorizedEvent"));
	// 		}
	// 		toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
	// 		setLoadingc(false);
	// 		setChange(false);
	// 	} finally {
	// 		setLoadingc(false);
	// 		setChange(false);
	// 	}
	// };

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
							Media Plan Version
						</h2>
						<p className="text-sm text-[#535862] mb-4">
							Would you like to create a new version or maintain the same version?
						</p>

						<div className="flex flex-col gap-4">
							<button
								className="btn_model_active w-full"
								onClick={handleVersionChoice}
							>
								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : 'Maintain Same Version'}
							</button>
							<button
								className="btn_model_outline w-full"
								onClick={handleCreateNewVersion}
								disabled={loadingc}
							>
								{loadingc ? <SVGLoader width="30px" height="30px" color="#000" /> : 'Create New Version'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default VersionPromptModal;
