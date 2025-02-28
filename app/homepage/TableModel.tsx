// "use client";
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import closefill from "../../public/close-fill.svg";
// import blueprofile from "../../public/blueprofile.svg";
// import Input from "../../components/Input";
// import Dropdowns from "../../components/CustomDropdown";
// import EditInputs from "../../components/EditInput";
// import ResponsibleApproverDropdowns from "../../components/ResponsibleApproverDropdowns";

// const TableModel = ({ isOpen, setIsOpen }) => {
// 	const [inputs, setInputs] = useState({
// 		name: "",
// 		lastName: "",
// 		schoolName: "",
// 		others: "",
// 		username: "",
// 		email: "",
// 	});

// 	const handleOnChange = (input: string, value: string) => {
// 		setInputs((prevState) => ({
// 			...prevState,
// 			[input]: value,
// 		}));
// 	};

// 	// Prevent background scrolling when modal is open
// 	useEffect(() => {
// 		if (isOpen) {
// 			document.body.classList.add("overflow-hidden");
// 		} else {
// 			document.body.classList.remove("overflow-hidden");
// 		}
// 		return () => document.body.classList.remove("overflow-hidden");
// 	}, [isOpen]);

// 	return (
// 		<div className="z-50">
// 			{isOpen && (
// 				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
// 					<div className="flex flex-col items-start p-6 gap-6 w-[700px] bg-white rounded-[32px] max-h-[90vh] overflow-y-auto">
// 						{/* Header */}
// 						<div className="border-structure flex justify-between w-full">
// 							<div className="flex items-center gap-5">
// 								<div className="madel_profile">
// 									<Image src={blueprofile} alt="menu" />
// 								</div>
// 								<div className="madel_profile_text_container">
// 									<h3>Add a new client</h3>
// 									<p>Define the client structure and initial setup.</p>
// 								</div>
// 							</div>
// 							<button
// 								className="self-start text-gray-500 hover:text-gray-800"
// 								onClick={() => setIsOpen(false)}
// 							>
// 								<Image src={closefill} alt="menu" />
// 							</button>
// 						</div>

// 						{/* Input Fields */}
// 						<div className="w-full flex justify-between items-end gap-3">
// 							<div className="w-full">
// 								<Input
// 									type="text"
// 									value={inputs.name || ""}
// 									handleOnChange={(e) => handleOnChange("name", e.target.value)}
// 									label={"Client name"}
// 									placeholder={"Client name"}
// 								/>
// 							</div>

// 							<div className="w-full">
// 								<Input
// 									type="email"
// 									value={inputs.email || ""}
// 									handleOnChange={(e) => handleOnChange("email", e.target.value)}
// 									label={"Client emails (add up to 5 emails)"}
// 									placeholder={"Enter email address"}
// 								/>
// 							</div>
// 							<button className="model_button_black">Add</button>
// 						</div>

// 						{/* Dropdowns & Inputs */}
// 						<div className="w-full">
// 							<ResponsibleApproverDropdowns right={true} />
// 						</div>
// 						<div className="w-full">
// 							<EditInputs />
// 						</div>
// 						<div className="w-[50%]">
// 							<Dropdowns one={true} two={false} labelone={"Select fee type"} labeltwo={undefined} right={false} islabelone={"Fee"} islabeltwo={undefined} />
// 						</div>

// 						{/* Footer Buttons */}
// 						<div className="model_buttom_btn_containers flex items-center justify-end mt-1 pt-4">
// 							<div className="flex items-center gap-5">
// 								<button className="btn_model_outline">Cancel</button>
// 								<button className="btn_model_active">Add Client</button>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default TableModel;






"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../public/close-fill.svg";
import blueprofile from "../../public/blueprofile.svg";
import Input from "../../components/Input";
import Dropdowns from "../../components/CustomDropdown";
import EditInputs from "../../components/EditInput";
import ResponsibleApproverDropdowns from "../../components/ResponsibleApproverDropdowns";

const TableModel = ({ isOpen, setIsOpen }) => {
	const [inputs, setInputs] = useState({
		name: "",
		lastName: "",
		schoolName: "",
		others: "",
		username: "",
		email: "",
	});

	const handleOnChange = (input: string, value: string) => {
		setInputs((prevState) => ({
			...prevState,
			[input]: value,
		}));
	};

	// Prevent background scrolling when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.classList.add("overflow-hidden");
		} else {
			document.body.classList.remove("overflow-hidden");
		}
		return () => document.body.classList.remove("overflow-hidden");
	}, [isOpen]);

	return (
		<div className="z-50">
			{isOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					{/* Modal container */}
					<div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">

						{/* Header (Fixed) */}
						<div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-[32px]">
							<div className="flex items-center gap-5">
								<div className="madel_profile">
									<Image src={blueprofile} alt="menu" />
								</div>
								<div className="madel_profile_text_container">
									<h3>Add a new client</h3>
									<p>Define the client structure and initial setup.</p>
								</div>
							</div>
							<button
								className="text-gray-500 hover:text-gray-800"
								onClick={() => setIsOpen(false)}
							>
								<Image src={closefill} alt="menu" />
							</button>
						</div>

						{/* Scrollable Body */}
						<div className="p-6 overflow-y-auto max-h-[60vh]">
							<div className="w-full flex justify-between items-end gap-3">
								<div className="w-full">
									<Input
										type="text"
										value={inputs.name || ""}
										handleOnChange={(e) => handleOnChange("name", e.target.value)}
										label={"Client name"}
										placeholder={"Client name"}
									/>
								</div>
								<div className="w-full">
									<Input
										type="email"
										value={inputs.email || ""}
										handleOnChange={(e) => handleOnChange("email", e.target.value)}
										label={"Client emails (add up to 5 emails)"}
										placeholder={"Enter email address"}
									/>
								</div>
								<button className="model_button_black">Add</button>
							</div>

							<div className="w-full">
								<ResponsibleApproverDropdowns right={true} />
							</div>
							<div className="w-full">
								<EditInputs />
							</div>
							<div className="w-[50%]">
								<Dropdowns one={true} two={false} labelone={"Select fee type"} right={false} islabelone={"Fee"} labeltwo={undefined} islabeltwo={undefined} />
							</div>
						</div>

						{/* Footer (Fixed) */}
						<div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end rounded-b-[32px]">
							<div className="flex items-center gap-5">
								<button className="btn_model_outline">Cancel</button>
								<button className="btn_model_active whitespace-nowrap">Add Client</button>
							</div>
						</div>

					</div>
				</div>
			)}
		</div>
	);
};

export default TableModel;
