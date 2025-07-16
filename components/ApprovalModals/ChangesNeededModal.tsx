'use client';

import { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { useUserPrivileges } from 'utils/userPrivileges';

const ChangesNeededModal = ({ isOpen, setIsOpen, stage, setChange }) => {
	const { campaignData, cId, jwt, getActiveCampaign } = useCampaigns();
	const { loggedInUser } = useUserPrivileges();

	useEffect(() => {
		// Auto close modal if stage is no longer changes needed
		if (!isOpen) return;
		if (!stage || (stage !== 'client_changes_needed' && stage !== 'changes_needed')) {
			setIsOpen(false);
		}
	}, [stage, isOpen, setIsOpen]);

	if (!isOpen || !stage || (stage !== 'client_changes_needed' && stage !== 'changes_needed')) return null;

	const label =
		stage === 'client_changes_needed'
			? 'Client Requested Changes'
			: 'Changes Requested Internally';

	const message =
		stage === 'client_changes_needed'
			? 'The client has requested changes to the media plan.'
			: 'Internal team has requested changes to the media plan.';

	const updateStatus = async () => {
		if (!cId) {
			toast.error('No campaign ID provided.');
			return;
		}

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

			await axios.put(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
				{
					data: {
						isStatus: newStatus,
					},
				},
				{
					headers: {
						Authorization: `Bearer ${jwt}`,
					},
				}
			);

			await getActiveCampaign(campaignData?.documentId || cId);

			toast.success(`Status updated: ${label}`);
			setIsOpen(false);
			setChange(false)
		} catch (error) {

			if (error?.response?.status === 401) {
				window.dispatchEvent(new Event('unauthorizedEvent'));
			} else {
				toast.error(error?.message || 'Failed to update status');
			}
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="relative bg-white rounded-lg w-[440px] p-6 shadow-xl text-center">
				<button
					onClick={() => {
						toast.info('Change request cancelled.');
						setIsOpen(false);
					}}
					className="absolute top-4 right-4"
				>
					<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
				</button>

				<div className="w-full flex justify-center pt-2">
					<div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
						<AlertCircle className="text-yellow-600 w-7 h-7" />
					</div>
				</div>

				<h2 className="text-xl font-semibold text-[#181D27] mb-2">{label}</h2>
				<p className="text-sm text-[#535862] mb-4">{message}</p>

				<div className="flex flex-col gap-4 mt-4">
					<button
						className="btn_model_active w-full"
						onClick={updateStatus}
					>
						Confirm Change Request
					</button>
					<button
						className="btn_model_outline w-full"
						onClick={() => setIsOpen(false)}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChangesNeededModal;
