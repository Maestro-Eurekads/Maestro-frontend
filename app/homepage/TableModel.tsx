"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../public/close-fill.svg";
import blueprofile from "../../public/blueprofile.svg";
import Input from "../../components/Input";
import CategoryDropdown from "./components/CategoryDropdown";
import SportDropdown from "./components/SportDropdown";
import BusinessUnit from "./components/BusinessUnit";
import { SVGLoader } from "../../components/SVGLoader";
import AlertMain from "../../components/Alert/AlertMain";
import { MdEdit, MdOutlineCancel } from "react-icons/md";
import {
 addClientUser,
 addNewClient,
 checkExisitingEmails
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
 const { profile, getProfile, user, getUserByUserType, jwt, agencyId } = useCampaigns();
 const { isAdmin, isAgencyApprover, isFinancialApprover } = useUserPrivileges();

 const [inputs, setInputs] = useState({
  name: "",
  email: "",
  full_name: "",
  agencyAccess: [],
  clientAccess: [],
  sports: [],
  categories: [],
  businessUnits: [],
 });

 const [agencyInput, setAgencyInput] = useState({ name: "", email: "", roles: "" });
 const [clientInput, setClientInput] = useState({ name: "", email: "", roles: "" });
 const [editingIndex, setEditingIndex] = useState(null); // Track index of user being edited
 const [editingSection, setEditingSection] = useState(null); // Track section being edited ("agencyAccess" or "clientAccess")
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
 const onlyLettersRegex = /^[A-Za-z ]+$/;

 // Handle adding or updating a user to Agency Access
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

  if (!roles) {
   toast.error("At least one role must be selected for Agency Access");
   return;
  }

  if (
   editingIndex === null &&
   inputs.agencyAccess.some((item) => item.email.toLowerCase() === trimmedEmail.toLowerCase())
  ) {
   toast.error("This email address is already added to Agency Access");
   return;
  }

  setInputs((prev) => {
   const updatedAgencyAccess = [...prev.agencyAccess];
   if (editingIndex !== null && editingSection === "agencyAccess") {
    updatedAgencyAccess[editingIndex] = { name: `${trimmedName}`, email: trimmedEmail, roles };
   } else {
    updatedAgencyAccess.push({ name: `${trimmedName}`, email: trimmedEmail, roles });
   }
   return { ...prev, agencyAccess: updatedAgencyAccess };
  });

  setAgencyInput({ name: "", email: "", roles: "" });
  setEditingIndex(null);
  setEditingSection(null);
 };

 // Handle adding or updating a user to Client Access
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

  if (!roles) {
   toast.error("A role must be selected for Client Access");
   return;
  }

  if (
   editingIndex === null &&
   inputs.clientAccess.some((item) => item.email.toLowerCase() === trimmedEmail.toLowerCase())
  ) {
   toast.error("This email address is already added to Client Access");
   return;
  }

  setInputs((prev) => {
   const updatedClientAccess = [...prev.clientAccess];
   if (editingIndex !== null && editingSection === "clientAccess") {
    updatedClientAccess[editingIndex] = { name: `${trimmedName}`, email: trimmedEmail, roles };
   } else {
    updatedClientAccess.push({ name: `${trimmedName}`, email: trimmedEmail, roles });
   }
   return { ...prev, clientAccess: updatedClientAccess };
  });

  setClientInput({ name: "", email: "", roles: "" });
  setEditingIndex(null);
  setEditingSection(null);
 };

 // Handle edit button click
 const handleEditUser = (section, index) => {
  const user = inputs[section][index];
  const [...nameParts] = user.name.split(" ");
  const name = nameParts.join(" ");
  const inputData = { name, email: user.email, roles: user.roles };

  if (section === "agencyAccess") {
   setAgencyInput(inputData);
  } else {
   setClientInput(inputData);
  }

  setEditingIndex(index);
  setEditingSection(section);
 };

 // Handle role checkbox changes (single selection)
 const handleRoleChange = (section, role) => {
  if (section === "agency") {
   setAgencyInput((prev) => ({ ...prev, roles: role }));
  } else {
   setClientInput((prev) => ({ ...prev, roles: role }));
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
  if (!validateForm()) return;

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
    const res = await addNewClient(
     {
      client_name: inputs.name,
      level_1: inputs.sports,
      level_2: inputs.businessUnits,
      level_3: inputs.categories,
      users: profile?.id,
      agency: agencyId,
     },
     jwt
    );
    localStorage.setItem(userType.toString(), res?.data?.data?.id);

    //  getProfile();

    // Create user accounts for Agency Access emails
    for (const emailEntry of inputs.agencyAccess) {
     try {
      await addClientUser(
       {
        username: `${emailEntry.name}-${uuidv4().slice(0, 4)}`,
        email: emailEntry.email,
        password: "123456789",
        clients: res?.data?.data?.id,
        user_type:
         emailEntry?.roles === "agency_creator"
          ? "agency_creator"
          : emailEntry?.roles === "agency_approver"
           ? "agency_approver"
           : "financial_approver",
        agencyId: agencyId,
        emailEntry,
       },
       jwt
      );
     } catch (error) {
      console.error(`Failed to create user for email: ${emailEntry.email}`, error);
      toast.error(`Failed to create user for ${emailEntry.email}`);
     }
    }

    // Create user accounts for Client Access emails
    for (const emailEntry of inputs.clientAccess) {
     try {
      await addClientUser(
       {
        username: `${emailEntry.name}-${uuidv4().slice(0, 4)}`,
        email: emailEntry.email,
        password: "123456789",
        clients: res?.data?.data?.id,
        user_type: emailEntry?.roles === "viewer" ? "client" : "client_approver",
        agencyId: agencyId,
        emailEntry,
       },
       jwt
      );
     } catch (error) {
      console.error(`Failed to create user for email: ${emailEntry.email}`, error);
      toast.error(`Failed to create user for ${emailEntry.email}`);
     }
    }

    await dispatch(getCreateClient({ userId: profile?.id, jwt, agencyId }));

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
    setAgencyInput({ name: "", email: "", roles: "" });
    setClientInput({ name: "", email: "", roles: "" });
    setEditingIndex(null);
    setEditingSection(null);
    setIsOpen(false);
    toast.success("Client created successfully")
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
  setAgencyInput({ name: "", email: "", roles: "" });
  setClientInput({ name: "", email: "", roles: "" });
  setEditingIndex(null);
  setEditingSection(null);
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
          <div className="shrink-0 w-[80%]">
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
           {[
            { label: "Campaign Creator", value: "agency_creator" },
            { label: "Agency Campaign Approver", value: "agency_approver" },
            { label: "Financial Approver", value: "financial_approver" },
           ].map((role) => (
            <div key={role.value} className="flex items-center gap-2">
             <input
              type="checkbox"
              checked={agencyInput.roles === role.value}
              onChange={() => handleRoleChange("agency", role.value)}
             />
             <span className="text-sm">{role.label}</span>
            </div>
           ))}
          </div>
         </div>
         <button
          className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white mt-6"
          onClick={handleAddAgencyAccess}
         >
          {editingIndex !== null && editingSection === "agencyAccess" ? "Update" : "Add"}
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
                 {user.name.charAt(1).toUpperCase()}
                </div>
                <div>
                 <p className="font-medium text-sm">{user.name}</p>
                 <p className="text-xs text-gray-500">{user.email}</p>
                 <p className="text-xs text-gray-500">
                  Role:{" "}
                  {user.roles === "agency_creator"
                   ? "Campaign Creator"
                   : user.roles === "agency_approver"
                    ? "Agency Campaign Approver"
                    : "Financial Approver"}
                 </p>
                </div>
               </div>
               <div className="flex items-center gap-2">
                <button
                 onClick={() => handleEditUser("agencyAccess", index)}
                 className="text-blue-500 group-hover:opacity-100 transition-opacity"
                >
                 <MdEdit size={18} />
                </button>
                <button
                 onClick={() => handleRemoveUser("agencyAccess", user.email)}
                 className="text-red-500 group-hover:opacity-100 transition-opacity"
                >
                 <MdOutlineCancel size={18} />
                </button>
               </div>
              </li>
             ))}
            </ul>
           </div>
          </div>
         </div>
        )}
       </div>

       {/* Client Access Section */}
       <div className="mt-4 mb-4">
        <label className="font-medium text-[15px] leading-5 text-gray-600">
         Client Access
        </label>
        <div className="flex items-start gap-3 w-full mt-2">
         <div className="flex flex-col items-start gap-1 w-full">
          <div className="shrink-0 w-[80%]">
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
           {[
            { label: "Campaign Viewer", value: "viewer" },
            { label: "Client Campaign Approver", value: "approver" },
           ].map((role) => (
            <div key={role.value} className="flex items-center gap-2">
             <input
              type="checkbox"
              checked={clientInput.roles === role.value}
              onChange={() => handleRoleChange("client", role.value)}
             />
             <span className="text-sm">{role.label}</span>
            </div>
           ))}
          </div>
         </div>
         <button
          className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white mt-6"
          onClick={handleAddClientAccess}
         >
          {editingIndex !== null && editingSection === "clientAccess" ? "Update" : "Add"}
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
                 {user.name.charAt(1).toUpperCase()}
                </div>
                <div>
                 <p className="font-medium text-sm">{user.name}</p>
                 <p className="text-xs text-gray-500">{user.email}</p>
                 <p className="text-xs text-gray-500">
                  Role:{" "}
                  {user.roles === "viewer" ? "Campaign Viewer" : "Client Campaign Approver"}
                 </p>
                </div>
               </div>
               <div className="flex items-center gap-2">
                <button
                 onClick={() => handleEditUser("clientAccess", index)}
                 className="text-blue-500 group-hover:opacity-100 transition-opacity"
                >
                 <MdEdit size={18} />
                </button>
                <button
                 onClick={() => handleRemoveUser("clientAccess", user.email)}
                 className="text-red-500 group-hover:opacity-100 transition-opacity"
                >
                 <MdOutlineCancel size={18} />
                </button>
               </div>
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
        <button className="btn_model_active whitespace-nowrap" onClick={handleSubmit}>
         {loading ? <SVGLoader width={"30px"} height={"30px"} color={"#FFF"} /> : "Add Client"}
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