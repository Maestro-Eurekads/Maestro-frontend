import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { useUserPrivileges } from 'utils/userPrivileges';
import ApprovalDraftModal from './ApprovalDraftModal';
import ShareWithClientModal from './ShareWithClientModal';
import InternalReviewModal from './InternalReviewModal';
import ClientReviewModal from './ClientReviewModal';
import FinalApprovedModal from './FinalApprovedModal';
import ChangesNeededModal from './ChangesNeededModal';
import InternallyApprovedModal from './InternallyApprovedModal';

const ApprovalModals = () => {
	const [isOpen, setIsOpen] = useState(false);
	const query = useSearchParams();
	const campaignId = query.get('campaignId');
	const {
		loggedInUser,
		isAdmin,
		isAgencyCreator,
		isAgencyApprover,
		isFinancialApprover,
		isClient,
		isClientApprover
	} = useUserPrivileges();
	const { campaignData } = useCampaigns();




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

	if (!campaignData) return null;

	const sharedProps = { isOpen, setIsOpen, campaignId, campaignData };


	console.log('ApprovalModals rendered with stage:', stage);

	const effectiveStage = stage === undefined ? 'draft' : stage;

	switch (effectiveStage) {
		case 'draft':
			return (isCreator || isNotApprover || isInternalApprover || isAdmin) ? <ApprovalDraftModal {...sharedProps} /> : null;

		case 'in_internal_review':
			return (isAdmin || isAgencyApprover) ? <InternallyApprovedModal {...sharedProps} /> : null;

		case 'internally_approved':
			return <ShareWithClientModal {...sharedProps} />;

		case 'shared_with_client':
			return isClientApprover ? <ClientReviewModal {...sharedProps} /> : null;

		case 'approved':
			return <FinalApprovedModal {...sharedProps} />;

		case 'changes_needed':
		case 'client_changes_needed':
			return <ChangesNeededModal stage={stage} {...sharedProps} />;

		default:
			return null;
	}

};

export default ApprovalModals;
