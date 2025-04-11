"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../../public/close-fill.svg";
import { SVGLoader } from "components/SVGLoader";
import Input from "components/Input";
import SignatureInput from "./SignatureInput";
import DatePickerInput from "components/DatePickerInput";
import { useComments } from "app/utils/CommentProvider";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "store/useStore";
import { reset } from "features/Comment/commentSlice";

const ApproveModel = ({ isOpen, setIsOpen }) => {
  const { setIsLoadingApproval, isLoadingApproval, createAsignatureapproval, createApprovalSuccess } = useComments();

  const { data: session }: any = useSession();
  const [alert, setAlert] = useState(null);
  const dispatch = useAppDispatch();
  const [sign, setSign] = useState('');
  const id = session?.user?.id
  const [inputs, setInputs] = useState({
    name: "",
    date: "",
    signature: "",
    initials: ""
  });






  //  Automatically reset alert after showing
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000); // Reset after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [alert]);



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
    if (Object.values(inputs).some((value) => value.trim() === "")) return;
    try {
      await createAsignatureapproval(sign, inputs, id); // if createApproval takes arguments
      setIsLoadingApproval(false)
      setSign("");
    } catch (error) {
    }
  };


  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    if (createApprovalSuccess) {
      setAlert({ variant: "success", message: "Aprroval is Successful!", position: "bottom-right" });
    }


  }, [createApprovalSuccess]);



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
                      <DatePickerInput
                        type="date"
                        value={inputs.date}
                        handleOnChange={(e) => handleOnChange("date", e.target.value)}
                        label=""
                        placeholder=""
                      />
                    </div>

                  </div>
                </div>

              </div>

              <div className="mb-5">
                <div className="flex flex-col w-full">
                  <label className="w-[124px] h-[19px] text-[14px] leading-[19px] text-[#061237]  " htmlFor="custom-textarea">
                    Enter Initials
                  </label>
                  <Input
                    type="initials"
                    value={inputs.initials}
                    handleOnChange={(e) => handleOnChange("initials", e.target.value)}
                    label=""
                    placeholder=""
                  />
                </div>
              </div>

              <div className="shrink-0 flex items-center w-full gap-3 mb-5">
                <div className="flex flex-col w-full">
                  <label className="w-[124px] h-[19px] text-[14px] leading-[19px] text-[#061237]  " htmlFor="custom-textarea">
                    Signature
                  </label>
                  <SignatureInput
                    setSign={setSign}
                    value={inputs.signature}
                    onChange={(val) => setInputs({ ...inputs, signature: val })}
                  />
                </div>

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
                  {isLoadingApproval ? (
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


