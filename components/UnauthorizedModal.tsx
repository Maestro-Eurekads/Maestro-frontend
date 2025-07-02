"use client";

import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";

const UnauthorizedModal = () => {
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		const handleUnauthorized = () => {
			setShowModal(true);
		};

		window.addEventListener("unauthorizedEvent", handleUnauthorized);
		return () => window.removeEventListener("unauthorizedEvent", handleUnauthorized);
	}, []);

	const handleOk = () => {
		signOut({ callbackUrl: "/" });
	};

	if (!showModal) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
			<div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl text-center space-y-6">
				<h2 className="text-xl font-semibold text-red-600">Unauthorized Access</h2>
				<p className="text-gray-700 text-sm">
					You are not authorized. Kindly reach out to the admin for more information.
				</p>
				<button
					onClick={handleOk}
					className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
				>
					OK
				</button>
			</div>
		</div>
	);
};

export default UnauthorizedModal;
