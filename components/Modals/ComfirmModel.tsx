'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useActive } from '../../app/utils/ActiveContext';
import AlertMain from '../Alert/AlertMain';
import { CheckCircle, X } from "lucide-react";
import { useVersionContext } from 'app/utils/VersionApprovalContext';
import { SVGLoader } from 'components/SVGLoader';
import { useCampaigns } from 'app/utils/CampaignsContext';




const ComfirmModel = ({ isOpen, setIsOpen }) => {
	const { createCampaignVersion, getCampaignVersion, isLoading, version, getLoading, id, setid, updateCampaignVersion } = useVersionContext();
	const router = useRouter();
	const { setActive, setSubStep } = useActive();
	const [approval, setApproval] = useState(false);
	const [showVersionPrompt, setShowVersionPrompt] = useState(false);
	const [currentVersion, setCurrentVersion] = useState(null);
	const getNextVersion = (v) => {
		const number = parseInt(v?.replace('v', '')) || 1;
		return `v${number + 1}`;
	};
	const newVersion = getNextVersion(currentVersion);
	const { campaignData, } = useCampaigns();
	const query = useSearchParams();
	const campaignId = query.get("campaignId");
	const plan_name = campaignData?.media_plan_details.plan_name


	console.log('currentVersion-currentVersion', version)


	useEffect(() => {
		const fetchVersionData = async () => {
			const versions = await getCampaignVersion(campaignId);
			// console.log('versions=versions', versions)
			if (version && version.length > 0) {
				setCurrentVersion(version[version.length - 1].version.version_number);
				setid(version[0]?.id);
				setShowVersionPrompt(true);
			}
		};

		fetchVersionData();
	}, [isOpen, campaignId]);


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
		setApproval(true);
		setShowVersionPrompt(false);
		setTimeout(() => setApproval(false), 3000);
	};

	const handleCreateNewVersion = () => {
		createCampaignVersion(
			campaignId,
			{
				version_number: newVersion,
				plan_name: plan_name,
				approved: true,
			},
		);

		setApproval(true);
		setShowVersionPrompt(false);
	};



	const handleUpdateVersion = () => {
		updateCampaignVersion(
			campaignId,
			{
				version_number: newVersion,
				plan_name: plan_name,
				approved: true,
			}
		);

		setApproval(true);
		setShowVersionPrompt(false);
	};




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
						<span className="font-medium">Version: {currentVersion ?? 0}</span>}

				</div>

				{/* Actions */}
				<div className="flex justify-between gap-4">
					<button className="btn_model_outline w-full" onClick={handleBackClick}>
						Back to Dashboard
					</button>
					<button className="btn_model_active w-full" onClick={handleApproval}>
						Request approval
					</button>
				</div>

				{/* Alert */}
				{approval && (
					<AlertMain
						alert={{
							variant: 'success',
							message: 'Approval Success!',
							position: 'bottom-right',
						}}
					/>
				)}

				{/* Version choice prompt */}
				{showVersionPrompt && (
					<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
						<div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
							<h3 className="text-lg font-semibold mb-3">
								This plan is already approved
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								(Current version: <strong>{currentVersion}</strong>). Would you like to keep it or create a new one?
							</p>
							<div className="flex gap-4">
								<button className="btn_model_outline w-full" onClick={handleKeepVersion}>
									Keep Current
								</button>
								{currentVersion ? <button className="btn_model_active w-full" onClick={handleUpdateVersion}>
									{isLoading ? <SVGLoader width={"30px"} height={"30px"} color={"#fff"} /> : "Update Version"}
								</button> : <button className="btn_model_active w-full" onClick={handleCreateNewVersion}>
									{isLoading ? <SVGLoader width={"30px"} height={"30px"} color={"#fff"} /> : "New Version"}
								</button>}

							</div>
						</div>
					</div>
				)}

			</div>
		</div>
	);
};

export default ComfirmModel;
