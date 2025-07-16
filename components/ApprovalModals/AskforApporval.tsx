'use client';

import { useCampaigns } from 'app/utils/CampaignsContext';
import axios from 'axios';
import { SVGLoader } from 'components/SVGLoader';
import { CheckCircle, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUserPrivileges } from 'utils/userPrivileges';
import Continue from "../../public/arrow-back-outline.svg"
import Image from "next/image"

const AskForApproval = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<'creator' | null>(null);
	const [statusMessage, setStatusMessage] = useState('');
	const [title, setTitle] = useState('');

	const query = useSearchParams();
	const campaignId = query.get('campaignId');

	const {
		campaignData,
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
		isClient
	} = useUserPrivileges();


	const stage = campaignData?.isStatus?.stage;
	// Check if user is an assigned approver
	const isInternalApprover = isAdmin || isAgencyApprover || isFinancialApprover;
	const isCreator = isAgencyCreator;
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

		if (!stage || stage === 'draft') {
			if (isCreator || isNotApprover || isInternalApprover || isAdmin) {
				setStep('creator');
				setTitle('Media plan completed, well done!');
				setStatusMessage('Ready to ask for approval?');
			} else {
				toast.error('Only the campaign creator can request approval.');
				setIsOpen(false);
			}
		} else {
			toast.error('You are not authorized to take action on this plan.');
			setIsOpen(false);
		}
	}, [stage, isCreator, isOpen, campaignData]);

	const updateStatus = async () => {
		if (!cId) {
			toast.error('No campaign ID provided.');
			return;
		}
		setLoading(true);

		try {
			const newStatus = {
				stage: 'in_internal_review',
				label: 'In Internal Review',
				actor: {
					id: loggedInUser?.id,
					name: loggedInUser?.username,
					role: loggedInUser?.user_type,
				},
				date: new Date().toISOString(),
			};

			await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`, {
				data: { isStatus: newStatus },
			}, {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			});

			await getActiveCampaign(campaignId);
			toast.success(`Media plan marked as 'In Internal Review'`);
			setIsOpen(false);
		} catch (error) {
			if (error?.response?.status === 401) {
				window.dispatchEvent(new Event('unauthorizedEvent'));
			} else {
				toast.error(error?.message || 'Failed to update status');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleAction = async () => {
		if (stage === 'approved') {
			toast.error('This plan has been approved.');
			setIsOpen(false);
			return;
		}
		if (step === 'creator') {
			await updateStatus();
		}
	};

	return (
		<>
			{/* This always renders */}
			<button className="bottom_black_next_btn hover:bg-blue-500 whitespace-nowrap" onClick={() => setIsOpen(true)}>
				<p>Ask for Approval</p>
				<Image src={Continue} alt="Continue" />
			</button>

			{/* Modal shown only when isOpen is true */}
			{isOpen && (
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
							{title || 'Ask for Approval'}
						</h2>
						<p className="text-sm text-[#535862] mb-4">
							{statusMessage || 'You’ve successfully completed the setup of your media plan. Ready to move forward?'}
						</p>
						<div className="flex flex-col gap-4">
							<button
								className="btn_model_active w-full"
								onClick={handleAction}
								disabled={step !== 'creator'}
							>
								{loading
									? <SVGLoader width="30px" height="30px" color="#fff" />
									: <span className="font-medium">Ask for Approval</span>}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default AskForApproval;
