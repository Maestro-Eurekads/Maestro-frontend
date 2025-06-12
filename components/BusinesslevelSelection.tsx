"use client";
import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { BiLoader } from "react-icons/bi";
import { useAppDispatch } from "../store/useStore";
import { getCreateClient } from "../features/Client/clientSlice";
import { useSession } from "next-auth/react";
import { useUserPrivileges } from "utils/userPrivileges";

// const Dropdown = ({
//   label,
//   options,
//   formId,

// }: {
//   label: string;
//   options: { id?: string; value: string; label: string }[];
//   formId: string;
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const { campaignFormData, setCampaignFormData, loadingClients, allClients, setClientUsers } = useCampaigns();
//   const { client_selection } = campaignFormData || {};
//   const { data: session } = useSession()
//   const dispatch = useAppDispatch();
//   const { isAdmin, isAgencyApprover, isFinancialApprover } =
//     useUserPrivileges();

//   const selectedClient = allClients?.find(client => client?.documentId === client_selection?.id);

//   console.log("selectedClient---pppp:", selectedClient);

//   // Fetch clients when dropdown is opened
//   const toggleDropdown = () => {
//     if (!isOpen && label === "Select Client") {
//       //@ts-ignore
//       dispatch(getCreateClient(!isAdmin ? session?.user?.data?.user?.id : null));
//     }
//     setIsOpen(!isOpen);
//   };



//   const handleSelect = (id, value: string) => {
//     if (formId === "client_selection") {
//       const selectedClient = allClients?.find(client => client?.documentId === id);
//       if (selectedClient) {
//         setClientUsers(selectedClient.users || []);
//       }
//     }
//     setCampaignFormData((prev) => ({

//       ...prev,
//       [formId]: {
//         id,
//         value,
//       },
//     }));
//     setIsOpen(false);
//     setSearchTerm("");
//   };

//   const handleClickOutside = (event: MouseEvent) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//       setIsOpen(false);
//       setSearchTerm("");
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const filteredOptions = options?.filter(option =>
//     option?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase())
//   );

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Dropdown Button */}
//       <div
//         className="dropdown_button_width flex items-center px-4 py-2 h-[45px] bg-white max-w-xs border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
//         onClick={toggleDropdown}
//       >
//         <span className="text-[#061237]">
//           {campaignFormData[formId]?.value || label}
//         </span>
//         <span className="ml-auto text-[#061237]">
//           <Image src={down} alt="dropdown-icon" />
//         </span>
//       </div>

//       {/* Dropdown List */}
//       {loadingClients && label === "Select Client" && (
//         <div className="flex items-center gap-2">
//           <BiLoader className="animate-spin" />
//           <p>Loading clients...</p>
//         </div>
//       )}
//       {isOpen &&
//         campaignFormData["client_selection"]?.value
//         && (
//           <div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-1 z-10 max-h-[300px] overflow-y-auto">
//             {/* Search Input */}
//             <div className="sticky top-0 bg-white p-2 border-b">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 onClick={(e) => e.stopPropagation()}
//               />
//             </div>

//             {filteredOptions?.map((option) => (
//               <div
//                 key={option?.value}
//                 className="px-4 py-2 cursor-pointer hover:bg-gray-100"
//                 onClick={() =>
//                   handleSelect(option?.id || option?.value, option?.value)
//                 }
//               >
//                 {option?.label}
//               </div>
//             ))}

//             {filteredOptions?.length === 0 && (
//               <div className="px-4 py-2 text-gray-500">
//                 No results found
//               </div>
//             )}
//           </div>
//         )}
//     </div>
//   );
// };

// const BusinesslevelSelection = ({
//   options,
//   label,
//   formId,

// }: {
//   options: { value: string; label: string }[];
//   label: string;
//   formId: string;
// }) => {
//   return (
//     <div className="flex items-center gap-4 mt-[20px]">
//       <Dropdown label={label} options={options} formId={formId} />
//     </div>
//   );
// };

// export default BusinesslevelSelection;


interface Option {
  id: string;
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: Option[];
  formId: string;
}

interface BusinessLevelSelectionProps {
  label?: string; // Optional, unused
  formId?: string; // Optional, unused
}

interface CampaignFormData {
  client_selection?: { id: string; value: string };
  level_2?: Array<{ id: string; value: string } | null>;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, formId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { campaignFormData, setCampaignFormData, loadingClients, allClients, setClientUsers } =
    useCampaigns();
  const { data: session }: any = useSession();
  const dispatch = useAppDispatch();
  const { isAdmin } = useUserPrivileges();

  const toggleDropdown = () => {
    if (!isOpen && label === "Select Client") {
      dispatch(getCreateClient(!isAdmin ? session?.user?.data?.user?.id : null));
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (id: string, value: string) => {
    if (!setCampaignFormData) {
      console.error("setCampaignFormData is undefined");
      return;
    }

    if (formId === "client_selection") {
      const selectedClient = allClients?.find((client) => client?.documentId === id);
      if (selectedClient) {
        setClientUsers(selectedClient.users || []);
      }
      setCampaignFormData((prev: CampaignFormData) => ({
        ...prev,
        [formId]: { id, value },
      }));
    } else {
      const index = parseInt(formId.split("_")[2], 10);
      setCampaignFormData((prev: CampaignFormData) => {
        if (isNaN(index)) {
          console.error("Invalid index parsed from formId:", formId);
          return prev;
        }
        const currentLevel2 = Array.isArray(prev.level_2) ? prev.level_2 : [];
        const newLevel2 = [...currentLevel2];
        newLevel2[index] = { id, value };
        return {
          ...prev,
          level_2: newLevel2,
        };
      });
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options?.filter((option) =>
    option?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <div
        className="dropdown_button_width flex items-center px-4 py-2 h-[45px] bg-white max-w-xs border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
        onClick={toggleDropdown}
      >
        <span className="text-[#061237] font-medium truncate flex-1">
          {formId === "client_selection"
            ? campaignFormData[formId]?.value || label
            : campaignFormData.level_2?.[parseInt(formId.split("_")[2], 10)]?.value || label}
        </span>
        <span className="ml-auto text-[#061237]">
          <Image src={down} alt="dropdown-icon" />
        </span>
      </div>


      {isOpen && (
        <div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-1 z-10 max-h-[300px] overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {filteredOptions?.map((option) => (
            <div
              key={option?.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(option?.id, option?.value)}
            >
              {option?.label}
            </div>
          ))}

          {filteredOptions?.length === 0 && (
            <div className="px-4 py-2 text-gray-500">
              No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

const BusinessLevelSelection: React.FC<BusinessLevelSelectionProps> = () => {
  const { campaignFormData, setCampaignFormData, allClients } = useCampaigns();
  const { client_selection } = campaignFormData || {};

  const selectedClient = allClients?.find(
    (client) => client?.documentId === client_selection?.id
  );

  const generateLevelOptions = (levelArrayOptions: string[]): Option[] => {
    if (!levelArrayOptions || levelArrayOptions.length === 0) return [];

    return levelArrayOptions.map((value, index) => ({
      id: `${value}`, // Ensure unique IDs
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
    }));
  };

  const level2Dropdowns = (selectedClient?.level_2 || []).map((levelArray: string[], index: number) => {
    if (!levelArray || levelArray.length < 2) {
      return null;
    }
    const labelFirst = levelArray[0];
    const options = levelArray.slice(1);
    return {
      id: `level_2_${index}`,
      label: labelFirst.charAt(0).toUpperCase() + labelFirst.slice(1),
      options: generateLevelOptions(options),
    };
  }).filter((dropdown): dropdown is { id: string; label: string; options: Option[] } => dropdown !== null);

  useEffect(() => {
    if (!setCampaignFormData) {
      return;
    }
    if (selectedClient && campaignFormData?.level_2?.length !== selectedClient?.level_2?.length) {
      setCampaignFormData((prev: CampaignFormData) => ({
        ...prev,
        level_2: Array(selectedClient?.level_2?.length).fill(null),
      }));
    }
  }, [selectedClient, campaignFormData, setCampaignFormData]);

  return (
    <div className="mt-[20px]">
      {!client_selection?.value ? (
        <p className="text-gray-500 text-sm">Please select a client to view business levels.</p>
      ) : level2Dropdowns?.length === 0 ? (
        <p className="text-gray-500 text-sm">No Level  options available for this client.</p>
      ) : (
        <div className="flex items-center gap-4 mt-[40px] flex-wrap">
          {level2Dropdowns?.map((dropdown) => (
            <div key={dropdown?.id}  >
              <Dropdown
                label={dropdown?.label}
                options={dropdown?.options}
                formId={dropdown?.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessLevelSelection;


