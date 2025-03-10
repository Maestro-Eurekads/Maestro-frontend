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
import { useDispatch } from "react-redux";
import { createClient, reset } from "../../features/Client/clientSlice";
import { useAppSelector } from "../../store/useStore";
import { RootState } from "../../store/store";
import { SVGLoader } from "../../components/SVGLoader";
import AlertMain from "../../components/Alert/AlertMain";
import { MdOutlineCancel } from "react-icons/md";
import { addNewClient } from "./functions/clients";

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
    sports: "",
    categories: [],
    businessUnits: [],
    feeType: "",
  });
  const [emailList, setEmailList] = useState([]);
  const [sportList, setSportList] = useState([]);
  const [businessUnit, setBusinessUnit] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log("isSuccess, isError, message", isSuccess, isError, message);

  const handleAddEmail = () => {
    if (emailList.includes(inputs.email)) {
      alert("Email already exists");
    } else {
      setEmailList([...emailList, inputs.email]);
      setInputs((prevState) => ({
        ...prevState,
        email: "",
      }));
    }
  };

  const handleRemoveEmail = (email) => {
    const filteredEmails = emailList.filter((e) => e !== email);
    setEmailList(filteredEmails);
  };

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
      setIsOpen(false);
      setInputs({
        name: "",
        email: "",
        responsiblePerson: "",
        approver: "",
        sports: "",
        categories: [],
        businessUnits: [],
        feeType: "",
      });
      setTimeout(() => {
        dispatch(reset());
      }, 3000);
    }
  }, [isError, isSuccess]);

  const handleSubmit = async () => {
    setLoading(true);
    await addNewClient({
      client_name: inputs.name,
      client_emails: emailList,
      responsible: inputs.responsiblePerson,
      approver: inputs.approver,
      level_1: sportList,
      level_2: businessUnit,
      level_3: categoryList,
      fee_type: inputs.feeType,
    })
      .then(() => {
        setInputs({
          name: "",
          email: "",
          responsiblePerson: "",
          approver: "",
          sports: "",
          categories: [],
          businessUnits: [],
          feeType: "",
        });
        setSportList([])
        setBusinessUnit([])
        setCategoryList([])
        setIsOpen(false)
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="z-50">
      {/* Show alert only when needed */}
      {isSuccess && (
        <AlertMain
          alert={{
            variant: "success",
            message: "Client created successfully!",
            position: "bottom-right",
          }}
        />
      )}
      {isError && (
        <AlertMain
          alert={{
            variant: "error",
            message: message,
            position: "bottom-right",
          }}
        />
      )}

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          {/* Modal container */}
          <div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">
            <div className="w-full flex justify-end px-5 pt-5"></div>

            {/* Header */}
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
              <div className="flex items-start gap-3">
                <Input
                  type="text"
                  value={inputs.name}
                  handleOnChange={(e) => handleOnChange("name", e.target.value)}
                  label="Client Name"
                  placeholder="Client Name"
                />
                <div className="w-[60%] shrink-0">
                  <div className="shrink-0 flex items-center w-full gap-3 mb-2">
                    <Input
                      type="email"
                      value={inputs.email}
                      handleOnChange={(e) =>
                        handleOnChange("email", e.target.value)
                      }
                      label="Client emails (add up to 5 emails)"
                      placeholder="Enter email address"
                    />
                    <button
                      className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white mt-8"
                      onClick={handleAddEmail}
                    >
                      Add
                    </button>
                  </div>
                  <div className="w-[78%]">
                    {emailList?.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between"
                      >
                        <p className="text-[14px]">{email}</p>
                        <MdOutlineCancel
                          size={18}
                          color="red"
                          onClick={() => handleRemoveEmail(email)}
                          className="cursor-pointer"
                        />
                        {/* <p
                          className="text-red-500 cursor-pointer"
                          onClick={() => handleRemoveEmail(email)}
                        >
                          x
                        </p> */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full">
                <ResponsibleApproverDropdowns
                  right={true}
                  setInputs={setInputs}
                />
              </div>
              <div className="w-full flex items-start gap-3">
                <SportDropdown
                  inputs={inputs}
                  setInputs={setInputs}
                  sportList={sportList}
                  setSportList={setSportList}
                  
                />
                <BusinessUnit
                  inputs={inputs}
                  setInputs={setInputs}
                  businessList={businessUnit}
                  setBusinessList={setBusinessUnit}
                />
                <CategoryDropdown
                  inputs={inputs}
                  setInputs={setInputs}
                  categoryList={categoryList}
                  setCategoryList={setCategoryList}
                />
                {/* <EditInputs inputs={inputs} setInputs={setInputs} /> */}
              </div>
              <div className="w-[50%]">
                <FeeDropdowns
                  labelone="Select fee type"
                  islabelone="Fee"
                  inputs={inputs}
                  setInputs={setInputs}
                />
              </div>
            </div>

            {/* Footer  */}
            <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end rounded-b-[32px]">
              <div className="flex items-center gap-5">
                <button className="btn_model_outline">Cancel</button>
                <button
                  className="btn_model_active whitespace-nowrap"
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <SVGLoader width={"30px"} height={"30px"} color={"#FFF"} />
                  ) : (
                    "Add Client"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableModel;
