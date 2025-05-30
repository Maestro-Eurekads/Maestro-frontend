'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useActive } from '../../app/utils/ActiveContext';
import { CheckCircle, X } from "lucide-react";
import { useVersionContext } from 'app/utils/VersionApprovalContext';
import { SVGLoader } from 'components/SVGLoader';
import { useCampaigns } from 'app/utils/CampaignsContext';
import { removeKeysRecursively } from 'utils/removeID';
import { useUserPrivileges } from 'utils/userPrivileges';
import { toast } from 'sonner';

const ComfirmModel = ({ isOpen, setIsOpen }) => {
	const { createCampaignVersion, getCampaignVersion, isLoading, version, getLoading, setdocumentId, updateCampaignVersion, createsSuccess, updateSuccess, updateLoading } = useVersionContext();
	const router = useRouter();
	const { setActive, setSubStep } = useActive();
	const [showVersionPrompt, setShowVersionPrompt] = useState(false);
	const [currentVersion, setCurrentVersion] = useState(null);
	const [clientId, setClientId] = useState<number | null>(null);
	const [KeepVersionLoading, setKeepVersionLoading] = useState(false);
	const { loggedInUser } = useUserPrivileges();
	const {
		createCampaign,
		updateCampaign,
		campaignData,
		campaignFormData,
		cId,
		getActiveCampaign,
		copy,
		setCampaignFormData,
	} = useCampaigns();



	const getNextVersion = (v) => {
		const number = parseInt(v?.replace('v', '')) || 0;
		return `v${number + 1}`;
	};
	const newVersion = getNextVersion(currentVersion);
	const [loading, setLoading] = useState(false);
	const query = useSearchParams();
	const campaignId = query.get("campaignId");
	const documentId = campaignData?.documentId;
	const plan_name = campaignData?.media_plan_details.plan_name

	// console.log('campaignFormData', campaignFormData)


	// Set client ID from campaignData in useEffect
	// useEffect(() => {
	// 	if (createsSuccess || updateSuccess) {
	// 		setShowVersionPrompt(false)
	// 		setIsOpen(false)
	// 	}
	// }, [createsSuccess || updateSuccess]);


	useEffect(() => {
		if (campaignData?.client?.id) {
			setClientId(campaignData?.client?.id?.toString());
		}
	}, [campaignData]);
	// useEffect(() => {
	// 	const fetchVersionData = async () => {
	// 		const versions = await getCampaignVersion(campaignId);
	// 		if (version && version.length > 0) {
	// 			setCurrentVersion(version[version.length - 1].version.version_number);
	// 			setdocumentId(version[0]?.documentId);
	// 			setShowVersionPrompt(true);
	// 		}
	// 	};

	// 	fetchVersionData();
	// }, [isOpen, campaignId]);


	const handleBackClick = () => {
		setActive(0);
		setSubStep(0);
		setIsOpen(false);
		router.push('/');
	};






	const handleApproval = () => {
		setShowVersionPrompt(true);
	};

	const handleKeepVersion = () => {
		setKeepVersionLoading(true);
		setTimeout(() => {
			setActive(0);
			setSubStep(0);
			setIsOpen(false);
			router.push('/');
			setKeepVersionLoading(false);
		}, 3000);
	};

	// isApprove
	// const handleCreateNewVersion = () => {
	// 	// createCampaignVersion(newVersion, documentId);

	// };

	const handlePlan = async () => {
		setLoading(true);

		try {
			// Update campaignFormData with cleaned values and save to localStorage
			const cleanedFormData = {
				...campaignFormData,
				isApprove: true,
				internal_approver: loggedInUser?.username,
			};
			setCampaignFormData(cleanedFormData);
			localStorage.setItem("campaignFormData", JSON.stringify(cleanedFormData));

			if (cId && campaignData) {
				const updatedData = {
					...removeKeysRecursively(campaignData, [
						"id",
						"documentId",
						"createdAt",
						"publishedAt",
						"updatedAt",
						"_aggregated",
					]),
					isApprove: true,
					internal_approver: loggedInUser?.username,
				};

				await updateCampaign(updatedData);

				setIsOpen(false);
				toast.success("Plan Approved!")
			}


		} catch (error) {
			toast.error(error.massage)
		} finally {
			setLoading(false);
		}
	};



	// const handleUpdateVersion = () => {
	// 	updateCampaignVersion(newVersion, documentId);

	// };

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">

				{/* Cancel button */}
				<button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
					<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
				</button>


				{/* Green check icon */}
				<div className="w-full flex justify-center pt-2">
					<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
						<CheckCircle className="text-green-600 w-7 h-7" />
					</div>
				</div>


				{/* Title & Description */}
				<h2 className="text-xl font-semibold text-[#181D27] mb-2">
					Media plan completed, well done!
				</h2>
				<p className="text-sm text-[#535862] mb-4">
					You’ve successfully completed the setup of your media plan. Ready to move forward?
				</p>

				{/* Version info */}
				<div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
					{getLoading ? <SVGLoader width={"40px"} height={"40px"} color={"#0866FF"} /> :
						<span className="font-medium"> </span>
						// <span className="font-medium">Version: {currentVersion ?? 0}</span>
					}

				</div>

				{/* Actions */}
				<div className="flex justify-between gap-4">
					<button className="btn_model_outline w-full" onClick={handleBackClick}>
						Back to Dashboard
					</button>
					<button className="btn_model_active w-full" onClick={handlePlan}>
						{loading ? <SVGLoader width={"40px"} height={"40px"} color={"#0866FF"} /> :
							<span className="font-medium">Approval</span>
						}

					</button>
				</div>



				{/* Version choice prompt */}
				{/* {showVersionPrompt && (
					<div className=" fixed inset-0  bg-black bg-opacity-40 flex items-center justify-center z-50">
						<div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">
							<button onClick={() => setShowVersionPrompt(false)} className="absolute top-4 right-4">
								<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
							</button>
							<h3 className="text-lg font-semibold mb-3">
								This plan is already approved
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								(Current version: <strong>{currentVersion}</strong>). Would you like to keep it or create a new one?
							</p>
							<div className="flex gap-4">
								<button className="btn_model_outline w-full" onClick={handleKeepVersion}>
									{KeepVersionLoading ? <SVGLoader width={"30px"} height={"30px"} color={"#fff"} /> : "	Keep Current"}
								</button>
								{currentVersion ? <button className="btn_model_active w-full" onClick={handleUpdateVersion}>
									{updateLoading ? <SVGLoader width={"30px"} height={"30px"} color={"#fff"} /> : "Update Version"}
								</button> : <button className="btn_model_active w-full" onClick={handleCreateNewVersion}>
									{isLoading ? <SVGLoader width={"30px"} height={"30px"} color={"#fff"} /> : "New Version"}
								</button>}

							</div>
						</div>
					</div>
				)} */}

			</div>
		</div>
	);
};

export default ComfirmModel;
