"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useActive } from "./ActiveContext";

interface SaveProgressOptions {
	progress: number;
	active: number;
	cId: string;
	token: string;
	onSaved?: () => void;
	campaignFormData?: {
		progress_percent: number;
	};
	calcPercent?: number;
}


interface SaveProgressContextType {
	triggerSave: (options: SaveProgressOptions) => void;
	setHasUnsavedChanges: (hasChanges: boolean) => void;
}

const SaveProgressContext = createContext<SaveProgressContextType>({
	triggerSave: () => { },
	setHasUnsavedChanges: () => { },
});

export const SaveProgressProvider = ({ children }: { children: React.ReactNode }) => {
	const [showPrompt, setShowPrompt] = useState(false);
	const [saveOptions, setSaveOptions] = useState<SaveProgressOptions | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [calcPercent, setCalcPercent] = useState(null);
	const [pendingNavigation, setPendingNavigation] = useState<null | (() => void)>(null);

	const router: any = useRouter();


	const confirmSave = async () => {
		if (!saveOptions) return;
		try {
			const { progress, cId, token, onSaved, campaignFormData, active } = saveOptions;
			const calcPercent = Math.ceil((active / 10) * 100);
			const { data } = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			// const newProgress = data?.progress_percent || 0;
			// const existing = campaignFormData?.progress_percent ?? 0;
			// const percent = calcPercent ?? progress;
			// progress_percent:

			const final = campaignFormData?.progress_percent > calcPercent
				? campaignFormData?.progress_percent
				: calcPercent

			await axios.put(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
				{ data: { progress_percent: progress } },
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			toast.success("Progress saved!");
			onSaved?.();
			setShowPrompt(false);
			setSaveOptions(null);
		} catch (error: any) {
			if (error?.response?.status === 401) {
				window.dispatchEvent(new Event("unauthorizedEvent"));
			}
			toast.error(error?.message || "Failed to save progress.");
		}
	};


	const cancelSave = () => {
		setShowPrompt(false);
		setSaveOptions(null);
		setPendingNavigation(null);
	};

	const triggerSave = (options: SaveProgressOptions) => {
		setSaveOptions(options);
		setShowPrompt(true);
		setCalcPercent(options.calcPercent)
	};

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = "";
				return "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges]);

	useEffect(() => {
		if (!hasUnsavedChanges) return;

		// Handle Next.js router navigation
		router.beforePopState(({ url }) => {
			if (!hasUnsavedChanges) return true;

			setPendingNavigation(() => () => {
				router.push(url);
			});
			setShowPrompt(true);
			return false;
		});

		// Handle browser back button
		const handlePopState = (event: PopStateEvent) => {
			if (hasUnsavedChanges) {
				event.preventDefault();
				setShowPrompt(true);
				// Prevent the navigation by pushing the current state back
				window.history.pushState(null, "", window.location.href);
			}
		};

		window.addEventListener("popstate", handlePopState);
		// Push initial state to enable popstate detection
		window.history.pushState(null, "", window.location.href);

		return () => {
			router.beforePopState(() => true);
			window.removeEventListener("popstate", handlePopState);
		};
	}, [hasUnsavedChanges, router]);

	return (
		<SaveProgressContext.Provider value={{ triggerSave, setHasUnsavedChanges }}>
			{children}

			{showPrompt && saveOptions && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-xl shadow-lg w-[400px] p-6 text-center">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">Unsaved Changes</h2>
						<p className="text-gray-700 mb-6">
							You have unsaved changes. Would you like to save your progress before leaving?
						</p>
						<div className="flex flex-col gap-3">
							<button
								className="!bg-[#3175FF] hover:bg-blue-700 text-white px-4 py-2 rounded"
								onClick={confirmSave}
							>
								Save & Continue
							</button>
							<button
								className="border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-100"
								onClick={cancelSave}
							>
								Leave Without Saving
							</button>
						</div>
					</div>
				</div>
			)}
		</SaveProgressContext.Provider>
	);
};

export const useSaveProgress = () => useContext(SaveProgressContext);
