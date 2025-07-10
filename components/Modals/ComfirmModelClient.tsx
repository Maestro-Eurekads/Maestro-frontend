


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

const ComfirmModelClient = () => {
	const router = useRouter();
	const { setActive, setSubStep } = useActive();
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<'creator' | 'internal_approver' | 'client'>('creator');
	const [statusMessage, setStatusMessage] = useState('');
	const [title, setTitle] = useState('');
	const [show, setShow] = useState(false);
	const [showSharePrompt, setShowSharePrompt] = useState(false);

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

	const {
		loggedInUser,
		isAdmin,
		isAgencyCreator,
		isAgencyApprover,
		isFinancialApprover,
		isClientApprover,
		isClient,
		userID
	} = useUserPrivileges();

	const isInternalApprover = isAdmin || isAgencyApprover || isFinancialApprover;
	const isCreator = isAgencyCreator;

	const stage = campaignData?.isStatus?.stage;

	useEffect(() => {
		if (!campaignData) return;
		setStep('client');
		setTitle('Client Approval Needed');
		setStatusMessage('Please approve the media plan or request changes.');
	}, [campaignData?.isStatus?.stage, stage]);

	const updateStatus = async (stage, label) => {
		if (!campaignData?.documentId) return;
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

			const patchData = {
				isStatus: newStatus
			};

			await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignData?.documentId}`, {
				data: patchData,
			}, {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			});

			getActiveCampaign(campaignId);
			setShow(false);
			toast.success(`Media plan marked as '${label}'`);
		} catch (error) {
			if (error?.response?.status === 401) {
				const event = new Event("unauthorizedEvent");
				window.dispatchEvent(event);
			}
			toast.error(error?.message || "Failed to update status");
		} finally {
			setLoading(false);
		}
	};

	const handleAction = async () => {
		if (step === 'creator') {
			await updateStatus('in_internal_review', 'In Internal Review');
		} else if (step === 'internal_approver') {
			if (isInternalApprover) {
				await updateStatus('internally_approved', 'Internally Approved');
				setShow(false);
				setShowSharePrompt(true);
			} else {
				await updateStatus('shared_with_client', 'Shared with Client');
			}
		} else if (step === 'client') {
			await updateStatus('approved', 'Approved');
		}
	};

	const handleRequestChanges = async () => {
		const changeStage = step === 'client' ? 'client_changes_needed' : 'changes_needed';
		const label = step === 'client' ? 'Client Changes Needed' : 'Changes Needed';
		await updateStatus(changeStage, label);
	};


	return (
		<>
			<button
				className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
				style={{ border: "1px solid #3175FF" }}
				onClick={() => setShow(!show)}
			>
				{!show ? "See" : "Hide"} Plan approval
			</button>

			{show && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
						<button onClick={() => setShow(false)} className="absolute top-4 right-4">
							<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
						</button>

						<div className="w-full flex justify-center pt-2">
							<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
								<CheckCircle className="text-green-600 w-7 h-7" />
							</div>
						</div>

						<h2 className="text-xl font-semibold text-[#181D27] mb-2">{title}</h2>
						<p className="text-sm text-[#535862] mb-4">{statusMessage}</p>

						<div className="flex flex-col gap-4">
							<button className="btn_model_active w-full" onClick={handleAction}>
								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : (
									<span className="font-medium">
										{step === 'creator' && 'Ask for Approval'}
										{step === 'internal_approver' &&
											(isInternalApprover ? 'Approve Internally' : 'Share with Client')}
										{step === 'client' && 'Approve'}
									</span>
								)}
							</button>

						</div>
					</div>
				</div>
			)}

			{showSharePrompt && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
						<button onClick={() => setShowSharePrompt(false)} className="absolute top-4 right-4">
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
									setShowSharePrompt(false);
								}}
							>
								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : 'Share with Client'}
							</button>
							<button className="btn_model_outline w-full" onClick={handleAction}>
								{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : (
									<span className="font-medium">Approve Internally</span>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ComfirmModelClient;
