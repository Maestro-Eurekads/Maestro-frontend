// "use client";
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import closefill from "../../public/close-fill.svg";
// import blueprofile from "../../public/blueprofile.svg";
// import Input from "../../components/Input";
// import ResponsibleApproverDropdowns from "../../components/ResponsibleApproverDropdowns";
// import FeeDropdowns from "./FeeDropdowns";
// import CategoryDropdown from "./components/CategoryDropdown";
// import SportDropdown from "./components/SportDropdown";
// import BusinessUnit from "./components/BusinessUnit";
// import { SVGLoader } from "../../components/SVGLoader";
// import AlertMain from "../../components/Alert/AlertMain";
// import { MdOutlineCancel } from "react-icons/md";
// import {
//   addClientUser,
//   addNewClient,
//   checkExisitingEmails,
// } from "./functions/clients";
// import { getCreateClient } from "features/Client/clientSlice";
// import { useAppDispatch } from "store/useStore";
// import { useCampaigns } from "app/utils/CampaignsContext";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import { useUserPrivileges } from "utils/userPrivileges";
// import { v4 as uuidv4 } from "uuid";

// const TableModel = ({ isOpen, setIsOpen }) => {
//   const { data: session } = useSession();
//   // @ts-ignore
//   const userType = session?.user?.data?.user?.id || "";
//   const dispatch = useAppDispatch();
//   const { profile, getProfile, user, getUserByUserType } = useCampaigns();
//   const { isAdmin, isAgencyApprover, isFinancialApprover } =
//     useUserPrivileges();
//   const [inputs, setInputs] = useState({
//     name: "",
//     email: "",
//     full_name: "",
//     responsiblePerson: [],
//     approver: [],
//     sports: [],
//     categories: [],
//     businessUnits: [],
//   });
//   const [emailList, setEmailList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState(null);

//   console.log('profile-user-user', inputs)

//   //  Automatically reset alert after showing
//   useEffect(() => {
//     if (alert) {
//       const timer = setTimeout(() => setAlert(null), 3000); // Reset after 3 seconds
//       return () => clearTimeout(timer);
//     }
//   }, [alert]);
//   const handleAddEmail = () => {
//     if (emailList.length >= 5) {
//       toast.error("You can only add up to 5 email addresses.");
//       return;
//     }
//     const trimmedEmail = inputs.email.trim();
//     const fullName = inputs.full_name.trim();

//     //  Email validation regex
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     const fullNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)+$/; // At least two words, letters only
//     const onlyLettersRegex = /^[A-Za-z ]+$/; // allows letters and spaces only
//     const hasTwoWords = fullName.split(" ").filter(Boolean).length >= 2;

//     const isValidFullName = fullNameRegex.test(fullName);

//     if (!trimmedEmail) {
//       toast.error("Email cannot be empty");
//       return;
//     }

//     if (!emailRegex.test(trimmedEmail)) {
//       toast.error("Invalid email format");
//       return;
//     }

//     if (!onlyLettersRegex.test(fullName)) {
//       toast.error(
//         "Full name must contain only alphabetic characters and spaces."
//       );
//       return;
//     }

//     if (!hasTwoWords) {
//       toast.error("Full name must include both first and last name.");
//       return;
//     }

//     // Check if email already exists in emailList
//     const emailExists = emailList.some(
//       (item) => item.email.toLowerCase() === trimmedEmail.toLowerCase()
//     );
//     if (emailExists) {
//       toast.error("This email address is already added");
//       return;
//     }

//     if (emailList.length >= 5) {
//       toast.error("Maximum 5 emails allowed");
//       return;
//     }

//     setEmailList([...emailList, { full_name: fullName, email: trimmedEmail }]);
//     setInputs((prevState) => ({
//       ...prevState,
//       email: "",
//       full_name: "",
//     }));
//   };

//   const handleRemoveEmail = (email) => {
//     const filteredEmails = emailList.filter((e) => e?.email !== email);
//     setEmailList(filteredEmails);
//   };

//   const handleOnChange = (input: string, value: string) => {
//     setInputs((prevState) => ({
//       ...prevState,
//       [input]: value,
//     }));
//   };

//   // Prevent background scrolling when modal is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.classList.add("overflow-hidden");
//     } else {
//       document.body.classList.remove("overflow-hidden");
//     }
//     return () => document.body.classList.remove("overflow-hidden");
//   }, [isOpen]);

//   const validateForm = () => {
//     if (!inputs.name.trim()) {
//       toast.error("Client Name is required");
//       return false;
//     }

//     if (emailList.length === 0) {
//       toast.error("At least one client email is required");
//       return false;
//     }

//     if (!inputs.responsiblePerson) {
//       toast.error("Responsible Person is required");
//       return false;
//     }

//     if (!inputs.approver) {
//       toast.error("Approver is required");
//       return false;
//     }

//     // if (inputs.sports.length < 2 || !inputs.sports[0] || !inputs.sports[1]) {
//     //   toast.error("At least two Business Level 1 entries are required");
//     //   return false;
//     // }

//     // if (
//     //   inputs.businessUnits.length < 2 ||
//     //   !inputs.businessUnits[0] ||
//     //   !inputs.businessUnits[1]
//     // ) {
//     //   toast.error("At least two Business Level 2 entries are required");
//     //   return false;
//     // }

//     // if (
//     //   inputs.categories.length < 2 ||
//     //   !inputs.categories[0] ||
//     //   !inputs.categories[1]
//     // ) {
//     //   toast.error("At least two Business Level 3 entries are required");
//     //   return false;
//     // }


//     return true;
//   };

//   // Modify the handleSubmit function to use the validation
//   const handleSubmit = async () => {
//     // Validate form before submission
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       const existingUsers = await checkExisitingEmails(
//         emailList?.map((ed) => ed?.email)
//       );
//       // console.log("🚀 ~ handleSubmit ~ existingUsers:", existingUsers);
//       if (existingUsers?.length > 0) {
//         toast.error(
//           `User(s) with the following email(s) already exist: ${existingUsers
//             .map((user) => user.email)
//             .join(", ")}`
//         );
//       } else {
//         const res = await addNewClient({
//           client_name: inputs.name,
//           client_emails: emailList,
//           responsible: inputs.responsiblePerson,
//           approver: inputs.approver,
//           level_1: inputs.sports,
//           level_2: inputs.businessUnits,
//           level_3: inputs.categories,
//           users: profile?.id,
//         });
//         localStorage.setItem(userType.toString(), res?.data?.data?.id);

//         getProfile();
//         // Create a user account for each client email in emailList
//         for (const emailEntry of emailList) {
//           try {
//             await addClientUser({
//               username: `${emailEntry.full_name}-${uuidv4().slice(0, 4)}`,
//               email: emailEntry.email,
//               password: "123456789",
//               clients: res?.data?.data?.id,
//               user_type: "sub_client",
//             });
//           } catch (error) {
//             console.error(
//               `Failed to create user for email: ${emailEntry.email}`,
//               error
//             );
//             toast.error(`Failed to create user for ${emailEntry.email}`);
//           }
//         }
//         // Fetch clients after successfully adding a new one
//         //@ts-ignore
//         dispatch(getCreateClient(!isAdmin ? res?.data?.data?.id : null));
//         // Reset form state
//         setInputs({
//           name: "",
//           email: "",
//           responsiblePerson: [],
//           approver: [],
//           sports: [],
//           categories: [],
//           businessUnits: [],
//           full_name: "",
//         });
//         setEmailList([]);

//         setIsOpen(false);
//       }
//     } catch (error) {
//       const errors: any =
//         error.response?.data?.error?.details?.errors ||
//         error.response?.data?.error?.message ||
//         error.message ||
//         [];
//       setAlert({ variant: "error", message: errors, position: "bottom-right" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setInputs({
//       name: "",
//       email: "",
//       responsiblePerson: [],
//       approver: [],
//       sports: [],
//       categories: [],
//       businessUnits: [],
//       full_name: "",
//     });
//     setEmailList([]);
//   };



//   const userTypes = ["agency_creator", "agency_approver", "financial_approver"];

//   useEffect(() => {
//     if (isOpen) {
//       getUserByUserType(userTypes);
//     }
//   }, [isOpen]);

//   const options = user?.map((user) => user);
//   const excludedTypes = ["agency_creator"];

//   const option = user
//     ?.filter((user) => !excludedTypes.includes(user?.user_type))
//     .map((user) => user);



//   return (
//     <div className="z-50">
//       {/* Show Alert */}
//       {alert && <AlertMain alert={alert} />}
//       {isOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           {/* Modal container */}
//           <div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">
//             <div className="w-full flex justify-end px-5 pt-5"></div>

//             {/* Header */}
//             <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-[32px]">
//               <div className="flex items-center gap-5">
//                 <div className="madel_profile">
//                   <Image src={blueprofile || "/placeholder.svg"} alt="menu" />
//                 </div>
//                 <div className="madel_profile_text_container">
//                   <h3>Add a new client</h3>
//                   <p>Define the client structure and initial setup.</p>
//                 </div>
//               </div>
//               <button
//                 className="text-gray-500 hover:text-gray-800"
//                 onClick={() => {
//                   setIsOpen(false);
//                   resetForm();
//                 }}
//               >
//                 <Image src={closefill || "/placeholder.svg"} alt="menu" />
//               </button>
//             </div>

//             {/* Scrollable Body */}
//             <div className="p-6 overflow-y-auto max-h-[60vh]">
//               <Input
//                 type="text"
//                 value={inputs.name}
//                 handleOnChange={(e) => handleOnChange("name", e.target.value)}
//                 label="Client Name"
//                 placeholder="Client Name"
//               />
//               <div className="mt-4">
//                 <div className="flex justify-between items-center mb-1">
//                   <label className="font-medium text-[15px] leading-5 text-gray-600">
//                     Client emails (add up to 5 emails)
//                   </label>
//                   <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//                     {emailList.length}/5
//                   </span>
//                 </div>

//                 <div className="flex items-start gap-3 w-full">
//                   <div className="shrink-0 w-[40%]">
//                     <Input
//                       type="email"
//                       value={inputs.email}
//                       handleOnChange={(e) =>
//                         handleOnChange("email", e.target.value)
//                       }
//                       label=""
//                       placeholder="Enter email address"
//                     />
//                   </div>
//                   <div className="shrink-0 w-[60%] flex items-end gap-3">
//                     <Input
//                       type="text"
//                       value={inputs.full_name}
//                       handleOnChange={(e) =>
//                         handleOnChange("full_name", e.target.value)
//                       }
//                       label=""
//                       placeholder="Full Name"
//                     />
//                     <button
//                       className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white"
//                       onClick={handleAddEmail}
//                     // disabled={emailList.length >= 5}
//                     >
//                       Add
//                     </button>
//                   </div>
//                 </div>
//               </div>
//               {/* Email List Display */}
//               {emailList.length > 0 && (
//                 <div className="w-full mt-2 mb-4">
//                   <div className="border border-gray-200 rounded-lg overflow-hidden">
//                     <div className="max-h-[150px] overflow-y-auto">
//                       <ul className="divide-y divide-gray-100">
//                         {emailList.map((email, index) => (
//                           <li
//                             key={index}
//                             className="flex items-center justify-between p-3 hover:bg-gray-50 group"
//                           >
//                             <div className="flex items-center gap-3">
//                               <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
//                                 {email.full_name.charAt(0).toUpperCase()}
//                               </div>
//                               <div>
//                                 <p className="font-medium text-sm">
//                                   {email.full_name}
//                                 </p>
//                                 <p className="text-xs text-gray-500">
//                                   {email.email}
//                                 </p>
//                               </div>
//                             </div>
//                             <button
//                               onClick={() => handleRemoveEmail(email.email)}
//                               className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
//                             >
//                               <MdOutlineCancel size={18} />
//                             </button>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="w-full">
//                 <ResponsibleApproverDropdowns
//                   right={false}
//                   setInputs={setInputs}
//                   options={!options ? [] : options}
//                   option={!option ? [] : option}
//                 />
//               </div>
//               <div className="w-full flex items-start gap-3">
//                 <BusinessUnit setInputs={setInputs} setAlert={setAlert} />
//                 <SportDropdown setInputs={setInputs} setAlert={setAlert} />

//                 <CategoryDropdown setInputs={setInputs} setAlert={setAlert} />
//               </div>
//               {/* <div className="w-[50%]">
//                 <FeeDropdowns
//                   labelone="Select fee type"
//                   islabelone="Fee"
//                   inputs={inputs}
//                   setInputs={setInputs}
//                 />
//               </div> */}
//             </div>

//             {/* Footer  */}
//             <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end rounded-b-[32px]">
//               <div className="flex items-center gap-5">
//                 <button
//                   onClick={() => {
//                     setIsOpen(false);
//                     resetForm();
//                   }}
//                   className="btn_model_outline"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="btn_model_active whitespace-nowrap"
//                   onClick={handleSubmit}
//                 >
//                   {loading ? (
//                     <SVGLoader width={"30px"} height={"30px"} color={"#FFF"} />
//                   ) : (
//                     "Add Client"
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TableModel;


"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../public/close-fill.svg";
import blueprofile from "../../public/blueprofile.svg";
import Input from "../../components/Input";
import FeeDropdowns from "./FeeDropdowns";
import CategoryDropdown from "./components/CategoryDropdown";
import SportDropdown from "./components/SportDropdown";
import BusinessUnit from "./components/BusinessUnit";
import { SVGLoader } from "../../components/SVGLoader";
import AlertMain from "../../components/Alert/AlertMain";
import { MdOutlineCancel } from "react-icons/md";
import {
  addClientUser,
  addNewClient,
  checkExisitingEmails,
} from "./functions/clients";
import { getCreateClient } from "features/Client/clientSlice";
import { useAppDispatch } from "store/useStore";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useUserPrivileges } from "utils/userPrivileges";
import { v4 as uuidv4 } from "uuid";

const TableModel = ({ isOpen, setIsOpen }) => {
  const { data: session }: any = useSession();
  const userType = session?.user?.data?.user?.id || "";
  const dispatch = useAppDispatch();
  const { profile, getProfile, user, getUserByUserType, jwt } = useCampaigns();
  const { isAdmin, isAgencyApprover, isFinancialApprover } = useUserPrivileges();

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    full_name: "",
    agencyAccess: [], // Previously responsiblePerson
    clientAccess: [], // Previously approver
    sports: [],
    categories: [],
    businessUnits: [],
  });

  const [agencyInput, setAgencyInput] = useState({ name: "", email: "", roles: [] });
  const [clientInput, setClientInput] = useState({ name: "", email: "", roles: [] });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Automatically reset alert after showing
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  // Fetch user types for validation
  const userTypes = ["agency_creator", "agency_approver", "financial_approver"];
  useEffect(() => {
    if (isOpen) {
      getUserByUserType(userTypes);
    }
  }, [isOpen]);

  // Email and name validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fullNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)+$/;
  const onlyLettersRegex = /^[A-Za-z ]+$/;

  // Handle adding a user to Agency Access
  const handleAddAgencyAccess = () => {
    const { name, email, roles } = agencyInput;
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const hasTwoWords = trimmedName.split(" ").filter(Boolean).length >= 2;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!trimmedName || !onlyLettersRegex.test(trimmedName) || !hasTwoWords) {
      toast.error("Full name must include first and last name with letters only");
      return;
    }

    if (roles.length === 0) {
      toast.error("At least one role must be selected for Agency Access");
      return;
    }

    if (inputs.agencyAccess.some((item) => item.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      toast.error("This email address is already added to Agency Access");
      return;
    }

    setInputs((prev) => ({
      ...prev,
      agencyAccess: [...prev.agencyAccess, { name: trimmedName, email: trimmedEmail, roles }],
    }));
    setAgencyInput({ name: "", email: "", roles: [] });
  };

  // Handle adding a user to Client Access
  const handleAddClientAccess = () => {
    const { name, email, roles } = clientInput;
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const hasTwoWords = trimmedName.split(" ").filter(Boolean).length >= 2;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!trimmedName || !onlyLettersRegex.test(trimmedName) || !hasTwoWords) {
      toast.error("Full name must include first and last name with letters only");
      return;
    }

    if (roles.length === 0) {
      toast.error("At least one role must be selected for Client Access");
      return;
    }

    if (inputs.clientAccess.some((item) => item.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      toast.error("This email address is already added to Client Access");
      return;
    }

    setInputs((prev) => ({
      ...prev,
      clientAccess: [...prev.clientAccess, { name: trimmedName, email: trimmedEmail, roles }],
    }));
    setClientInput({ name: "", email: "", roles: [] });
  };

  // Handle role checkbox changes
  const handleRoleChange = (section, role) => {
    if (section === "agency") {
      setAgencyInput((prev) => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter((r) => r !== role)
          : [...prev.roles, role],
      }));
    } else {
      setClientInput((prev) => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter((r) => r !== role)
          : [...prev.roles, role],
      }));
    }
  };

  // Handle removing a user from Agency or Client Access
  const handleRemoveUser = (section, email) => {
    setInputs((prev) => ({
      ...prev,
      [section]: prev[section].filter((e) => e.email !== email),
    }));
  };

  // Handle input changes for form fields
  const handleOnChange = (input, value) => {
    setInputs((prevState) => ({
      ...prevState,
      [input]: value,
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    if (!inputs.name.trim()) {
      toast.error("Client Name is required");
      return false;
    }

    if (inputs.agencyAccess.length === 0) {
      toast.error("At least one Agency Access user is required");
      return false;
    }

    if (inputs.clientAccess.length === 0) {
      toast.error("At least one Client Access user is required");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const allEmails = [...inputs.agencyAccess, ...inputs.clientAccess].map((e) => e.email);
      const existingUsers = await checkExisitingEmails(allEmails, jwt);
      if (existingUsers?.length > 0) {
        toast.error(
          `User(s) with the following email(s) already exist: ${existingUsers
            .map((user) => user.email)
            .join(", ")}`
        );
      } else {
        const res = await addNewClient({
          client_name: inputs.name,
          client_emails: inputs.clientAccess.map((e) => ({ email: e.email, full_name: e.name })),
          responsible: inputs.agencyAccess,
          approver: inputs.clientAccess,
          level_1: inputs.sports,
          level_2: inputs.businessUnits,
          level_3: inputs.categories,
          users: profile?.id,
        }, jwt);
        localStorage.setItem(userType.toString(), res?.data?.data?.id);

        getProfile();

        // Create user accounts for Client Access emails
        for (const emailEntry of inputs.clientAccess) {
          try {
            await addClientUser({
              username: `${emailEntry.name}-${uuidv4().slice(0, 4)}`,
              email: emailEntry.email,
              password: "123456789",
              clients: res?.data?.data?.id,
              user_type: "sub_client",
            }, jwt);
          } catch (error) {
            console.error(`Failed to create user for email: ${emailEntry.email}`, error);
            toast.error(`Failed to create user for ${emailEntry.email}`);
          }
        }
        // Fetch clients after successfully adding a new one
        //@ts-ignore
        dispatch(getCreateClient({userId:!isAdmin ? res?.data?.data?.id : null, jwt}));
        // Reset form state
        setInputs({
          name: "",
          email: "",
          full_name: "",
          agencyAccess: [],
          clientAccess: [],
          sports: [],
          categories: [],
          businessUnits: [],
        });
        setAgencyInput({ name: "", email: "", roles: [] });
        setClientInput({ name: "", email: "", roles: [] });
        setIsOpen(false);
      }
    } catch (error) {
      const errors =
        error.response?.data?.error?.details?.errors ||
        error.response?.data?.error?.message ||
        error.message ||
        [];
      setAlert({ variant: "error", message: errors, position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setInputs({
      name: "",
      email: "",
      full_name: "",
      agencyAccess: [],
      clientAccess: [],
      sports: [],
      categories: [],
      businessUnits: [],
    });
    setAgencyInput({ name: "", email: "", roles: [] });
    setClientInput({ name: "", email: "", roles: [] });
  };

  return (
    <div className="z-50">
      {alert && <AlertMain alert={alert} />}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">
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

              {/* Agency Access Section */}
              <div className="mt-4">
                <label className="font-medium text-[15px] leading-5 text-gray-600">
                  Agency Access
                </label>
                <div className="flex items-start gap-3 w-full mt-2">
                  <div className="flex flex-col items-start gap-1 w-full">

                    <div className="shrink-0 w-[100%]">
                      <Input
                        type="text"
                        value={agencyInput.name}
                        handleOnChange={(e) =>
                          setAgencyInput((prev) => ({ ...prev, name: e.target.value }))
                        }
                        label=""
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="shrink-0 w-[100%]">
                      <Input
                        type="email"
                        value={agencyInput.email}
                        handleOnChange={(e) =>
                          setAgencyInput((prev) => ({ ...prev, email: e.target.value }))
                        }
                        label=""
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="shrink-0 w-[25%]">
                    <label className="font-medium text-[15px] leading-5 text-gray-600">Role</label>
                    <div className="mt-1">
                      {["Creator", "Approver", "Finance Approver"].map((role) => (
                        <div key={role} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={agencyInput.roles.includes(role.toLowerCase())}
                            onChange={() => handleRoleChange("agency", role.toLowerCase())}
                          />
                          <span className="text-sm">{role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white mt-6"
                    onClick={handleAddAgencyAccess}
                  >
                    Add
                  </button>
                </div>
                {inputs.agencyAccess.length > 0 && (
                  <div className="w-full mt-2 mb-4">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-[150px] overflow-y-auto">
                        <ul className="divide-y divide-gray-100">
                          {inputs.agencyAccess.map((user, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{user.name}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                  <p className="text-xs text-gray-500">
                                    Roles: {user.roles.join(", ")}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveUser("agencyAccess", user.email)}
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
              </div>

              {/* Client Access Section */}
              <div className="mt-4  mb-4">
                <label className="font-medium text-[15px] leading-5 text-gray-600">
                  Client Access
                </label>
                <div className="flex items-start gap-3 w-full mt-2">
                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="shrink-0 w-[100%]">
                      <Input
                        type="text"
                        value={clientInput.name}
                        handleOnChange={(e) =>
                          setClientInput((prev) => ({ ...prev, name: e.target.value }))
                        }
                        label=""
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="shrink-0 w-[100%]">
                      <Input
                        type="email"
                        value={clientInput.email}
                        handleOnChange={(e) =>
                          setClientInput((prev) => ({ ...prev, email: e.target.value }))
                        }
                        label=""
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div className="shrink-0 w-[25%]">
                    <label className="font-medium text-[15px] leading-5 text-gray-600">Role</label>
                    <div className="mt-1">
                      {["Viewer", "Approver"].map((role) => (
                        <div key={role} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={clientInput.roles.includes(role.toLowerCase())}
                            onChange={() => handleRoleChange("client", role.toLowerCase())}
                          />
                          <span className="text-sm">{role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white mt-6"
                    onClick={handleAddClientAccess}
                  >
                    Add
                  </button>
                </div>
                {inputs.clientAccess.length > 0 && (
                  <div className="w-full mt-2 mb-4">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-[150px] overflow-y-auto">
                        <ul className="divide-y divide-gray-100">
                          {inputs.clientAccess.map((user, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{user.name}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                  <p className="text-xs text-gray-500">
                                    Roles: {user.roles.join(", ")}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveUser("clientAccess", user.email)}
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
              </div>

              <div className="w-full flex items-start gap-3">
                <BusinessUnit setInputs={setInputs} setAlert={setAlert} />
                <SportDropdown setInputs={setInputs} setAlert={setAlert} />
                <CategoryDropdown setInputs={setInputs} setAlert={setAlert} />
              </div>
            </div>

            {/* Footer */}
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
