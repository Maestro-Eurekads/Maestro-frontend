"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../public/close-fill.svg";
import blueprofile from "../../public/blueprofile.svg";
import Input from "../../components/Input";
import ResponsibleApproverDropdowns from "../../components/ResponsibleApproverDropdowns";
import FeeDropdowns from "./FeeDropdowns";
import CategoryDropdown from "./components/CategoryDropdown";
import SportDropdown from "./components/SportDropdown";
import BusinessUnit from "./components/BusinessUnit";
import { SVGLoader } from "../../components/SVGLoader";
import AlertMain from "../../components/Alert/AlertMain";
import { MdOutlineCancel } from "react-icons/md";
import { addNewClient } from "./functions/clients";
import { getCreateClient } from "features/Client/clientSlice";
import { useAppDispatch } from "store/useStore";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const TableModel = ({ isOpen, setIsOpen }) => {
  const { data: session } = useSession();
  // @ts-ignore 
  const userType = session?.user?.data?.user?.id || "";
  const dispatch = useAppDispatch();
  const { profile, getProfile } = useCampaigns();
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    full_name: "",
    responsiblePerson: [],
    approver: [],
    sports: [],
    categories: [],
    businessUnits: [],
    feeType: "",
  });
  const [emailList, setEmailList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  console.log('inputs-inputs', inputs)

  //  Automatically reset alert after showing
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000); // Reset after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [alert]);
  const handleAddEmail = () => {
    if (emailList.length >= 5) {
      toast.error("You can only add up to 5 email addresses.");
      return;
    }
    const trimmedEmail = inputs.email.trim();
    const fullName = inputs.full_name.trim();

    //  Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const fullNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)+$/; // At least two words, letters only
    const onlyLettersRegex = /^[A-Za-z ]+$/; // allows letters and spaces only
    const hasTwoWords = fullName.split(" ").filter(Boolean).length >= 2;

    const isValidFullName = fullNameRegex.test(fullName);

    if (!trimmedEmail) {
      toast.error("Email cannot be empty");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Invalid email format");
      return;
    }

    if (!onlyLettersRegex.test(fullName)) {
      toast.error("Full name must contain only alphabetic characters and spaces.");
      return;
    }

    if (!hasTwoWords) {
      toast.error("Full name must include both first and last name.");
      return;
    }

    // Check if email already exists in emailList
    const emailExists = emailList.some(
      (item) => item.email.toLowerCase() === trimmedEmail.toLowerCase()
    );
    if (emailExists) {
      toast.error("This email address is already added");
      return;
    }

    if (emailList.length >= 5) {
      toast.error("Maximum 5 emails allowed");
      return;
    }

    setEmailList([...emailList, { full_name: fullName, email: trimmedEmail }]);
    setInputs((prevState) => ({
      ...prevState,
      email: "",
      full_name: "",
    }));
  };

  const handleRemoveEmail = (email) => {
    const filteredEmails = emailList.filter((e) => e?.email !== email);
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

  // Add a validation function before the handleSubmit function
  // const validateForm = () => {
  //   // Check if client name is empty
  //   if (!inputs.name.trim()) {
  //     setAlert({
  //       variant: "error",
  //       message: "Client Name is required",
  //       position: "bottom-right",
  //     });
  //     return false;
  //   }

  //   // Check if at least one email is added
  //   if (emailList.length === 0) {
  //     setAlert({
  //       variant: "error",
  //       message: "At least one client email is required",
  //       position: "bottom-right",
  //     });
  //     return false;
  //   }

  //   // Check if responsible person is selected
  //   if (!inputs.responsiblePerson) {
  //     setAlert({
  //       variant: "error",
  //       message: "Responsible Person is required",
  //       position: "bottom-right",
  //     });
  //     return false;
  //   }

  //   // Check if approver is selected
  //   if (!inputs.approver) {
  //     setAlert({
  //       variant: "error",
  //       message: "Approver is required",
  //       position: "bottom-right",
  //     });
  //     return false;
  //   }

  //   // Check if at least two business level 1 (sports) are added
  //   if (inputs.sports.length < 2 || !inputs.sports[0] || !inputs.sports[1]) {
  //     setAlert({
  //       variant: "error",
  //       message: "At least two Business Level 1 entries are required",
  //       position: "bottom-right",
  //     });
  //     return false;
  //   }

  //   // Check if at least two business level 2 (business units) are added
  //   if (
  //     inputs.businessUnits.length < 2 ||
  //     !inputs.businessUnits[0] ||
  //     !inputs.businessUnits[1]
  //   ) {
  //     setAlert({
  //       variant: "error",
  //       message: "At least two Business Level 2 entries are required",
  //       position: "bottom-right",
  //     });
  //     return false;
  //   }

  //   // Check if at least two business level 3 (categories) are added
  //   if (
  //     inputs.categories.length < 2 ||
  //     !inputs.categories[0] ||
  //     !inputs.categories[1]
  //   ) {
  //     setAlert({
  //       variant: "error",
  //       message: "At least two Business Level 3 entries are required",
  //       position: "bottom-right",
  //     });
  //     return false;
  //   }

  //   // Check if fee type is selected
  //   if (!inputs.feeType) {
  //     setAlert({
  //       variant: "error",
  //       message: "Fee Type is required",
  //       position: "bottom-right",
  //     });
  //     return false;
  //   }

  //   return true;
  // };
  const validateForm = () => {
    if (!inputs.name.trim()) {
      toast.error("Client Name is required");
      return false;
    }

    if (emailList.length === 0) {
      toast.error("At least one client email is required");
      return false;
    }

    if (!inputs.responsiblePerson) {
      toast.error("Responsible Person is required");
      return false;
    }

    if (!inputs.approver) {
      toast.error("Approver is required");
      return false;
    }

    if (inputs.sports.length < 2 || !inputs.sports[0] || !inputs.sports[1]) {
      toast.error("At least two Business Level 1 entries are required");
      return false;
    }

    if (
      inputs.businessUnits.length < 2 ||
      !inputs.businessUnits[0] ||
      !inputs.businessUnits[1]
    ) {
      toast.error("At least two Business Level 2 entries are required");
      return false;
    }

    if (
      inputs.categories.length < 2 ||
      !inputs.categories[0] ||
      !inputs.categories[1]
    ) {
      toast.error("At least two Business Level 3 entries are required");
      return false;
    }

    if (!inputs.feeType) {
      toast.error("Fee Type is required");
      return false;
    }

    return true;
  };

  // Modify the handleSubmit function to use the validation
  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await addNewClient({
        client_name: inputs.name,
        client_emails: emailList,
        responsible: inputs.responsiblePerson,
        approver: inputs.approver,
        level_1: inputs.sports,
        level_2: inputs.businessUnits,
        level_3: inputs.categories,
        fee_type: inputs.feeType,
        // user: profile?.id,
      });
      localStorage.setItem(userType.toString(), res?.data?.data?.id);
      getProfile()
      // Fetch clients after successfully adding a new one
      //@ts-ignore
      dispatch(getCreateClient());
      // Reset form state
      setInputs({
        name: "",
        email: "",
        responsiblePerson: [],
        approver: [],
        sports: [],
        categories: [],
        businessUnits: [],
        feeType: "",
        full_name: "",
      });
      setEmailList([]);

      setIsOpen(false);
    } catch (error) {
      const errors: any =
        error.response?.data?.error?.details?.errors ||
        error.response?.data?.error?.message ||
        error.message ||
        [];
      setAlert({ variant: "error", message: errors, position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setInputs({
      name: "",
      email: "",
      responsiblePerson: [],
      approver: [],
      sports: [],
      categories: [],
      businessUnits: [],
      feeType: "",
      full_name: "",
    });
    setEmailList([]);
  };

  return (
    <div className="z-50">
      {/* Show Alert */}
      {alert && <AlertMain alert={alert} />}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          {/* Modal container */}
          <div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">
            <div className="w-full flex justify-end px-5 pt-5"></div>

            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-[32px]">
              <div className="flex items-center gap-5">
                <div className="madel_profile">
                  <Image src={blueprofile || "/placeholder.svg"} alt="menu" />
                </div>
                <div className="madel_profile_text_container">
                  <h3>Add a new client</h3>
                  <p>Define the client structure and initial setup.</p>
                </div>
              </div>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
              >
                <Image src={closefill || "/placeholder.svg"} alt="menu" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <Input
                type="text"
                value={inputs.name}
                handleOnChange={(e) => handleOnChange("name", e.target.value)}
                label="Client Name"
                placeholder="Client Name"
              />
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-[15px] leading-5 text-gray-600">
                    Client emails (add up to 5 emails)
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {emailList.length}/5
                  </span>
                </div>

                <div className="flex items-start gap-3 w-full">
                  <div className="shrink-0 w-[40%]">
                    <Input
                      type="email"
                      value={inputs.email}
                      handleOnChange={(e) =>
                        handleOnChange("email", e.target.value)
                      }
                      label=""
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="shrink-0 w-[60%] flex items-end gap-3">
                    <Input
                      type="text"
                      value={inputs.full_name}
                      handleOnChange={(e) =>
                        handleOnChange("full_name", e.target.value)
                      }
                      label=""
                      placeholder="Full Name"
                    />
                    <button
                      className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white"
                      onClick={handleAddEmail}
                    // disabled={emailList.length >= 5}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              {/* Email List Display */}
              {emailList.length > 0 && (
                <div className="w-full mt-2 mb-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-[150px] overflow-y-auto">
                      <ul className="divide-y divide-gray-100">
                        {emailList.map((email, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                {email.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {email.full_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {email.email}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveEmail(email.email)}
                              className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MdOutlineCancel size={18} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full">
                <ResponsibleApproverDropdowns
                  right={true}
                  setInputs={setInputs}
                />
              </div>
              <div className="w-full flex items-start gap-3">
                <SportDropdown setInputs={setInputs} setAlert={setAlert} />
                <BusinessUnit setInputs={setInputs} setAlert={setAlert} />
                <CategoryDropdown setInputs={setInputs} setAlert={setAlert} />
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
                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  className="btn_model_outline"
                >
                  Cancel
                </button>
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
