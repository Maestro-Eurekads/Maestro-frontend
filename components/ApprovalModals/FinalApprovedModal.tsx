'use client';

import { X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const FinalApprovedModal = ({ isOpen, setIsOpen }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="relative bg-white rounded-lg w-[440px] p-6 shadow-xl text-center">
				<button
					onClick={() => {
						toast.info('Modal closed.');
						setIsOpen(false);
					}}
					className="absolute top-4 right-4"
				>
					<X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
				</button>

				<div className="w-full flex justify-center pt-2">
					<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
						<CheckCircle className="text-blue-600 w-7 h-7" />
					</div>
				</div>

				<h2 className="text-xl font-semibold text-[#181D27] mb-2">Plan Approved</h2>
				<p className="text-sm text-[#535862] mb-4">
					This media plan has been fully approved and is ready for execution.
				</p>

				<div className="flex flex-col gap-4 mt-4">
					<button className="btn_model_active w-full" onClick={() => setIsOpen(false)}>
						OK
					</button>
				</div>
			</div>
		</div>
	);
};

export default FinalApprovedModal;
