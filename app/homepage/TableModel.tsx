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
		others: "",
		username: "",
		email: "",
	});

	const [isEditing, setIsEditing] = useState(false);

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
						<div className="w-full flex justify-end px-5 pt-5">
							<button
								className="text-gray-500 hover:text-gray-800"
								onClick={() => setIsOpen(false)}
							>
								<Image src={closefill} alt="menu" />
							</button>
						</div>

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
								className="model_button_blue"
								onClick={() => setIsEditing(!isEditing)}
							>
								{isEditing ? "Disable Edit" : "Edit"}
							</button>
						</div>

						{/* Scrollable Body */}
						<div className="p-6 overflow-y-auto max-h-[60vh]">
							<div className="grid grid-cols-2 gap-3">
								<Input
									type="text"
									value={inputs.name}
									handleOnChange={(e) => handleOnChange("name", e.target.value)}
									label="Client Name"
									placeholder="Client Name"
									disabled={!isEditing}
								/>
								<Input
									type="email"
									value={inputs.email}
									handleOnChange={(e) => handleOnChange("email", e.target.value)}
									label="Email"
									placeholder="Enter email address"
									disabled={!isEditing}
								/>

							</div>

							<div className="w-full">
								<ResponsibleApproverDropdowns right={true} disabled={!isEditing} />
							</div>
							<div className="w-full">
								<EditInputs />
							</div>
							<div className="w-[50%]">
								<Dropdowns
									disabled={!isEditing}
									one={true}
									two={false}
									labelone="Select fee type"
									islabelone="Fee" labeltwo={undefined} islabeltwo={undefined} right={""} />
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
