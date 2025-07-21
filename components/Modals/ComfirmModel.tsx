


'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useActive } from '../../app/utils/ActiveContext';
import { CheckCircle, X } from 'lucide-react';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { toast } from 'sonner';
import axios from 'axios';
import { useUserPrivileges } from 'utils/userPrivileges';
import { SVGLoader } from 'components/SVGLoader';
import { updateUsersWithCampaign } from 'app/homepage/functions/clients';
import { extractObjectives, getFilteredMetrics } from 'app/creation/components/EstablishedGoals/table-view/data-processor';
import { removeKeysRecursively } from 'utils/removeID';

const ComfirmModel = ({ isOpen, setIsOpen }) => {
	const [loading, setLoading] = useState(false);
	const [loadings, setLoadings] = useState(false);
	const [step, setStep] = useState<'creator' | 'internal_approver' | 'client' | null>(null);
	const [statusMessage, setStatusMessage] = useState('');
	const [title, setTitle] = useState('');
	const [showSharePrompt, setShowSharePrompt] = useState(false);
	const [showVersionPrompt, setShowVersionPrompt] = useState(false);
	const [showPlanInfoModal, setShowPlanInfoModal] = useState(false);
	const query = useSearchParams();
	const campaignId = query.get('campaignId');

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
		loggedInUser,
		isAdmin,
		isAgencyCreator,
		isAgencyApprover,
		isFinancialApprover,
		isClientApprover,
		isClient,
		userID,

	} = useUserPrivileges();

	const isInternalApprover = isAdmin || isAgencyApprover || isFinancialApprover;
	const isCreator = isAgencyCreator;
	const [versionAction, setVersionAction] = useState<'maintain' | 'new' | null>(null);



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




	const handleCreateNewVersion = async () => {
		setLoadings(true);

		try {
			// Get current version from existing campaignData or default to V1
			const currentVersionNumber = Number((campaignData?.campaign_version || 'V1').replace('V', ''));
			const newVersionNumber = currentVersionNumber + 1;
			const versionLabel = `V${newVersionNumber}`; // This will be used as string in payload

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
						campaignFormData?.progress_percent > calcPercent
							? campaignFormData?.progress_percent
							: calcPercent,
					campaign_version: versionLabel, // Set string "V2", "V3", etc.
				},
			};

			const config = {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			};

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
			toast.success(`New Version (${versionLabel}) created successfully!`);
			clearChannelStateForNewCampaign?.();

			setChange(false);
			setShowSave(false);
		} catch (error: any) {
			if (error?.response?.status === 401) {
				window.dispatchEvent(new Event("unauthorizedEvent"));
			}
			toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
			setIsOpen(false);
			setLoadings(false);
			setShowSave(false);
			setChange(false);
			setShowVersionPrompt(false);
		} finally {
			setIsOpen(false);
			setLoadings(false);
			setShowSave(false);
			setChange(false);
			setShowVersionPrompt(false);
		}
	};



	const stage = campaignData?.isStatus?.stage;

	// Check if user is an assigned approver
	const isAssignedInternalApprover =
		isInternalApprover &&
		campaignData?.media_plan_details?.internal_approver?.includes(String(loggedInUser?.id));
	const isAssignedClientApprover =
		isClient && campaignData?.media_plan_details?.client_approver?.includes(String(loggedInUser?.id));
	const isNotApprover =
		!campaignData?.media_plan_details?.internal_approver?.includes(String(loggedInUser?.id)) &&
		!campaignData?.media_plan_details?.client_approver?.includes(String(loggedInUser?.id));

	useEffect(() => {
		if (!campaignData || !isOpen) return;

		if (stage === 'approved') {
			setShowVersionPrompt(true);
			setIsOpen(true);
			setStep(null);
			return;
		}

		if (!stage || stage === 'draft') {
			if (isCreator || isNotApprover || isInternalApprover || isAdmin) {
				setStep('creator');
				setTitle('Media plan completed, well done!');
				setStatusMessage('Ready to ask for approval?');
			} else {
				toast.error('Only the campaign creator who is not an approver can request approval.');
				setIsOpen(false);
			}
			return;
		}

		if (isInternalApprover || isAdmin) {
			setStep('internal_approver');
			setTitle('Review Media Plan');
			setStatusMessage('Do you want to approve internally or request changes?');
		} else if (isClientApprover) {
			setStep('client');
			setTitle('Review Media Plan');
			setStatusMessage('Do you want to approve the media plan or request changes?');
		} else {
			toast.error('You are not authorized to take action on this plan.');
			setIsOpen(false);
		}
	}, [
		stage,
		isCreator,
		isAssignedInternalApprover,
		isAssignedClientApprover,
		isNotApprover,
		isOpen,
		setIsOpen,
		campaignData,
		isAdmin,
		isInternalApprover,
		isClientApprover,
		isClient,
	]);

	const updateStatus = async (stage, label, versionData = null) => {
		if (!cId) {
			toast.error('No campaign ID provided.');
			return;
		}
		setLoading(true);

		try {
			const newStatus = {
				stage,
				label,
				actor: {
					id: loggedInUser?.id,
					name: loggedInUser?.username,
					role: loggedInUser?.user_type,
				},
				date: new Date().toISOString(),
			};

			const basePatchData: any = {
				isStatus: newStatus,
				...(stage === 'shared_with_client' && { isApprove: true }),
			};

			if (stage === 'internally_approved') {
				basePatchData.media_plan_details = {
					plan_name: campaignData?.media_plan_details?.plan_name || '',
					internal_approver: (campaignData?.media_plan_details?.internal_approver || []).map(
						(approver) => String(approver.id)
					),
					client_approver: (campaignData?.media_plan_details?.client_approver || []).map(
						(approver) => String(approver.id)
					),
					approved_by: [String(loggedInUser?.id)],
				};
			}

			if (versionData) {
				basePatchData.campaign_version = versionData.version.toString();
			}

			await axios.put(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
				{ data: basePatchData },
				{
					headers: {
						Authorization: `Bearer ${jwt}`,
					},
				}
			);

			getActiveCampaign(campaignId);
			setIsOpen(false);
			setShowVersionPrompt(false);
			toast.success(`Media plan marked as '${label}'${versionData ? `: ${versionData.plan_name}` : ''}`);
		} catch (error) {
			if (error?.response?.status === 401) {
				const event = new Event('unauthorizedEvent');
				window.dispatchEvent(event);
			} else {
				toast.error(error?.message || 'Failed to update status');
			}
		} finally {
			setLoading(false);
		}
	};

	const updateVersion = async (stage, label, versionData = null) => {
		if (!cId) {
			toast.error('No campaign ID provided.');
			return;
		}
		setLoading(true);

		try {
			const basePatchData = { campaign_version: versionData.version };

			await axios.put(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
				{ data: basePatchData },
				{
					headers: {
						Authorization: `Bearer ${jwt}`,
					},
				}
			);

			getActiveCampaign(campaignId);
			setIsOpen(false);
			setShowVersionPrompt(false);
			toast.success(`Media plan marked as '${label}'${versionData ? `: ${versionData.plan_name}` : ''}`);
		} catch (error) {
			if (error?.response?.status === 401) {
				const event = new Event('unauthorizedEvent');
				window.dispatchEvent(event);
			} else {
				toast.error(error?.message || 'Failed to update status');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleSaveWithVersion = async () => {
		if (stage === 'approved') {
			toast.error('This plan has been approved.');
			setIsOpen(false);
			return;
		}

		if (!campaignData?.campaign_version) {
			await updateStatus('in_internal_review', 'In Internal Review');
			toast.success('Media plan submitted for internal review.');
			return;
		}

		toast.info('Please choose to maintain the same version or create a new one.');
		setShowVersionPrompt(true);
	};

	const handleVersionChoice = async (choice) => {
		if (choice === 'maintain') {
			toast.success('Media plan updated and submitted for internal review.');
		} else {
			const currentVersion = campaignData?.campaign_version || 1;
			const newVersion = currentVersion + 1;
			const versionData = {
				plan_name: `Media Plan V${newVersion}`,
				version: newVersion,
			};
			await updateVersion('approved', 'Approved', versionData);
			toast.success(`New version created: Media Plan V${newVersion}`);
		}
		setVersionAction(null);
		setShowVersionPrompt(false);
	};

	const handleAction = async () => {
		if (stage === 'approved') {
			toast.error('This plan has been approved.');
			setIsOpen(false);
			return;
		}

		if (step === 'creator') {
			await handleSaveWithVersion();
		} else if (step === 'internal_approver') {
			if (isAdmin || isAssignedInternalApprover) {
				await updateStatus('internally_approved', 'Internally Approved');
				toast.success('Media plan approved internally.');
				setIsOpen(false);
				setShowSharePrompt(true);
			} else {
				toast.error('You are not authorized to approve this plan.');
				setIsOpen(false);
			}
		} else if (step === 'client') {
			if (isAdmin || isAssignedClientApprover) {
				await updateStatus('approved', 'Approved');
				toast.success('Media plan approved by client.');
			} else {
				toast.error('You are not authorized to approve this plan.');
				setIsOpen(false);
			}
		}
	};

	const handleRequestChanges = async () => {
		if (stage === 'approved') {
			toast.error('This plan has been approved.');
			setIsOpen(false);
			return;
		}

		const changeStage = step === 'client' ? 'client_changes_needed' : 'changes_needed';
		const label = step === 'client' ? 'Client Changes Needed' : 'Changes Needed';
		await updateStatus(changeStage, label);
		toast.success(`Requested changes for the media plan: ${label}`);
	};



	if (!isOpen) return null;

	return (
		<>
			{/* Plan Information Modal */}
			{showPlanInfoModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
						<button
							onClick={() => {
								toast.info('Plan information modal closed.');
								setShowPlanInfoModal(false);
								setIsOpen(false); // Close the main modal as well
							}}
							className="absolute top-4 right-4"
						>
							<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
						</button>
						<h2 className="text-xl font-semibold text-[#181D27] mb-2">Plan Information</h2>
						<div className="text-sm text-[#535862] mb-4 text-left">
							<p>
								<strong>Plan Name:</strong> {campaignData?.media_plan_details?.plan_name || 'N/A'}
							</p>
							<p>
								<strong>Current Version:</strong> Media Plan V{campaignData?.campaign_version || '1'}
							</p>
							<p>
								<strong>Status:</strong> {campaignData?.isStatus?.label || 'Draft'}
							</p>
							<p>
								<strong>Internal Approvers:</strong>
								{campaignData?.media_plan_details?.internal_approver?.length
									? campaignData?.media_plan_details?.internal_approver
										.map((user) => user?.username)
										.join(', ')
									: 'None'}
							</p>
							<p>
								<strong>Client Approvers:</strong>{' '}
								{campaignData?.media_plan_details?.client_approver?.length
									? campaignData?.media_plan_details?.client_approver
										.map((user) => user?.username)
										.join(', ')
									: 'None'}
							</p>


						</div>
						<div className="flex flex-col gap-4">
							<button
								className="btn_model_active w-full"
								onClick={() => {
									toast.info('Plan information modal closed.');
									setShowPlanInfoModal(false);
									setIsOpen(false);
								}}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Version Prompt Modal */}
			{showVersionPrompt && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
						<button
							onClick={() => {
								toast.info('Version selection cancelled.');
								setShowVersionPrompt(false);
								setShowPlanInfoModal(true);
							}}
							className="absolute top-4 right-4"
						>
							<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
						</button>
						<h2 className="text-xl font-semibold text-[#181D27] mb-2">Version Control</h2>
						<p className="text-sm text-[#535862] mb-4">
							Do you want to maintain the same version or create a new version?
						</p>
						{campaignData?.campaign_version && (
							<p className="text-xs text-[#717A8C] mt-1">
								Current version: <span className="font-semibold">Media Plan V{campaignData.campaign_version}</span>
							</p>
						)}

						<div className="flex flex-col gap-4">
							<button
								className="btn_model_active w-full"
								onClick={() => handleVersionChoice('maintain')}
							>
								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : 'Maintain Same Version'}
							</button>
							<button
								className="btn_model_outline w-full"
								onClick={() => handleCreateNewVersion()}
							>
								{loadings ? <SVGLoader width="30px" height="30px" color="#000" /> : 'Create New Version'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Other Modals */}

			{showVersionPrompt ? null : stage === 'shared_with_client' ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
						<button
							onClick={() => {
								toast.success('Client review acknowledged.');
								setIsOpen(false);
							}}
							className="absolute top-4 right-4"
						>
							<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
						</button>
						<div className="w-full flex justify-center pt-2">
							<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
								<CheckCircle className="text-blue-600 w-7 h-7" />
							</div>
						</div>
						<h2 className="text-xl font-semibold text-[#181D27] mb-2">Media Plan Shared with Client</h2>
						<p className="text-sm text-[#535862] mb-4">
							The media plan has been shared with the client and is under review.
						</p>
						<div className="flex flex-col gap-4 mt-4">
							<button
								className="btn_model_active w-full"
								onClick={() => setIsOpen(false)}
							>
								OK
							</button>
						</div>
					</div>
				</div>
			) : (stage === 'internally_approved' || step === 'internal_approver') && showSharePrompt ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
						<button
							onClick={() => {
								toast.info('Share with client cancelled.');
								setIsOpen(false);
							}}
							className="absolute top-4 right-4"
						>
							<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
						</button>
						<div className="w-full flex justify-center pt-2">
							<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
								<CheckCircle className="text-green-600 w-7 h-7" />
							</div>
						</div>
						<h2 className="text-xl font-semibold text-[#181D27] mb-2">Approved Internally!</h2>
						<p className="text-sm text-[#535862] mb-4">Do you want to share with the client now?</p>
						<div className="flex flex-col gap-4">
							<button
								className="btn_model_active w-full"
								onClick={async () => {
									await updateStatus('shared_with_client', 'Shared with Client');
									toast.success('Media plan shared with the client.');
									setShowSharePrompt(false);
								}}
							>
								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : 'Share with Client'}
							</button>
							<button className="btn_model_outline w-full" onClick={handleRequestChanges}>
								{loading ? <SVGLoader width="30px" height="30px" color="#000" /> : 'Request Changes'}
							</button>
						</div>
					</div>
				</div>
			) : (stage !== "approved" &&
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
						<button
							onClick={() => {
								toast.info('Action cancelled.');
								setIsOpen(false);
							}}
							className="absolute top-4 right-4"
						>
							<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
						</button>
						<div className="w-full flex justify-center pt-2">
							<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
								<CheckCircle className="text-green-600 w-7 h-7" />
							</div>
						</div>
						<h2 className="text-xl font-semibold text-[#181D27] mb-2">
							{!title ? 'Ask for Approval' : title}
						</h2>
						<p className="text-sm text-[#535862] mb-4">
							{!statusMessage
								? 'You’ve successfully completed the setup of your media plan. Ready to move forward?'
								: statusMessage}
						</p>
						<div className="flex flex-col gap-4">
							<button
								className={`btn_model_active w-full ${step === 'creator' ||
									isAdmin ||
									(step === 'internal_approver' && isAssignedInternalApprover) ||
									(step === 'client' && isAssignedClientApprover)
									? ''
									: 'opacity-50 cursor-not-allowed'
									}`}
								onClick={handleAction}
								disabled={
									!(
										step === 'creator' ||
										isAdmin ||
										(step === 'internal_approver' && isAssignedInternalApprover) ||
										(step === 'client' && isAssignedClientApprover)
									)
								}
							>
								{loading ? (
									<SVGLoader width="30px" height="30px" color="#fff" />
								) : (
									<span className="font-medium">
										{step === 'creator' && 'Ask for Approval'}
										{step === 'internal_approver' && 'Approve Internally'}
										{step === 'client' && 'Approve'}
									</span>
								)}
							</button>
							{step !== 'creator' && (
								<button className="btn_model_outline w-full" onClick={handleRequestChanges}>
									{loading ? <SVGLoader width="30px" height="30px" color="#000" /> : 'Request Changes'}
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ComfirmModel;