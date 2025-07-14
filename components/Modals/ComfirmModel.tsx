

// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import { useActive } from '../../app/utils/ActiveContext';
// import { CheckCircle, X } from "lucide-react";
// import { useVersionContext } from 'app/utils/VersionApprovalContext';
// import { SVGLoader } from 'components/SVGLoader';
// import { useCampaigns } from 'app/utils/CampaignsContext';
// import { toast } from 'sonner';
// import axios from 'axios';
// import { useUserPrivileges } from 'utils/userPrivileges';

// const ComfirmModel = ({ isOpen, setIsOpen }) => {
// 	const router = useRouter();
// 	const { setActive, setSubStep } = useActive();
// 	const [loading, setLoading] = useState(false);
// 	const [step, setStep] = useState<'creator' | 'internal_approver' | 'client'>('creator');
// 	const [statusMessage, setStatusMessage] = useState('');
// 	const [title, setTitle] = useState('');
// 	const [showSharePrompt, setShowSharePrompt] = useState(false);

// 	const query = useSearchParams();
// 	const campaignId = query.get("campaignId");

// 	const {
// 		campaignData,
// 		campaignFormData,
// 		setCampaignFormData,
// 		cId,
// 		getActiveCampaign,
// 		jwt
// 	} = useCampaigns();

// 	const {
// 		loggedInUser,
// 		isAdmin,
// 		isAgencyCreator,
// 		isAgencyApprover,
// 		isFinancialApprover,
// 		isClientApprover,
// 		isClient,
// 		userID
// 	} = useUserPrivileges();

// 	const isInternalApprover = isAdmin || isAgencyApprover || isFinancialApprover;
// 	const isCreator = isAgencyCreator;


// 	const stage = campaignData?.isStatus?.stage;





// 	useEffect(() => {
// 		if (!campaignData) return;

// 		switch (stage) {
// 			case 'draft':
// 				if (isCreator) {
// 					setStep('creator');
// 					setTitle('Media plan completed, well done!');
// 					setStatusMessage('Ready to ask for approval?');
// 				}
// 				break;

// 			case 'in_internal_review':
// 				if (isInternalApprover) {
// 					setStep('internal_approver');
// 					setTitle('Internal Approval Required');
// 					setStatusMessage('Do you want to approve internally or request changes?');
// 				}
// 				break;

// 			case 'internally_approved':
// 				if (isInternalApprover) {
// 					setStep('internal_approver');
// 					setTitle('Approved Internally!');
// 					setStatusMessage('Do you want to share with the client now?');
// 					setShowSharePrompt(true); // Open modal to share
// 				}
// 				break;

// 			case 'shared_with_client':
// 				if (isClient) {
// 					setStep('client');
// 					setTitle('Client Approval Needed');
// 					setStatusMessage('Please approve the media plan or request changes.');
// 				}
// 				break;

// 			case 'changes_needed':
// 				if (isInternalApprover) {
// 					setStep('internal_approver');
// 					setTitle('Changes Requested');
// 					setStatusMessage('Changes have been requested. Please review and update.');
// 				}
// 				break;

// 			case 'client_changes_needed':
// 				if (isClient) {
// 					setStep('client');
// 					setTitle('Client Requested Changes');
// 					setStatusMessage('Please review the requested changes from the client.');
// 				}
// 				break;

// 			case 'approved':
// 				// Final stage, no further action
// 				setStep(null);
// 				break;

// 			default:
// 				setStep(null);
// 				break;
// 		}
// 	}, [stage]);




// 	const updateStatus = async (stage, label) => {
// 		if (!cId) return;
// 		setLoading(true);

// 		try {
// 			const newStatus = {
// 				stage,
// 				label,
// 				actor: {
// 					id: loggedInUser?.id,
// 					name: loggedInUser?.username,
// 					role: loggedInUser?.user_type,
// 				},
// 				date: new Date().toISOString(),
// 			};

// 			// Start with base patch data
// 			const basePatchData: any = {
// 				isStatus: newStatus,
// 				...(stage === 'shared_with_client' && { isApprove: true }),
// 			};

// 			// Add media_plan_details only if stage is internal_approver
// 			if (stage === 'internally_approved') {
// 				basePatchData.media_plan_details = {
// 					plan_name: campaignData?.media_plan_details?.plan_name || '',
// 					internal_approver: (campaignData?.media_plan_details?.internal_approver || []).map(
// 						(approver) => String(approver.id)
// 					),
// 					client_approver: (campaignData?.media_plan_details?.client_approver || []).map(
// 						(approver) => String(approver.id)
// 					),
// 					approved_by: [String(loggedInUser?.id)],
// 				};
// 			}

// 			await axios.put(
// 				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
// 				{ data: basePatchData },
// 				{
// 					headers: {
// 						Authorization: `Bearer ${jwt}`,
// 					},
// 				}
// 			);

// 			getActiveCampaign(campaignId);
// 			setIsOpen(false);
// 			toast.success(`Media plan marked as '${label}'`);
// 		} catch (error) {
// 			if (error?.response?.status === 401) {
// 				const event = new Event("unauthorizedEvent");
// 				window.dispatchEvent(event);
// 			}
// 			toast.error(error?.message || "Failed to update status");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};






// 	const handleAction = async () => {
// 		if (step === 'creator') {
// 			await updateStatus('in_internal_review', 'In Internal Review');
// 		} else if (step === 'internal_approver') {
// 			if (isInternalApprover) {
// 				await updateStatus('internally_approved', 'Internally Approved');
// 				setIsOpen(false);
// 				setShowSharePrompt(true);
// 			} else {
// 				await updateStatus('shared_with_client', 'Shared with Client');
// 			}
// 		} else if (step === 'client') {
// 			await updateStatus('approved', 'Approved');
// 		}
// 	};

// 	const handleRequestChanges = async () => {
// 		const changeStage = step === 'client' ? 'client_changes_needed' : 'changes_needed';
// 		const label = step === 'client' ? 'Client Changes Needed' : 'Changes Needed';
// 		await updateStatus(changeStage, label);
// 	};

// 	if (!isOpen) return null;

// 	return (
// 		<>
// 			{stage === "internally_approved" && isOpen ?
// 				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
// 					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
// 						<button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
// 							<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
// 						</button>

// 						<div className="w-full flex justify-center pt-2">
// 							<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
// 								<CheckCircle className="text-green-600 w-7 h-7" />
// 							</div>
// 						</div>

// 						<h2 className="text-xl font-semibold text-[#181D27] mb-2">Approved Internally!</h2>
// 						<p className="text-sm text-[#535862] mb-4">Do you want to share with the client now?</p>

// 						<div className="flex flex-col gap-4">
// 							<button
// 								className="btn_model_active w-full"
// 								onClick={async () => {
// 									await updateStatus('shared_with_client', 'Shared with Client');
// 									setShowSharePrompt(false);
// 								}}
// 							>
// 								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : 'Share with Client'}
// 							</button>
// 							<button className="btn_model_outline w-full" onClick={handleRequestChanges}>
// 								{loading ? <SVGLoader width="30px" height="30px" color="#000" /> : 'Request Changes'}
// 							</button>
// 						</div>
// 					</div>
// 				</div> :
// 				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
// 					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
// 						<button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
// 							<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
// 						</button>

// 						<div className="w-full flex justify-center pt-2">
// 							<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
// 								<CheckCircle className="text-green-600 w-7 h-7" />
// 							</div>
// 						</div>

// 						<h2 className="text-xl font-semibold text-[#181D27] mb-2">
// 							{!title ? "Ask for Approval" : title}
// 						</h2>
// 						<p className="text-sm text-[#535862] mb-4">
// 							{!statusMessage ? "You’ve successfully completed the setup of your media plan. Ready to move forward?" : statusMessage}
// 						</p>

// 						<div className="flex flex-col gap-4">
// 							<button className="btn_model_active w-full" onClick={handleAction}>
// 								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> :
// 									<span className="font-medium">
// 										{step === 'creator' && 'Ask for Approval'}
// 										{step === 'internal_approver' &&
// 											(isInternalApprover ? 'Approve Internally' : 'Share with Client')}
// 										{step === 'client' && 'Approve'}
// 									</span>}
// 							</button>
// 							{step !== 'creator' && (
// 								<button className="btn_model_outline w-full" onClick={handleRequestChanges}>
// 									{loading ? <SVGLoader width="30px" height="30px" color="#000" /> : 'Request Changes'}
// 								</button>
// 							)}
// 						</div>
// 					</div>
// 				</div>}

// 		</>
// 	);
// };

// export default ComfirmModel;


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

const ComfirmModel = ({ isOpen, setIsOpen }) => {
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<'creator' | 'internal_approver' | 'client' | null>(null);
	const [statusMessage, setStatusMessage] = useState('');
	const [title, setTitle] = useState('');
	const [showSharePrompt, setShowSharePrompt] = useState(false);
	const [showVersionPrompt, setShowVersionPrompt] = useState(false);
	const [showPlanInfoModal, setShowPlanInfoModal] = useState(false); // New state for plan info modal
	const [versionAction, setVersionAction] = useState<'maintain' | 'new' | null>(null);

	const query = useSearchParams();
	const campaignId = query.get('campaignId');

	const {
		campaignData,
		campaignFormData,
		setCampaignFormData,
		cId,
		getActiveCampaign,
		jwt,
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

	console.log('stage---stage', stage)
	console.log('showVersionPrompt----kk', showVersionPrompt)

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
									setIsOpen(false); // Close the main modal as well
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
								onClick={() => handleVersionChoice('new')}
							>
								{loading ? <SVGLoader width="30px" height="30px" color="#000" /> : 'Create New Version'}
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