

import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import Continue from "../../public/arrow-back-outline.svg";
import Image from "next/image";

const SharedWithClientPromptModal = ({ isOpen, setIsOpen }) => {


	return (
		<>
			{/* The trigger button */}
			<button className="bottom_black_next_btn hover:bg-blue-500 whitespace-nowrap" onClick={() => setIsOpen(true)}>
				<p>Shared with client</p>
				<Image src={Continue} alt="Continue" />
			</button>
			{isOpen &&
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="relative bg-white rounded-lg w-[440px] max-w-full p-6 shadow-xl text-center">
						<button
							onClick={() => {
								toast.success('Client review acknowledged.');
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
						<h2 className="text-xl font-semibold text-[#181D27] mb-2">
							Media Plan Shared with Client
						</h2>
						<p className="text-sm text-[#535862] mb-4">
							The media plan has been shared with the client and is under review.
						</p>
						<div className="flex flex-col gap-4 mt-4">
							<button
								className="btn_model_active w-full"
								onClick={() => {
									toast.success('Client review acknowledged.');
									setIsOpen(false);
								}}
							>
								OK
							</button>
						</div>
					</div>
				</div>}
		</>
	);
};

export default SharedWithClientPromptModal;