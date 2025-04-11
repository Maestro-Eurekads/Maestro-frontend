"use client";
import React from "react";
import { X } from "lucide-react";
import { useAppSelector } from "store/useStore";
import Image from "next/image";
import { SVGLoader } from "components/SVGLoader";

interface SignatureModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose }) => {
	const { dataApprove, isLoadingApprove } = useAppSelector((state) => state.comment);
	if (!isOpen) return null;

	const { fullname, dateSigned, initials, signature } = dataApprove[0] || {};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
			<div className="bg-white w-[794px] h-[800px] max-w-full rounded-lg shadow-2xl relative overflow-y-auto p-10 print:p-10">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
				>
					<X size={24} />
				</button>

				<div className="text-center border-b pb-6 mb-6">
					<h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
						Signature Receipt
					</h1>
					<p className="text-sm text-gray-500 mt-2">Generated Record</p>
				</div>

				{isLoadingApprove ? (
					<div className="flex items-center justify-center h-full">
						<SVGLoader width={"50px"} height={"50px"} color={"#0866FF"} />
					</div>
				) : (
					<div className="space-y-6 text-[16px] text-gray-800">
						<div className="flex justify-between">
							<span className="font-semibold">Full Name:</span>
							<span>{fullname || "N/A"}</span>
						</div>

						<div className="flex justify-between">
							<span className="font-semibold">Date Signed:</span>
							<span>{dateSigned || "N/A"}</span>
						</div>

						<div className="flex justify-between">
							<span className="font-semibold">Initials:</span>
							<span>{initials || "N/A"}</span>
						</div>

						<div>
							<p className="font-semibold mb-2">Signature:</p>
							{signature ? (
								<div className="border rounded-md p-4 bg-white w-full h-[200px] flex items-center justify-center">
									<Image
										src={signature}
										alt="Signature"
										className="max-h-full object-contain"
										width={200}
										height={200}
										loading={isLoadingApprove ? "lazy" : "eager"}
										placeholder="blur"
										blurDataURL={signature}
										quality={100}
										style={{ maxWidth: "100%", height: "auto" }}
									/>
								</div>
							) : (
								<div className="border border-dashed p-4 rounded-md bg-gray-50 h-[200px] flex items-center justify-center text-gray-400 text-sm">
									No Signature Provided
								</div>
							)}
						</div>
					</div>
				)}
				<div className="absolute bottom-10 left-10 right-10 text-center text-xs text-gray-400">
					&copy; {new Date().getFullYear()} Julien. All rights reserved.
				</div>
			</div>
		</div>
	);
};

export default SignatureModal;
