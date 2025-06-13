"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../../public/close-fill.svg";
import blueprofile from "../../../public/blueprofile.svg";
import { MdEdit, MdOutlineCancel } from "react-icons/md";
import { toast } from "sonner";
import { useUserPrivileges } from "utils/userPrivileges";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "store/useStore";
import { useCampaigns } from "app/utils/CampaignsContext";
import { SVGLoader } from "components/SVGLoader";
import Input from "components/Input";
import { addNewClient, checkExisitingEmails } from "../functions/clients";


const ViewClientModal = ({ isView, setIsView }) => {
 const { data: session, status }: any = useSession();
 const jwt = (session?.user as { data?: { jwt: string } })?.data?.jwt;
 const agencyId = session?.user?.data?.agency?.id; // Adjust based on your session structure

 const [users, setUsers] = useState([]);
 const [input, setInput] = useState({ name: "", email: "", role: "" });
 const [editingUser, setEditingUser] = useState(null);
 const [showInput, setShowInput] = useState(false);
 const [loading, setLoading] = useState(false);
 const [showConfirmPopup, setShowConfirmPopup] = useState(false);
 const [showDeletePopup, setShowDeletePopup] = useState(false); // Control delete confirmation modal
 const [deletingUserId, setDeletingUserId] = useState(null); // Track user ID for deletion

 // Email and name validation regex
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 const onlyLettersRegex = /^[A-Za-z ]+$/;

 // Log session for debugging
 useEffect(() => {
  if (status === "authenticated") {
   console.log("Session:", session);
   console.log("JWT:", jwt);
   console.log("Agency ID:", agencyId);
   if (!jwt) {
    toast.error("Authentication token is missing. Please log in again.");
   }
   if (!agencyId) {
    console.warn("Agency ID is missing. Fetching all users without filtering.");
   }
  }
 }, [session, status, jwt, agencyId]);

 // Prevent background scrolling when modal is open
 useEffect(() => {
  if (isView) {
   document.body.classList.add("overflow-hidden");
   if (jwt) {
    fetchUsers();
   } else {
    toast.error("Cannot fetch users: No authentication token available.");
    setLoading(false);
   }
  } else {
   document.body.classList.remove("overflow-hidden");
  }
  return () => document.body.classList.remove("overflow-hidden");
 }, [isView, jwt]);

 // Fetch all users from Strapi
 const fetchUsers = async () => {
  setLoading(true);
  try {
   const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/users?populate=*`,
    {
     headers: {
      Authorization: `Bearer ${jwt}`,
     },
    }
   );
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
   }
   const data = await response.json();
   const filteredUsers = agencyId
    ? data.filter((user) => user.agency?.id === agencyId)
    : data;
   setUsers(filteredUsers);
  } catch (error) {
   console.error("Fetch users error:", error);
   toast.error(`Failed to fetch users: ${error.message || "Unauthorized"}`);
  } finally {
   setLoading(false);
  }
 };

 // Handle input changes
 const handleInputChange = (field, value) => {
  setInput((prev) => ({ ...prev, [field]: value }));
 };

 // Validate input before update
 const validateInput = () => {
  const { name, email, role } = input;
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();
  const hasTwoWords = trimmedName.split(" ").filter(Boolean).length >= 2;

  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
   toast.error("Please enter a valid email address");
   return false;
  }

  if (!trimmedName || !onlyLettersRegex.test(trimmedName) || !hasTwoWords) {
   toast.error("Full name must include first and last name with letters only");
   return false;
  }

  if (!role) {
   toast.error("A role must be selected");
   return false;
  }

  if (
   users.some(
    (user) =>
     user.email.toLowerCase() === trimmedEmail.toLowerCase() &&
     user.id !== editingUser?.id
   )
  ) {
   toast.error("This email address is already in use by another user");
   return false;
  }

  return true;
 };

 // Handle update user
 const handleUpdateUser = () => {
  if (!validateInput()) return;
  setShowConfirmPopup(true);
 };

 // Confirm update user
 const confirmUpdate = async () => {
  const { name, email, role } = input;
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();
  setLoading(true);

  try {
   const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${editingUser.id}`,
    {
     method: "PUT",
     headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
     },
     body: JSON.stringify({
      username: trimmedName,
      email: trimmedEmail,
      user_type: role,
     }),
    }
   );
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
   }
   toast.success("User updated successfully");

   await fetchUsers();
   resetInput();
   setShowConfirmPopup(false);
  } catch (error) {
   console.error("Update user error:", error);
   toast.error(`Failed to update user: ${error.message || "Unauthorized"}`);
  } finally {
   setLoading(false);
  }
 };

 // Handle delete user
 const handleDeleteUser = (userId) => {
  setDeletingUserId(userId);
  setShowDeletePopup(true);
 };

 // Confirm delete user
 const confirmDelete = async () => {
  setLoading(true);
  try {
   const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${deletingUserId}`,
    {
     method: "DELETE",
     headers: {
      Authorization: `Bearer ${jwt}`,
     },
    }
   );
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
   }
   toast.success("User deleted successfully");
   await fetchUsers();
   setShowDeletePopup(false);
   setDeletingUserId(null);
  } catch (error) {
   console.error("Delete user error:", error);
   toast.error(`Failed to delete user: ${error.message || "Unauthorized"}`);
  } finally {
   setLoading(false);
  }
 };

 // Handle edit button click
 const handleEditUser = (user) => {
  setInput({ name: user.username, email: user.email, role: user.user_type });
  setEditingUser(user);
  setShowInput(true);
 };

 // Reset input and hide form
 const resetInput = () => {
  setInput({ name: "", email: "", role: "" });
  setEditingUser(null);
  setShowInput(false);
 };

 // Close modal and reset state
 const handleClose = () => {
  setIsView(false);
  resetInput();
  setShowDeletePopup(false);
  setDeletingUserId(null);
 };

 // Role options for dropdown
 const roleOptions = [
  { label: "Campaign Creator", value: "agency_creator" },
  { label: "Agency Campaign Approver", value: "agency_approver" },
  { label: "Financial Approver", value: "financial_approver" },
  { label: "Viewer", value: "client" },
  { label: "Client Campaign Approver", value: "client_approver" },
 ];

 return (
  <div className="z-50">
   {isView && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
     <div className="flex flex-col w-[700px] md:w-[800px] bg-white rounded-[32px] max-h-[90vh]">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-[32px]">
       <div className="flex items-center gap-5">
        <div className="madel_profile">
         <Image src={blueprofile || "/placeholder.svg"} alt="menu" />
        </div>
        <div className="madel_profile_text_container">
         <h3>View Users</h3>
        </div>
       </div>
       <button
        className="text-gray-500 hover:text-gray-800"
        onClick={handleClose}
       >
        <Image src={closefill || "/placeholder.svg"} alt="menu" />
       </button>
      </div>

      {/* Scrollable Body */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
       {/* User Input Form (shown only when editing) */}
       {showInput && (
        <div className="mt-4">
         <label className="font-medium text-[15px] leading-5 text-gray-600">
          Edit User
         </label>
         <div className="flex items-start gap-3 w-full mt-2">
          <div className="flex flex-col items-start gap-1 w-full">
           <div className="shrink-0 w-[80%]">
            <Input
             type="text"
             value={input.name}
             handleOnChange={(e) =>
              handleInputChange("name", e.target.value)
             }
             label=""
             placeholder="Full Name"
            />
           </div>
           <div className="shrink-0 w-[100%]">
            <Input
             type="email"
             value={input.email}
             handleOnChange={(e) =>
              handleInputChange("email", e.target.value)
             }
             label=""
             placeholder="Enter email address"
            />
           </div>
          </div>
          <div className="shrink-0 w-[25%]">
           <label className="font-medium text-[15px] leading-5 text-gray-600">
            Role
           </label>
           <select
            value={input.role}
            onChange={(e) => handleInputChange("role", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
           >
            <option value="">Select a role</option>
            {roleOptions.map((role) => (
             <option key={role.value} value={role.value}>
              {role.label}
             </option>
            ))}
           </select>
          </div>
          <button
           className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white mt-6"
           onClick={handleUpdateUser}
           disabled={loading}
          >
           Update
          </button>
          <button
           className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-gray-200 rounded-lg font-semibold text-[14px] leading-[19px] text-gray-800 mt-6"
           onClick={resetInput}
           disabled={loading}
          >
           Cancel
          </button>
         </div>
        </div>
       )}

       {/* User List */}
       {users.length > 0 && (
        <div className="w-full mt-4">
         <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="h-full overflow-y-auto">
           <ul className="divide-y divide-gray-100">
            {users.map((user) => (
             <li
              key={user.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 group"
             >
              <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {user.username.charAt(0).toUpperCase()}
               </div>
               <div>
                <p className="font-medium text-sm">
                 {user.username}
                </p>
                <p className="text-xs text-gray-500">
                 {user.email}
                </p>
                <p className="text-xs text-gray-500">
                 Role:{" "}
                 {roleOptions.find(
                  (r) => r.value === user.user_type
                 )?.label || user.user_type}
                </p>
               </div>
              </div>
              <div className="flex items-center gap-2">
               <button
                onClick={() => handleEditUser(user)}
                className="text-blue-500 group-hover:opacity-100 transition-opacity"
               >
                <MdEdit size={18} />
               </button>
               <button
                onClick={() => handleDeleteUser(user.id)}
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
       {users.length === 0 && !loading && (
        <p className="text-gray-500 text-sm mt-4">No users found.</p>
       )}
       {loading && (
        <p className="text-gray-500 text-sm mt-4">Loading users...</p>
       )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end rounded-b-[32px]">
       <button onClick={handleClose} className="btn_model_outline">
        Close
       </button>
      </div>
     </div>

     {/* Update Confirmation Popup */}
     {showConfirmPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
       <div className="bg-white rounded-lg p-6 w-[400px]">
        <h3 className="text-lg font-semibold">Confirm Update</h3>
        <p className="text-sm text-gray-600 mt-2">
         Are you sure you want to update this user?
        </p>
        <div className="flex justify-end gap-3 mt-4">
         <button
          className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
          onClick={() => setShowConfirmPopup(false)}
          disabled={loading}
         >
          Cancel
         </button>
         <button
          className="px-4 py-2 bg-[#061237] text-white rounded-lg text-sm"
          onClick={confirmUpdate}
          disabled={loading}
         >
          Continue
         </button>
        </div>
       </div>
      </div>
     )}

     {/* Delete Confirmation Popup */}
     {showDeletePopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
       <div className="bg-white rounded-lg p-6 w-[400px]">
        <h3 className="text-lg font-semibold text-red-600">
         Confirm Delete
        </h3>
        <p className="text-sm text-gray-600 mt-2">
         Are you sure you want to delete this user? This action cannot be
         undone.
        </p>
        <div className="flex justify-end gap-3 mt-4">
         <button
          className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
          onClick={() => {
           setShowDeletePopup(false);
           setDeletingUserId(null);
          }}
          disabled={loading}
         >
          Cancel
         </button>
         <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          onClick={confirmDelete}
          disabled={loading}
         >
          Delete
         </button>
        </div>
       </div>
      </div>
     )}
    </div>
   )}
  </div>
 );
};

export default ViewClientModal;