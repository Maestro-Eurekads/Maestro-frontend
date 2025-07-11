// components/BackConfirmModal.tsx
"use client";
import React from "react";

interface BackConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const BackConfirmModal: React.FC<BackConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
				<h2 className="text-lg font-semibold text-gray-800 mb-2">Unsaved Changes</h2>
				<p className="text-sm text-gray-600 mb-6">You have not saved your work. Do you want to save it before leaving?</p>
				<div className="flex justify-end gap-3">
					<button
						className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400"
						onClick={onClose}
					>
						No
					</button>
					<button
						className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
						onClick={onConfirm}
					>
						Yes, Save
					</button>
				</div>
			</div>
		</div>
	);
};

export default BackConfirmModal;
