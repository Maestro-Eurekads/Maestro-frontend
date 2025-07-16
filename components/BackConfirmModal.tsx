// components/BackConfirmModal.tsx
"use client";
import React, { useState } from "react";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useUserPrivileges } from "utils/userPrivileges";
import { toast } from "sonner";
import { useActive } from "app/utils/ActiveContext";
import axios from "axios";
import { updateUsersWithCampaign } from "app/homepage/functions/clients";
import { extractObjectives, getFilteredMetrics } from "app/creation/components/EstablishedGoals/table-view/data-processor";
import { removeKeysRecursively } from "utils/removeID";
import { SVGLoader } from "./SVGLoader";

interface BackConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const BackConfirmModal: React.FC<BackConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
	const { isClient, loggedInUser } = useUserPrivileges();
	const [loading, setLoading] = useState(false);
	const { setChange, showModal, setShowModal } = useActive()




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




	const handleSaveAllSteps = async () => {
		setLoading(true);

		try {
			// Clean up & transform fields from all steps
			const cleanedFormData = {
				...campaignFormData,
				internal_approver: campaignFormData?.internal_approver || [],
				client_approver: campaignFormData?.client_approver || [],
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
				},
			};

			const config = {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			};

			// CREATE or UPDATE logic
			// debugger;
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
			setShowModal(false);
		} catch (error: any) {
			if (error?.response?.status === 401) {
				window.dispatchEvent(new Event("unauthorizedEvent"));
			}
			toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
			setChange(false);
			setShowModal(false);
		} finally {
			setLoading(false);
			setChange(false);
			setShowModal(false);
		}
	};



	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
				<h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">Unsaved Changes</h2>

				<p className="text-sm text-gray-600 mb-1 text-center">If you leave the plan the progress will be lost</p>
				<p className="text-sm text-gray-600 mb-8 text-center">Would you like to save your progress?</p>

				<div className="flex flex-row gap-4">
					<button
						className="btn_model_outline w-full"
						onClick={onClose}
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
	);
};

export default BackConfirmModal;
