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
import SharedWithClientPromptModal from './SharedWithClientPromptModal';
import { useActive } from 'app/utils/ActiveContext';

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
	const { setChange } = useActive()



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

	console.log('stage----', stage)


	const effectiveStage = stage === undefined ? 'draft' : stage;

	switch (effectiveStage) {
		case 'draft':
			return (isCreator || isNotApprover || isInternalApprover || isAdmin) ? <ApprovalDraftModal {...sharedProps} setChange={setChange} /> : null;

		case 'in_internal_review':
			return (isAdmin || isAssignedInternalApprover) ? <InternallyApprovedModal {...sharedProps}
				setChange={setChange} /> : null;

		case 'internally_approved':
			return <ShareWithClientModal {...sharedProps} setChange={setChange} />;

		case 'shared_with_client':
			return (isInternalApprover || isAdmin) ? <SharedWithClientPromptModal {...sharedProps} /> : <ClientReviewModal {...sharedProps} />;

		case 'approved':
			return <FinalApprovedModal {...sharedProps} />;

		case 'changes_needed':
			return (isCreator || isNotApprover || isInternalApprover || isAdmin) ? <ChangesNeededModal stage={stage} {...sharedProps} setChange={setChange} /> : null;

		case 'client_changes_needed':
			return (isCreator || isNotApprover || isInternalApprover || isAdmin) ? <ChangesNeededModal stage={stage} {...sharedProps} setChange={setChange} /> : null;

		default:
			return null;
	}

};

export default ApprovalModals;
