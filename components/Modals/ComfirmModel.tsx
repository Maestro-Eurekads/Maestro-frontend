// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import { useActive } from '../../app/utils/ActiveContext';
// import { CheckCircle, X } from "lucide-react";
// import { useVersionContext } from 'app/utils/VersionApprovalContext';
// import { SVGLoader } from 'components/SVGLoader';
// import { useCampaigns } from 'app/utils/CampaignsContext';
// import { removeKeysRecursively } from 'utils/removeID';
// import { useUserPrivileges } from 'utils/userPrivileges';
// import { toast } from 'sonner';
// import axios from 'axios';

// const ComfirmModel = ({ isOpen, setIsOpen }) => {
// 	const { createCampaignVersion, getCampaignVersion, isLoading, version, getLoading, setdocumentId, updateCampaignVersion, createsSuccess, updateSuccess, updateLoading } = useVersionContext();
// 	const router = useRouter();
// 	const { setActive, setSubStep } = useActive();
// 	const [showVersionPrompt, setShowVersionPrompt] = useState(false);
// 	const [currentVersion, setCurrentVersion] = useState(null);
// 	const [clientId, setClientId] = useState<number | null>(null);
// 	const [KeepVersionLoading, setKeepVersionLoading] = useState(false);
// 	const { loggedInUser } = useUserPrivileges();
// 	const {
// 		createCampaign,
// 		updateCampaign,
// 		campaignData,
// 		campaignFormData,
// 		cId,
// 		getActiveCampaign,
// 		copy,
// 		setCampaignFormData,
// 		isLoading: isLoadingCampaign, jwt
// 	} = useCampaigns();
// 	// const {
// 	// 			clientCampaignData,
// 	// 			campaignData,
// 	// 			isLoading: isLoadingCampaign,
// 	// 			campaignFormData,
// 	// 	} = useCampaigns();


// 	const getNextVersion = (v) => {
// 		const number = parseInt(v?.replace('v', '')) || 0;
// 		return `v${number + 1}`;
// 	};
// 	const newVersion = getNextVersion(currentVersion);
// 	const [loading, setLoading] = useState(false);
// 	const query = useSearchParams();
// 	const campaignId = query.get("campaignId");
// 	const documentId = campaignData?.documentId;
// 	const plan_name = campaignData?.media_plan_details.plan_name

// 	// //console.log('campaignFormData', campaignFormData)


// 	// Set client ID from campaignData in useEffect
// 	// useEffect(() => {
// 	// 	if (createsSuccess || updateSuccess) {
// 	// 		setShowVersionPrompt(false)
// 	// 		setIsOpen(false)
// 	// 	}
// 	// }, [createsSuccess || updateSuccess]);


// 	useEffect(() => {
// 		if (campaignData?.client?.id) {
// 			setClientId(campaignData?.client?.id?.toString());
// 		}
// 	}, [campaignData]);
// 	// useEffect(() => {
// 	// 	const fetchVersionData = async () => {
// 	// 		const versions = await getCampaignVersion(campaignId);
// 	// 		if (version && version.length > 0) {
// 	// 			setCurrentVersion(version[version.length - 1].version.version_number);
// 	// 			setdocumentId(version[0]?.documentId);
// 	// 			setShowVersionPrompt(true);
// 	// 		}
// 	// 	};

// 	// 	fetchVersionData();
// 	// }, [isOpen, campaignId]);


// 	const handleBackClick = () => {
// 		setActive(0);
// 		setSubStep(0);
// 		setIsOpen(false);
// 		router.push('/');
// 	};






// 	const handleApproval = () => {
// 		setShowVersionPrompt(true);
// 	};

// 	const handleKeepVersion = () => {
// 		setKeepVersionLoading(true);
// 		setTimeout(() => {
// 			setActive(0);
// 			setSubStep(0);
// 			setIsOpen(false);
// 			router.push('/');
// 			setKeepVersionLoading(false);
// 		}, 3000);
// 	};





// 	const handlePlan = async () => {
// 		setLoading(true);

// 		try {
// 			const patchData = {
// 				isApprove: true,
// 				media_plan_details: {
// 					plan_name: campaignData?.media_plan_details?.plan_name,
// 					internal_approver: (campaignData?.media_plan_details?.internal_approver || [])
// 						.map((approver) => String(approver.id)),
// 					client_approver: (campaignData?.media_plan_details?.client_approver || [])
// 						.map((approver) => String(approver.id)),
// 					approved_by: [String(loggedInUser?.id)],
// 				},
// 			};

// 			// Update local state and localStorage
// 			const updatedFormData = {
// 				...campaignFormData,
// 				media_plan_details: {
// 					...campaignFormData?.media_plan_details,
// 				},
// 			};

// 			setCampaignFormData(updatedFormData);
// 			// localStorage.setItem("campaignFormData", JSON.stringify(updatedFormData));

// 			// PUT request to Strapi with only updated fields
// 			if (cId) {
// 				await axios.put(
// 					`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
// 					{ data: patchData },
// 					{
// 						headers: {
// 							Authorization: `Bearer ${jwt}`,
// 						},
// 					}
// 				);

// 				setIsOpen(false);
// 				toast.success("Plan Approved!");
// 				getActiveCampaign(campaignId);
// 			}
// 		} catch (error) {
// 			if (error?.response?.status === 401) {
// 				const event = new Event("unauthorizedEvent");
// 				window.dispatchEvent(event);
// 			}
// 			toast.error(error?.message || "Failed to approve plan");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};





// 	if (!isOpen) return null;

// 	return (
// 		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
// 			<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">

// 				{/* Cancel button */}
// 				<button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
// 					<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
// 				</button>


// 				{/* Green check icon */}
// 				<div className="w-full flex justify-center pt-2">
// 					<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
// 						<CheckCircle className="text-green-600 w-7 h-7" />
// 					</div>
// 				</div>


// 				{/* Title & Description */}
// 				<h2 className="text-xl font-semibold text-[#181D27] mb-2">
// 					Media plan completed, well done!
// 				</h2>
// 				<p className="text-sm text-[#535862] mb-4">
// 					You’ve successfully completed the setup of your media plan. Ready to move forward?
// 				</p>

// 				{/* Version info */}
// 				<div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
// 					{getLoading ? <SVGLoader width={"40px"} height={"40px"} color={"#0866FF"} /> :
// 						<span className="font-medium"> </span>
// 					}

// 				</div>

// 				{/* Actions */}
// 				<div className="flex justify-between gap-4">
// 					<button className="btn_model_outline w-full" onClick={handleBackClick}>
// 						Back to Dashboard
// 					</button>
// 					<button className="btn_model_active w-full" onClick={handlePlan}>
// 						{loading ? <SVGLoader width={"30px"} height={"30px"} color={"#fff"} /> :
// 							<span className="font-medium">Approval</span>
// 						}
// 					</button>
// 				</div>



// 				{/* Version choice prompt */}
// 				{/* {showVersionPrompt && (
// 					<div className=" fixed inset-0  bg-black bg-opacity-40 flex items-center justify-center z-50">
// 						<div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">
// 							<button onClick={() => setShowVersionPrompt(false)} className="absolute top-4 right-4">
// 								<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
// 							</button>
// 							<h3 className="text-lg font-semibold mb-3">
// 								This plan is already approved
// 							</h3>
// 							<p className="text-sm text-gray-600 mb-4">
// 								(Current version: <strong>{currentVersion}</strong>). Would you like to keep it or create a new one?
// 							</p>
// 							<div className="flex gap-4">
// 								<button className="btn_model_outline w-full" onClick={handleKeepVersion}>
// 									{KeepVersionLoading ? <SVGLoader width={"30px"} height={"30px"} color={"#fff"} /> : "	Keep Current"}
// 								</button>
// 								{currentVersion ? <button className="btn_model_active w-full" onClick={handleUpdateVersion}>
// 									{updateLoading ? <SVGLoader width={"30px"} height={"30px"} color={"#fff"} /> : "Update Version"}
// 								</button> : <button className="btn_model_active w-full" onClick={handleCreateNewVersion}>
// 									{isLoading ? <SVGLoader width={"30px"} height={"30px"} color={"#fff"} /> : "New Version"}
// 								</button>}

// 							</div>
// 						</div>
// 					</div>
// 				)} */}

// 			</div>
// 		</div>
// 	);
// };

// export default ComfirmModel;


'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useActive } from '../../app/utils/ActiveContext';
import { CheckCircle, X } from "lucide-react";
import { useVersionContext } from 'app/utils/VersionApprovalContext';
import { SVGLoader } from 'components/SVGLoader';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { toast } from 'sonner';
import axios from 'axios';
import { useUserPrivileges } from 'utils/userPrivileges';

const ComfirmModel = ({ isOpen, setIsOpen }) => {
	const router = useRouter();
	const { setActive, setSubStep } = useActive();
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<'creator' | 'internal_approver' | 'client'>('creator');
	const [statusMessage, setStatusMessage] = useState('');
	const [title, setTitle] = useState('');

	const query = useSearchParams();
	const campaignId = query.get("campaignId");

	const {
		campaignData,
		campaignFormData,
		setCampaignFormData,
		cId,
		getActiveCampaign,
		jwt
	} = useCampaigns();

	const { loggedInUser, isAdmin, isClient, isFinancialApprover } = useUserPrivileges();

	useEffect(() => {
		if (!campaignData) return;

		const lastStatus = campaignData?.isStatus?.slice(-1)?.[0];

		if (!lastStatus || lastStatus.stage === 'draft') {
			setStep('creator');
			setTitle('Media plan completed, well done!');
			setStatusMessage('Ready to ask for approval?');
		} else if (lastStatus.stage === 'in_internal_review' && (isAdmin || isFinancialApprover || isClient)) {
			setStep('internal_approver');
			setTitle('Internal Approval Required');
			setStatusMessage('Do you want to approve internally and share to client?');
		} else if (lastStatus.stage === 'shared_with_client' && isClient) {
			setStep('client');
			setTitle('Client Approval Needed');
			setStatusMessage('Please approve the media plan or request changes.');
		}
	}, [campaignData]);

	const updateStatus = async (stage, label) => {
		if (!cId) return;
		setLoading(true);
		try {
			const newStatus = {
				id: Date.now(),
				stage,
				label,
				actor: {
					id: loggedInUser?.id,
					name: loggedInUser?.username,
					role: loggedInUser?.user_type,
				},
				date: new Date().toISOString(),
			};

			const existingStatus = campaignData?.isStatus || [];
			const updatedStatus = [...existingStatus, newStatus];

			await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`, {
				data: {
					isStatus: updatedStatus,
				}
			}, {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			});

			getActiveCampaign(campaignId);
			setIsOpen(false);
			toast.success(`Media plan marked as '${label}'`);
		} catch (error) {
			if (error?.response?.status === 401) {
				const event = new Event("unauthorizedEvent");
				window.dispatchEvent(event);
			}
			toast.error("Failed to update status");
		} finally {
			setLoading(false);
		}
	};

	const handleAction = async () => {
		if (step === 'creator') {
			await updateStatus('in_internal_review', 'In Internal Review');
		} else if (step === 'internal_approver') {
			await updateStatus('shared_with_client', 'Shared with Client');
		} else if (step === 'client') {
			await updateStatus('approved', 'Approved');
		}
	};

	const handleRequestChanges = async () => {
		const changeStage = step === 'client' ? 'client_changes_needed' : 'changes_needed';
		const label = step === 'client' ? 'Client Changes Needed' : 'Changes Needed';
		await updateStatus(changeStage, label);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
				<button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
					<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
				</button>

				<div className="w-full flex justify-center pt-2">
					<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
						<CheckCircle className="text-green-600 w-7 h-7" />
					</div>
				</div>

				<h2 className="text-xl font-semibold text-[#181D27] mb-2">
					{!title ? "Ask for Approval" : title}
				</h2>
				<p className="text-sm text-[#535862] mb-4">
					{!statusMessage ? "You’ve successfully completed the setup of your media plan. Ready to move forward?" : statusMessage}
				</p>

				<div className="flex flex-col gap-4">
					<button className="btn_model_active w-full" onClick={handleAction}>
						{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> :
							<span className="font-medium">
								{step === 'creator' && 'Ask for Approval'}
								{step === 'internal_approver' && 'Share with Client'}
								{step === 'client' && 'Approve'}
							</span>}
					</button>
					{step !== 'creator' && (
						<button className="btn_model_outline w-full" onClick={handleRequestChanges}>
							{loading ? <SVGLoader width="30px" height="30px" color="#000" /> :
								'Request Changes'}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ComfirmModel;
