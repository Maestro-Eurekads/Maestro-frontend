// modals/ApprovalDraftModal.tsx
import { X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCampaigns } from 'app/utils/CampaignsContext';
import axios from 'axios';
import { SVGLoader } from 'components/SVGLoader';
import { useUserPrivileges } from 'utils/userPrivileges';
import { useState } from 'react';
import Image from "next/image"
import Continue from "../../public/arrow-back-outline.svg"


const ApprovalDraftModal = ({ isOpen, setIsOpen, campaignId, campaignData }) => {
	const { cId, jwt, getActiveCampaign } = useCampaigns();
	const { loggedInUser } = useUserPrivileges();
	const [loading, setLoading] = useState(false);

	const handleSubmitForReview = async () => {
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
			toast.success('Submitted for internal review');
			setIsOpen(false);
		} catch (error) {
			toast.error('Failed to submit');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<button className="bottom_black_next_btn hover:bg-blue-500 whitespace-nowrap" onClick={() => setIsOpen(true)}>
				<p>Ask for Approval</p>
				<Image src={Continue} alt="Continue" />
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg w-[440px] relative text-center shadow-xl">
						<button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
							<X className="w-5 h-5 text-gray-500" />
						</button>
						<div className="w-full flex justify-center pt-2">
							<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
								<CheckCircle className="text-green-600 w-7 h-7" />
							</div>
						</div>
						<h2 className="text-xl font-semibold mt-4">Media Plan Completed</h2>
						<p className="text-sm text-gray-600 mt-2">Ready to ask for internal approval?</p>
						<button className="btn_model_active w-full mt-6" onClick={handleSubmitForReview}>
							{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : 'Ask for Approval'}
						</button>
					</div>
				</div>)}
		</>
	);
};

export default ApprovalDraftModal;
