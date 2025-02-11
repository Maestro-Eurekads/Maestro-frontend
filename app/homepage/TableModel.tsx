"use client"
import { useState } from "react";
import Image from "next/image";
import blueBtn from "../../public/blueBtn.svg";
import closefill from "../../public/close-fill.svg";
import blueprofile from "../../public/blueprofile.svg";
import Input from "../../components/Input";
import Dropdowns from "../../components/CustomDropdown";
import EditInputs from "../../components/EditInput";

const TableModel = () => {
	const [isOpen, setIsOpen] = useState(false);

	const [inputs, setInputs] = useState({
		firstName: "",
		lastName: "",
		schoolName: "",
		schoolLocation: "",
		subjectsTaught: "",
		yearGroupsTaught: "",
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

	return (
		<div className="z-50">
			<button onClick={() => setIsOpen(true)}>
				<Image src={blueBtn} alt="menu" />
			</button>
			{isOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="flex flex-col items-start p-6 gap-6 w-[700px] h-[532px] bg-white rounded-[32px]">
						<div className="border-structure flex justify-between w-full border-">
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
								className="self-start text-gray-500 hover:text-gray-800"
								onClick={() => setIsOpen(false)}
							>
								<Image src={closefill} alt="menu" />
							</button>
						</div>


						<div className="w-full flex justify-between items-end gap-3">
							<div className="w-full">
								<Input
									type="email"
									value={inputs.email || ''}
									handleOnChange={(e) => handleOnChange("email", e.target.value)}
									label={'Client name'}
									disabled={true} placeholder={'Client name'} />
							</div>

							<div className="w-full">
								<Input
									type="email"
									value={inputs.email || ''}
									handleOnChange={(e) => handleOnChange("email", e.target.value)}
									label={'Client name'}
									disabled={true} placeholder={'Client name'} />
							</div>
							<button className="model_button_black">Add</button>
						</div>
						<div className="w-full">
							<Dropdowns one={true} two={true} labelone={"Julien Dahmoun "} labeltwo={"Select fee type"} />
						</div>
						<div className="w-full">
							<EditInputs />
						</div>
						<div className="w-[50%]">
							<Dropdowns one={true} two={false} labelone={"Select fee type"} />
						</div>
						<div className="model_buttom_btn_containers flex items-center justify-end mt-1 pt-4">
							<div className="flex items-center gap-5">
								<button className="btn_model_outline">Cancel</button>
								<button className="btn_model_active">Add client</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default TableModel