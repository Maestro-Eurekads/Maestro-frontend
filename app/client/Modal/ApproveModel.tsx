import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../../public/close-fill.svg";
import { SVGLoader } from "components/SVGLoader";
import Input from "components/Input";
import SignatureInput from "./SignatureInput";
import DatePickerInput from "components/DatePickerInput";
import { useComments } from "app/utils/CommentProvider";
import { useSession } from "next-auth/react";
import { useCampaigns } from "app/utils/CampaignsContext";
import { toast } from "sonner";
import axios from "axios";
import { useUserPrivileges } from "utils/userPrivileges";

const ApproveModel = ({ isOpen, setIsOpen }) => {
  const { campaignData, jwt } = useCampaigns();
  const {
    setIsLoadingApproval,
    isLoadingApproval,
    createAsignatureapproval,
    createApprovalSuccess,
  } = useComments();

  const isdocumentId = campaignData?.documentId;

  const {
    loggedInUser,
    isAdmin,
    isAgencyCreator,
    isAgencyApprover,
    isFinancialApprover,
    isClientApprover,
    isClient,
    userID,
  } = useUserPrivileges();

  const { data: session }: any = useSession();
  const [sign, setSign] = useState("");
  const id = session?.user?.id;
  const [inputs, setInputs] = useState({
    name: "",
    date: "",
    signature: "",
    initials: "",
  });

  useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      signature: sign,
    }));
  }, [sign]);

  // const isInternalApprover = isAdmin || isAgencyApprover || isFinancialApprover;
  // const isCreator = isAgencyCreator;

  // const stage = campaignData?.isStatus?.stage;

  // useEffect(() => {
  //   if (!campaignData) return;
  // setStep('client');
  // setTitle('Client Approval Needed');
  // setStatusMessage('Please approve the media plan or request changes.');
  // }, [campaignData?.isStatus?.stage, stage]);

  //  Automatically reset alert after showing

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

  const updateStatus = async (stage, label) => {
    if (!campaignData?.documentId) return;
    try {
      const newStatus = {
        stage,
        label,
        actor: {
          id: loggedInUser?.id,
          name: loggedInUser?.username,
          role: loggedInUser?.user_type,
        },
        date: new Date().toISOString(),
      };

      const patchData = {
        isStatus: newStatus,
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignData?.documentId}`,
        {
          data: patchData,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      toast.success(`Media plan marked as '${label}'`);
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      toast.error(error?.message || "Failed to update status");
    } finally {
    }
  };

  const handleSubmit = async () => {
    // Check if user is a client (Client overview || Campaign viewer) - they cannot approve
    if (isClient) {
      toast.error(
        "Client overview and Campaign viewer users cannot approve media plans."
      );
      return;
    }

    if (Object.values(inputs).some((value) => value.trim() === "")) return;
    try {
      await createAsignatureapproval(sign, inputs, id, isdocumentId);
      await updateStatus("approved", "Approved");
      setIsLoadingApproval(false);
      // Commented out to keep signature visible after approval
      // setSign("");
    } catch (error) {}
  };

  useEffect(() => {
    if (createApprovalSuccess) {
      toast.success("Aprroval is Successful!");
    }
    // Commented out to keep approval data visible after successful approval
    // setInputs({
    //   name: "",
    //   date: "",
    //   signature: "",
    //   initials: "",
    // });
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
                onClick={() => setIsOpen(false)}>
                <Image src={closefill} alt="menu" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex flex-col w-full">
                  <label
                    className="w-[124px] h-[19px]   text-[14px] leading-[19px] text-[#061237]  "
                    htmlFor="custom-textarea">
                    Enter Full Name
                  </label>
                  <Input
                    type="text"
                    value={inputs.name}
                    handleOnChange={(e) =>
                      handleOnChange("name", e.target.value)
                    }
                    label=""
                    placeholder=""
                  />
                </div>
                <div className="w-[50%] shrink-0">
                  <div className="shrink-0 flex items-center w-full gap-3">
                    <div className="flex flex-col w-full">
                      <label
                        className="w-[124px] h-[19px]   text-[14px] leading-[19px] text-[#061237]  "
                        htmlFor="custom-textarea">
                        Enter date
                      </label>
                      <DatePickerInput
                        type="date"
                        value={inputs.date}
                        handleOnChange={(e) =>
                          handleOnChange("date", e.target.value)
                        }
                        label=""
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex flex-col w-full">
                  <label
                    className="w-[124px] h-[19px] text-[14px] leading-[19px] text-[#061237]  "
                    htmlFor="custom-textarea">
                    Enter Initials
                  </label>
                  <Input
                    type="initials"
                    value={inputs.initials}
                    handleOnChange={(e) =>
                      handleOnChange("initials", e.target.value)
                    }
                    label=""
                    placeholder=""
                  />
                </div>
              </div>

              <div className="shrink-0 flex items-center w-full gap-3 mb-5">
                <div className="flex flex-col w-full">
                  <label
                    className="w-[124px] h-[19px] text-[14px] leading-[19px] text-[#061237]  "
                    htmlFor="custom-textarea">
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
                  className="btn_model_outline">
                  Cancel
                </button>
                <button
                  className={`whitespace-nowrap ${
                    isClient
                      ? "bg-gray-400 cursor-not-allowed opacity-50"
                      : "btn_model_active"
                  }`}
                  onClick={
                    isClient
                      ? () => {
                          toast.error(
                            "Client overview and Campaign viewer users cannot approve media plans."
                          );
                        }
                      : handleSubmit
                  }
                  disabled={isClient}>
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
