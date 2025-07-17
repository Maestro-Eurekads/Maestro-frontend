'use client';

import { X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from "next/image"
import Continue from "../../public/arrow-back-outline.svg"

const FinalApprovedModal = ({ isOpen, setIsOpen }) => {


	return (
		<>
			{/* This always renders */}
			<button className="bottom_black_next_btn hover:bg-blue-500 whitespace-nowrap" onClick={() => setIsOpen(true)}>
				<p>Plan Approved</p>
				{/* <Image src={Continue} alt="Continue" /> */}
			</button>

			{/* Modal shown only when isOpen is true */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] p-6 shadow-xl text-center">
						<button
							onClick={() => { setIsOpen(false); }}
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
							This media plan has been fully approved!
						</p>

						<div className="flex flex-col gap-4 mt-4">
							<button className="btn_model_active w-full" onClick={() => setIsOpen(false)}>
								OK
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default FinalApprovedModal;
