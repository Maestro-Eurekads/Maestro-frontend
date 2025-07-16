// modals/ShareWithClientModal.tsx
import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCampaigns } from 'app/utils/CampaignsContext';
import axios from 'axios';
import { SVGLoader } from 'components/SVGLoader';
import { useUserPrivileges } from 'utils/userPrivileges';

const ShareWithClientModal = ({ isOpen, setIsOpen, campaignId }) => {
	const { cId, jwt, getActiveCampaign } = useCampaigns();
	const { loggedInUser } = useUserPrivileges();
	const [loading, setLoading] = useState(false);

	const handleShare = async () => {
		setLoading(true);
		try {
			const newStatus = {
				stage: 'shared_with_client',
				label: 'Shared with Client',
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
				headers: { Authorization: `Bearer ${jwt}` },
			});

			await getActiveCampaign(campaignId);
			toast.success('Media plan shared with client');
			setIsOpen(false);
		} catch (err) {
			toast.error('Failed to share');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="relative bg-white rounded-lg w-[440px] p-6 shadow-xl text-center">
				<button className="absolute top-4 right-4" onClick={() => setIsOpen(false)}>
					<X className="w-5 h-5 text-gray-500" />
				</button>
				<CheckCircle className="text-green-600 w-10 h-10 mx-auto mb-3" />
				<h2 className="text-xl font-semibold">Ready to Share?</h2>
				<p className="text-sm text-gray-600 mb-4">This plan has been internally approved. Share it with the client now?</p>
				<button className="btn_model_active w-full" onClick={handleShare}>
					{loading ? <SVGLoader width="30px" height="30px" color="#fff" /> : 'Share with Client'}
				</button>
			</div>
		</div>
	);
};

export default ShareWithClientModal;

