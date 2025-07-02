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
import { addClientUser, addNewClient, checkExisitingEmails, updateClient } from "../functions/clients";
import BusinessUnitEdit from "./BusinessUnitEdit";
import { agencyRoles, cleanName, clientRoles } from "components/Options";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";


const ViewClientModal = ({ isView, setIsView }) => {
 const { data: session, status }: any = useSession();
 const { isAgencyCreator, isAdmin, isAgencyApprover, isFinancialApprover } = useUserPrivileges();
 const { allClients, agencyId, selectedId: clientId, jwt, FC } = useCampaigns();
 const [level1Options, setLevel1Options] = useState([]);
 const [users, setUsers] = useState({ agencyAccess: [], clientAccess: [] });
 const [agencyInput, setAgencyInput] = useState({ id: '', name: '', email: '', roles: [] });
 const [clientInput, setClientInput] = useState({ id: '', name: '', email: '', roles: [] });
 const [editingUser, setEditingUser] = useState(null); // null for add mode, { section, user } for edit mode
 const [showAgencyInput, setShowAgencyInput] = useState(false);
 const [showClientInput, setShowClientInput] = useState(false);
 const [loading, setLoading] = useState(false);
 const [loadingDelete, setLoadingDelete] = useState(false);
 const [loadingUpdate, setLoadingUpdate] = useState(false);
 const [showConfirmPopup, setShowConfirmPopup] = useState(false);
 const [showDeletePopup, setShowDeletePopup] = useState(false);
 const [deletingUserId, setDeletingUserId] = useState(null);
 const [levelUpdateLoading, setLevelUpdateLoading] = useState(false);
 const [isLevelChange, setIsLevelChange] = useState(false);
 const documentId = FC?.documentId;
 const [alert, setAlert] = useState(null);
 const [inputs, setInputs] = useState({
  businessUnits: [],
 });

 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 const onlyLettersRegex = /^[A-Za-z ]+$/;



 useEffect(() => {
  if (FC) {
   setLevel1Options(FC?.level_1);
  }
 }, [FC]);

 useEffect(() => {
  if (alert) {
   const timer = setTimeout(() => setAlert(null), 3000);
   return () => clearTimeout(timer);
  }
 }, [alert]);

 useEffect(() => {
  if (status === 'authenticated') {
   if (!jwt) {
    toast.error('Authentication token is missing. Please log in again.');
   }
   if (!agencyId) {
    console.warn('Agency ID is missing. Fetching all users without filtering.');
   }
  }
 }, [session, status, jwt, agencyId]);

 useEffect(() => {
  if (isView) {
   document.body.classList.add('overflow-hidden');
   if (jwt) {
    fetchUsers();
   } else {
    toast.error('Cannot fetch users: No authentication token available.');
    setLoading(false);
   }
  } else {
   document.body.classList.remove('overflow-hidden');
  }
  return () => document.body.classList.remove('overflow-hidden');
 }, [isView, jwt]);

 const populateParams = ['populate=*'];
 const fetchUsers = async () => {
  const baseUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/users`;
  const filterParams = [];
  if (clientId) {
   filterParams.push(`filters[clients][id][$eq]=${encodeURIComponent(clientId)}`);
  }
  setLoading(true);
  try {
   const response = await fetch(`${baseUrl}?${[...filterParams, ...populateParams].join('&')}`, {
    headers: {
     Authorization: `Bearer ${jwt}`,
    },
   });
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
   }
   const data = await response.json();

   const agencyAccess = data?.filter((user) =>
    ['agency_creator', 'agency_approver', 'financial_approver'].includes(user.user_type)
   );
   const clientAccess = data?.filter((user) =>
    ['client', 'client_approver'].includes(user.user_type)
   );
   setUsers({ agencyAccess, clientAccess });
  } catch (error) {
   toast.error(`Failed to fetch users: ${error.message}`);
  } finally {
   setLoading(false);
  }
 };

 const handleInputChange = (section, field, value) => {
  const setInput = section === 'agencyAccess' ? setAgencyInput : setClientInput;
  setInput((prev) => ({ ...prev, [field]: value }));
 };

 const handleRoleChange = (section, role) => {
  const setInput = section === 'agencyAccess' ? setAgencyInput : setClientInput;
  setInput((prev) => ({
   ...prev,
   roles: [role],
  }));
 };

 const validateInput = (section) => {
  const input = section === 'agencyAccess' ? agencyInput : clientInput;
  const { name, email, roles } = input;
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();
  const hasTwoWords = trimmedName.split(' ').filter(Boolean).length >= 2;

  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
   toast.error('Please enter a valid email address');
   return false;
  }

  if (!trimmedName || !onlyLettersRegex.test(trimmedName) || !hasTwoWords) {
   toast.error('Full name must include first and last name with letters only');
   return false;
  }

  if (roles.length === 0) {
   toast.error('Exactly one role must be selected');
   return false;
  }

  const allUsers = [...users.agencyAccess, ...users.clientAccess];
  if (
   allUsers.some(
    (user) =>
     user.email.toLowerCase() === trimmedEmail.toLowerCase() &&
     user.id !== editingUser?.user?.id
   )
  ) {
   toast.error('This email address is already in use by another user');
   return false;
  }

  return true;
 };

 const handleAddUser = async (section) => {
  if (!validateInput(section)) return;

  const input = section === 'agencyAccess' ? agencyInput : clientInput;
  const { name, email, roles } = input;
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();
  const username = `${trimmedName.replace(' ', '-')}-${uuidv4().slice(0, 4)}`.toLowerCase();
  const tempPassword = '123456789'; // TODO: Replace with secure password
  const userType =
   section === 'agencyAccess'
    ? roles[0] === 'agency_creator'
     ? 'agency_creator'
     : roles[0] === 'agency_approver'
      ? 'agency_approver'
      : 'financial_approver'
    : roles[0] === 'viewer'
     ? 'client'
     : 'client_approver';

  setLoadingUpdate(true);

  try {
   await addClientUser(
    {
     username,
     email: trimmedEmail,
     password: tempPassword,
     clients: clientId ? [clientId] : [],
     user_type: userType,
     agencyId: section === 'agencyAccess' ? agencyId : agencyId,
     emailEntry: { name: trimmedName, email: trimmedEmail, roles: roles[0] },
    },
    jwt
   );

   toast.success('User added successfully');
   await fetchUsers();
   resetInput(section);
  } catch (error) {
   toast.error(`Failed to add user: ${error.message || 'Unknown error'}`);
  } finally {
   setLoadingUpdate(false);
  }
 };

 const handleUpdateUser = (section) => {
  if (!validateInput(section)) return;
  setShowConfirmPopup(true);
 };

 const confirmUpdate = async () => {
  const section = editingUser?.section;
  const input = section === 'agencyAccess' ? agencyInput : clientInput;
  const { name, email, roles } = input;
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();
  const userId = editingUser?.user?.id;

  const relatedUserId =
   section === 'agencyAccess'
    ? editingUser?.user?.agency_user?.documentId
    : editingUser?.user?.client_user?.documentId;

  const relatedUserEndpoint =
   section === 'agencyAccess' ? 'agency-users' : 'client-users';

  setLoadingUpdate(true);

  try {
   await axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${userId}`,
    {
     email: trimmedEmail,
     user_type: [roles[0] === 'viewer' ? 'client' : roles[0]],
    },
    {
     headers: {
      Authorization: `Bearer ${jwt}`,
     },
    }
   );

   if (relatedUserId) {
    await axios.put(
     `${process.env.NEXT_PUBLIC_STRAPI_URL}/${relatedUserEndpoint}/${relatedUserId}`,
     {
      data: {
       full_name: trimmedName,
      },
     },
     {
      headers: {
       Authorization: `Bearer ${jwt}`,
      },
     }
    );
   }

   toast.success('User updated successfully');
   await fetchUsers();
   resetInput(section);
   setShowConfirmPopup(false);
  } catch (error) {
   console.error('Update user error:', error);
   toast.error(`Failed to update user: ${error.message || 'Unknown error'}`);
  } finally {
   setLoadingUpdate(false);
  }
 };

 const handleDeleteUser = (userId) => {
  setDeletingUserId(userId);
  setShowDeletePopup(true);
 };

 const confirmDelete = async () => {
  setLoadingDelete(true);
  try {
   const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${deletingUserId}`,
    {
     method: 'DELETE',
     headers: {
      Authorization: `Bearer ${jwt}`,
     },
    }
   );
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
   }
   toast.success('User deleted successfully');
   await fetchUsers();
   setShowDeletePopup(false);
   setDeletingUserId(null);
  } catch (error) {
   toast.error(`Failed to delete user: ${error.message}`);
  } finally {
   setLoadingDelete(false);
  }
 };

 const handleEditUser = (section, user) => {
  const setInput = section === 'agencyAccess' ? setAgencyInput : setClientInput;
  const setShowInput = section === 'agencyAccess' ? setShowAgencyInput : setShowClientInput;
  const fullName =
   section === 'agencyAccess'
    ? user?.agency_user?.full_name
    : user?.client_user?.full_name;
  setInput({
   id: user.clients?.documentId || '',
   name: fullName || '',
   email: user.email || '',
   roles: [user.user_type === 'client' ? 'viewer' : user.user_type],
  });
  setEditingUser({ section, user });
  setShowInput(true);
 };

 const handleAddUserForm = (section) => {
  const setShowInput = section === 'agencyAccess' ? setShowAgencyInput : setShowClientInput;
  resetInput(section);
  setEditingUser(null);
  setShowInput(true);
 };

 const resetInput = (section) => {
  const setInput = section === 'agencyAccess' ? setAgencyInput : setClientInput;
  const setShowInput = section === 'agencyAccess' ? setShowAgencyInput : setShowClientInput;
  setInput({ id: '', name: '', email: '', roles: [] });
  setEditingUser(null);
  setShowInput(false);
 };

 const handleClose = () => {
  setIsView(false);
  resetInput('agencyAccess');
  resetInput('clientAccess');
  setShowDeletePopup(false);
  setDeletingUserId(null);
 };

 const handleLevelUpdate = async () => {
  setLevelUpdateLoading(true);
  try {
   const levelData = {
    level_1: inputs.businessUnits,
   };

   const res = await updateClient(documentId, levelData, jwt);

   toast.success("Client levels updated successfully!");
   setLevelUpdateLoading(false);
  } catch (error: any) {
   setLevelUpdateLoading(false);
   const message =
    error.response?.data?.error?.message || error.message || "Unknown error";
   toast.error(`Failed to update client: ${message}`);
  }
 };

 return (
  <div className="z-50">
   {isView && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
     <div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">
      <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-[32px]">
       <div className="flex items-center gap-5">
        <div className="madel_profile">
         <Image src={blueprofile} alt="menu" />
        </div>
        <div className="madel_profile_text_container">
         <h3>View Client</h3>
         <p>Manage agency and client access for users.</p>
        </div>
       </div>
       <button className="text-gray-500 hover:text-gray-800" onClick={handleClose}>
        <Image src={closefill} alt="menu" />
       </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[60vh]">
       {loading ? (
        <div className="flex flex-col gap-4">
         <div>
          <Skeleton height={100} width={'50%'} />
          <Skeleton height={50} width={'60%'} />
          <Skeleton height={30} width={'80%'} />
          <Skeleton height={30} width={'100%'} />
          <Skeleton height={30} width={'100%'} />
         </div>
         <div>
          <Skeleton height={100} width={'50%'} />
          <Skeleton height={50} width={'60%'} />
          <Skeleton height={30} width={'80%'} />
         </div>
        </div>
       ) : (
        <div>
         <div className="mt-4">
          <div className="flex justify-between items-center">
           <label className="font-medium text-[15px] leading-5 text-gray-600">
            Agency Access
           </label>
          </div>

          <div className="flex items-start gap-3 w-full mt-2">
           <div className="flex flex-col items-start gap-1 w-full">
            <div className="shrink-0 w-[80%]">
             <Input
              type="text"
              value={agencyInput.name}
              handleOnChange={(e) =>
               handleInputChange('agencyAccess', 'name', e.target.value)
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
               handleInputChange('agencyAccess', 'email', e.target.value)
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
            <div className="mt-1">
             {agencyRoles?.map((role) => (
              <div key={role.value} className="flex items-center gap-2">
               <input
                type="checkbox"
                checked={agencyInput.roles.includes(role.value)}
                onChange={() => handleRoleChange('agencyAccess', role.value)}
               />
               <span className="text-sm">{role.label}</span>
              </div>
             ))}
            </div>
           </div>
           <button
            className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white mt-6"
            onClick={() =>
             editingUser
              ? handleUpdateUser('agencyAccess')
              : handleAddUser('agencyAccess')
            }
            disabled={loading || loadingUpdate}
           >
            {loadingUpdate ? (
             <SVGLoader width={30} height={30} color={'#fff'} />
            ) : editingUser ? (
             'Update'
            ) : (
             'Add'
            )}
           </button>
           <button
            className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-gray-200 rounded-lg font-semibold text-[14px] leading-[19px] text-gray-800 mt-6"
            onClick={() => resetInput('agencyAccess')}
            disabled={loading || loadingUpdate}
           >
            Cancel
           </button>
          </div>

          {users.agencyAccess.length > 0 && (
           <div className="w-full mt-2 mb-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
             <div className="max-h-[150px] overflow-y-auto">
              <ul className="divide-y divide-gray-100">
               {users?.agencyAccess?.map((user) => (
                <li
                 key={user.id}
                 className="flex items-center justify-between p-3 hover:bg-gray-50 group"
                >
                 <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                   {cleanName(
                    user?.agency_user?.full_name?.charAt(0).toUpperCase()
                   )}
                  </div>
                  <div>
                   <p className="font-medium text-sm">
                    {user?.agency_user?.full_name}
                   </p>
                   <p className="text-xs text-gray-500">{user.email}</p>
                   <p className="text-xs text-gray-500">
                    Role:{' '}
                    {agencyRoles?.find((r) => r.value === user.user_type)
                     ?.label || user.user_type}
                   </p>
                  </div>
                 </div>
                 <div className="flex items-center gap-2">
                  <button
                   onClick={() => {
                    if (!isAgencyApprover && !isAdmin && !isFinancialApprover) {
                     toast.error(
                      'You do not have permission to perform this action.'
                     );
                     return;
                    }
                    handleEditUser('agencyAccess', user);
                   }}
                   className="text-blue-500 group-hover:opacity-100 transition-opacity"
                  >
                   <MdEdit size={18} />
                  </button>
                  <button
                   onClick={() => {
                    if (!isAgencyApprover && !isAdmin && !isFinancialApprover) {
                     toast.error(
                      'You do not have permission to perform this action.'
                     );
                     return;
                    }
                    handleDeleteUser(user.id);
                   }}
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

         <div className="mt-4 mb-4">
          <div className="flex justify-between items-center">
           <label className="font-medium text-[15px] leading-5 text-gray-600">
            Client Access
           </label>
          </div>

          <div className="flex items-start gap-3 w-full mt-2">
           <div className="flex flex-col items-start gap-1 w-full">
            <div className="shrink-0 w-[80%]">
             <Input
              type="text"
              value={clientInput.name}
              handleOnChange={(e) =>
               handleInputChange('clientAccess', 'name', e.target.value)
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
               handleInputChange('clientAccess', 'email', e.target.value)
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
            <div className="mt-1">
             {clientRoles?.map((role) => (
              <div key={role.value} className="flex items-center gap-2">
               <input
                type="checkbox"
                checked={clientInput?.roles?.includes(role.value)}
                onChange={() => handleRoleChange('clientAccess', role.value)}
               />
               <span className="text-sm">{role?.label}</span>
              </div>
             ))}
            </div>
           </div>
           <button
            className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white mt-6"
            onClick={() =>
             editingUser
              ? handleUpdateUser('clientAccess')
              : handleAddUser('clientAccess')
            }
            disabled={loading || loadingUpdate}
           >
            {loadingUpdate ? (
             <SVGLoader width={30} height={30} color={'#fff'} />
            ) : editingUser ? (
             'Update'
            ) : (
             'Add'
            )}
           </button>
           <button
            className="flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-gray-200 rounded-lg font-semibold text-[14px] leading-[19px] text-gray-800 mt-6"
            onClick={() => resetInput('clientAccess')}
            disabled={loading || loadingUpdate}
           >
            Cancel
           </button>
          </div>

          {users?.clientAccess?.length > 0 && (
           <div className="w-full mt-2 mb-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
             <div className="max-h-[150px] overflow-y-auto">
              <ul className="divide-y divide-gray-100">
               {users?.clientAccess?.map((user) => (
                <li
                 key={user?.id}
                 className="flex items-center justify-between p-3 hover:bg-gray-50 group"
                >
                 <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                   {cleanName(
                    user?.client_user?.full_name?.charAt(0).toUpperCase()
                   )}
                  </div>
                  <div>
                   <p className="font-medium text-sm">
                    {user?.client_user?.full_name}
                   </p>
                   <p className="text-xs text-gray-500">{user.email}</p>
                   <p className="text-xs text-gray-500">
                    Role:{' '}
                    {user.user_type === 'client'
                     ? 'Campaign Viewer'
                     : user.user_type === 'client_approver'
                      ? 'Client Campaign Approver'
                      : user.user_type}
                   </p>
                  </div>
                 </div>
                 <div className="flex items-center gap-2">
                  <button
                   onClick={() => {
                    if (!isAgencyApprover && !isAdmin && !isFinancialApprover) {
                     toast.error(
                      'You do not have permission to perform this action.'
                     );
                     return;
                    }
                    handleEditUser('clientAccess', user);
                   }}
                   className="text-blue-500 group-hover:opacity-100 transition-opacity"
                  >
                   <MdEdit size={18} />
                  </button>
                  <button
                   onClick={() => {
                    if (!isAgencyApprover && !isAdmin && !isFinancialApprover) {
                     toast.error(
                      'You do not have permission to perform this action.'
                     );
                     return;
                    }
                    handleDeleteUser(user.id);
                   }}
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
          <BusinessUnitEdit
           setInputs={setInputs}
           setAlert={setAlert}
           level1Options={level1Options}
           initialData={level1Options}
           isAgencyCreator={isAgencyCreator}
           setIsLevelChange={setIsLevelChange}
          />
         </div>
         {users.agencyAccess.length === 0 &&
          users.clientAccess.length === 0 &&
          !loading && (
           <p className="text-gray-500 text-sm mt-4">No users found.</p>
          )}
         {loading && <p className="text-gray-500 text-sm mt-4">Loading users...</p>}
        </div>
       )}
      </div>
      <div className="p-6 gap-6 border-t bg-white sticky bottom-0 z-10 flex justify-end rounded-b-[32px]">
       <button onClick={handleClose} className="btn_model_outline">
        Close
       </button>
       <button
        className="btn_model_active px-4 py-2 whitespace-nowrap text-white rounded-lg text-sm"
        onClick={handleLevelUpdate}
        disabled={levelUpdateLoading}
       >
        {levelUpdateLoading ? (
         <SVGLoader width={30} height={30} color={'#fff'} />
        ) : (
         'Update Level'
        )}
       </button>
      </div>
     </div>
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
          disabled={loading || loadingUpdate}
         >
          Cancel
         </button>
         <button
          className="px-4 py-2 bg-[#061237] text-white rounded-lg text-sm"
          onClick={confirmUpdate}
          disabled={loading || loadingUpdate}
         >
          {loadingUpdate ? (
           <SVGLoader width={30} height={30} color={'#fff'} />
          ) : (
           'Continue'
          )}
         </button>
        </div>
       </div>
      </div>
     )}

     {showDeletePopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
       <div className="bg-white rounded-lg p-6 w-[400px]">
        <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
        <p className="text-sm text-gray-600 mt-2">
         Are you sure you want to delete this user? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-4">
         <button
          className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
          onClick={() => {
           setShowDeletePopup(false);
           setDeletingUserId(null);
          }}
          disabled={loading || loadingDelete}
         >
          Cancel
         </button>
         <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          onClick={confirmDelete}
          disabled={loading || loadingDelete}
         >
          {loadingDelete ? (
           <SVGLoader width={30} height={30} color={'#fff'} />
          ) : (
           'Delete'
          )}
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

