"use client";
import { useState, useEffect, SetStateAction } from "react";
import Image from "next/image";
import closefill from "../../../public/close-fill.svg";
import blueprofile from "../../../public/blueprofile.svg";
// import EditInputs from "../../components/EditInput"; 
import { MdOutlineCancel } from "react-icons/md";
import { getCreateClient } from "features/Client/clientSlice";
import { useAppDispatch } from "store/useStore";
import { SVGLoader } from "components/SVGLoader";
import Input from "components/Input";

const ApproveModel = ({ isOpen, setIsOpen }) => {
  const dispatch = useAppDispatch();
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
  const [emailList, setEmailList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);



  //  Automatically reset alert after showing
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000); // Reset after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [alert]);
  const handleAddEmail = () => {
    const trimmedEmail = inputs.email.trim();

    //  Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setAlert({ variant: "error", message: "Email cannot be empty", position: "bottom-right" });
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setAlert({ variant: "error", message: "Invalid email format", position: "bottom-right" });
      return;
    }

    if (emailList.includes(trimmedEmail)) {
      setAlert({ variant: "warning", message: "Email already exists", position: "bottom-right" });
      return;
    }

    if (emailList.length >= 5) {
      setAlert({ variant: "warning", message: "Maximum 5 emails allowed", position: "bottom-right" });
      return;
    }

    setEmailList([...emailList, trimmedEmail]);
    setInputs((prevState) => ({
      ...prevState,
      email: "",
    }));
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





  const handleSubmit = async () => {
    setLoading(true);
  };


  return (
    <div className="z-50">
      {/* Show Alert */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          {/* Modal container */}
          <div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">
            <div className="w-full flex justify-end px-5 pt-5"></div>

            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-[32px]">
              <div className="flex items-center gap-5">
                <div className="madel_profile_text_container">
                  <h3>Approve & Sign Media plan</h3>
                  {/* <p>Define the client structure and initial setup.</p> */}
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
              <div className="flex items-start gap-3 mb-5">
                <div className="flex flex-col w-full">
                  <label className="w-[124px] h-[19px]   text-[14px] leading-[19px] text-[#061237]  " htmlFor="custom-textarea">
                   Enter Full Name
                  </label>
                  <Input
                    type="text"
                    value={inputs.name}
                    handleOnChange={(e) => handleOnChange("name", e.target.value)}
                    label=""
                    placeholder=""
                  />
                </div>
                <div className="w-[50%] shrink-0">
                  <div className="shrink-0 flex items-center w-full gap-3">
                    <div className="flex flex-col w-full">
                      <label className="w-[124px] h-[19px]   text-[14px] leading-[19px] text-[#061237]  " htmlFor="custom-textarea">
                        Enter date
                      </label>
                      <Input
                        type="email"
                        value={inputs.email}
                        handleOnChange={(e) => handleOnChange("email", e.target.value)}
                        label=""
                        placeholder=""
                      />
                    </div>
                    {/* <button
                      className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white "
                      onClick={handleAddEmail}
                    >
                      Add
                    </button> */}
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
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="mb-5">
                <div className="flex flex-col w-full">
                  <label className="w-[124px] h-[19px]   text-[14px] leading-[19px] text-[#061237]  " htmlFor="custom-textarea">
                    Enter Initials
                  </label>
                  <Input
                    type="email"
                    value={inputs.email}
                    handleOnChange={(e) => handleOnChange("email", e.target.value)}
                    label=""
                    placeholder=""
                  />
                </div>
              </div>

              <div className="shrink-0 flex items-center w-full gap-3 mb-5">
                <div className="flex flex-col w-full">
                  <label className="w-[124px] h-[19px]   text-[14px] leading-[19px] text-[#061237]  " htmlFor="custom-textarea">
                   Upload Signature
                  </label>
                  <Input
                    type="email"
                    value={inputs.email}
                    handleOnChange={(e) => handleOnChange("email", e.target.value)}
                    label=""
                    placeholder=""
                  />
                </div>
                <button
                  className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px]   text-white mt-[12px]"
                  onClick={handleAddEmail}>
                  Add
                </button>
              </div>
            </div>

            {/* Footer  */}
            <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end rounded-b-[32px]">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn_model_outline">Cancel</button>
                <button
                  className="btn_model_active whitespace-nowrap"
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <SVGLoader width={"30px"} height={"30px"} color={"#FFF"} />
                  ) : (
                    "Approve"
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

export default ApproveModel;