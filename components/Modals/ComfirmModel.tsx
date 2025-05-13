'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useActive } from '../../app/utils/ActiveContext';
import AlertMain from '../Alert/AlertMain';
import { CheckCircle, X } from "lucide-react";


// Version management
const getVersionData = (planId) => {
	const data = localStorage.getItem(`mediaPlanVersion`);
	return data ? JSON.parse(data) : null;
};

const setVersionData = (planId, version) => {
	localStorage.setItem(`mediaPlanVersion`, JSON.stringify({ version }));
};

const ComfirmModel = ({ isOpen, setIsOpen, planId }) => {
	const router = useRouter();
	const { setActive, setSubStep } = useActive();
	const [approval, setApproval] = useState(false);
	const [showVersionPrompt, setShowVersionPrompt] = useState(false);
	const [currentVersion, setCurrentVersion] = useState('v1');

	useEffect(() => {
		const versionData = getVersionData(planId);
		if (versionData) {
			setCurrentVersion(versionData.version);
			setShowVersionPrompt(true);
		}
	}, [planId]);

	const handleBackClick = () => {
		setActive(0);
		setSubStep(0);
		setIsOpen(false);
		router.push('/');
	};

	const getNextVersion = (v) => {
		const number = parseInt(v.replace('v', '')) || 1;
		return `v${number + 1}`;
	};

	const handleApproval = () => {
		const versionData = getVersionData(planId);
		if (!versionData) {
			setVersionData(planId, 'v1');
			setCurrentVersion('v1');
			setApproval(true);
		} else {
			setShowVersionPrompt(true);
		}
		setTimeout(() => setApproval(false), 3000);
	};

	const handleKeepVersion = () => {
		setApproval(true);
		setShowVersionPrompt(false);
		setTimeout(() => setApproval(false), 3000);
	};

	const handleCreateNewVersion = () => {
		const newVersion = getNextVersion(currentVersion);
		setVersionData(planId, newVersion);
		setCurrentVersion(newVersion);
		setApproval(true);
		setShowVersionPrompt(false);
		setTimeout(() => setApproval(false), 3000);
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
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-5 h-5 text-gray-500"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span className="font-medium">Version: {currentVersion}</span>
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
								<button className="btn_model_active w-full" onClick={handleCreateNewVersion}>
									New Version
								</button>
							</div>
						</div>
					</div>
				)}

			</div>
		</div>
	);
};

export default ComfirmModel;
