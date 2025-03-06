"use client";
import { useState, useEffect, SetStateAction } from "react";
import Image from "next/image";
import closefill from "../../public/close-fill.svg";
import blueprofile from "../../public/blueprofile.svg";
import Input from "../../components/Input";
import EditInputs from "../../components/EditInput";
import ResponsibleApproverDropdowns from "../../components/ResponsibleApproverDropdowns";
import FeeDropdowns from "./FeeDropdowns";
import CategoryDropdown from "./components/CategoryDropdown";
import SportDropdown from "./components/SportDropdown";
import BusinessUnit from "./components/BusinessUnit";
import { useDispatch } from 'react-redux';
import { createClient, reset } from "../../features/Client/clientSlice";
import { useAppSelector } from "../../store/useStore";
import { RootState } from "../../store/store";
import { SVGLoader } from "../../components/SVGLoader";
import AlertMain from "../../components/Alert/AlertMain";

const TableModel = ({ isOpen, setIsOpen }) => {

	const { isLoading, isSuccess, isError, message } = useAppSelector(
		(state: RootState) => state.client
	);
	const dispatch = useDispatch();
	const [inputs, setInputs] = useState({
		name: "",
		email: "",
		responsiblePerson: "",
		approver: "",
		sports: [],
		categories: [],
		businessUnits: [],
		feeType: "",
	});




	console.log('isSuccess, isError, message', isSuccess, isError, message)



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


	useEffect(() => {
		if (isError) {
			setTimeout(() => {
				dispatch(reset());
			}, 3000);
		} else if (isSuccess) {
			setIsOpen(false)
			setInputs({
				name: "",
				email: "",
				responsiblePerson: "",
				approver: "",
				sports: [],
				categories: [],
				businessUnits: [],
				feeType: "",
			})
			setTimeout(() => {
				dispatch(reset());
			}, 3000);
		}

	}, [isError, isSuccess])




	const handleSubmit = async () => {
		// @ts-ignore
		dispatch(createClient(inputs));
	}
	return (
		<div className="z-50">{/* Show alert only when needed */}
			{isSuccess && (
				<AlertMain
					alert={{
						variant: 'success',
						message: 'Client created successfully!',
						position: 'bottom-right',
					}}
				/>
			)}
			{isError && (
				<AlertMain
					alert={{
						variant: 'error',
						message: message,
						position: 'bottom-right',
					}}
				/>
			)}

			{isOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					{/* Modal container */}
					<div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">
						<div className="w-full flex justify-end px-5 pt-5">

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
								className="text-gray-500 hover:text-gray-800"
								onClick={() => setIsOpen(false)}
							>
								<Image src={closefill} alt="menu" />
							</button>
						</div>

						{/* Scrollable Body */}
						<div className="p-6 overflow-y-auto max-h-[60vh]">

							<div className="flex items-center gap-3">
								<Input
									type="text"
									value={inputs.name}
									handleOnChange={(e) => handleOnChange("name", e.target.value)}
									label="Client Name"
									placeholder="Client Name"
								/>
								<Input
									type="email"
									value={inputs.email}
									handleOnChange={(e) => handleOnChange("email", e.target.value)}
									label="Email"
									placeholder="Enter email address"
								/>
								<button className="flex items-center justify-center px-6 py-3 w-[76px] h-[44px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white mt-8">
									Add
								</button>

							</div>

							<div className="w-full">
								<ResponsibleApproverDropdowns right={true} setInputs={setInputs} />
							</div>
							<div className="w-full flex items-center gap-3">
								<SportDropdown setInputs={setInputs} />
								<BusinessUnit setInputs={setInputs} />
								<CategoryDropdown setInputs={setInputs} inputs={inputs} />
								{/* <EditInputs inputs={inputs} setInputs={setInputs} /> */}
							</div>
							<div className="w-[50%]">
								<FeeDropdowns
									labelone="Select fee type"
									islabelone="Fee" inputs={inputs} setInputs={setInputs} />
							</div>
						</div>

						{/* Footer (Fixed) */}
						<div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end rounded-b-[32px]">
							<div className="flex items-center gap-5">
								<button className="btn_model_outline">Cancel</button>
								<button
									className="btn_model_active whitespace-nowrap"
									onClick={handleSubmit}
								>{isLoading ? <SVGLoader width={"30px"} height={"30px"} color={"#FFF"} /> : "Add Client"}</button>
							</div>
						</div>

					</div>
				</div>
			)}
		</div>
	);
};

export default TableModel;
