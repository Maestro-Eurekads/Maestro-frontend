"use client";
import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { BiLoader } from "react-icons/bi";
import { useAppDispatch } from "../store/useStore";
import { getCreateClient } from "../features/Client/clientSlice";
import { reset } from "features/Comment/commentSlice";
import { useSession } from "next-auth/react";
import { useUserPrivileges } from "utils/userPrivileges";
import { useActive } from "app/utils/ActiveContext";

const Dropdown = ({
  label,
  options,
  formId,

}: {
  label: string;
  options: { id?: string; value: string; label: string }[];
  formId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { campaignFormData, setCampaignFormData, loadingClients, allClients, setClientUsers, jwt, getActiveCampaign } = useCampaigns();
  const { data: session } = useSession()
  const dispatch = useAppDispatch();
  const { setChange } = useActive()
  const { isAdmin, isAgencyApprover, isFinancialApprover } =
    useUserPrivileges();

  // Fetch clients when dropdown is opened
  const toggleDropdown = () => {
    if (!isOpen && label === "Select Client") {
      //@ts-ignore
      dispatch(getCreateClient({ userId: !isAdmin ? session?.user?.data?.user?.id : null, jwt }));
    }
    setIsOpen(!isOpen);
  };



  const handleSelect = (id, value: string) => {
    setChange(true)

    // Reset Redux state when selecting a new client
    if (formId === "client_selection") {
      dispatch(reset());

      const selectedClient = allClients?.find(client => client.documentId === id);

      if (selectedClient) {
        setClientUsers(selectedClient.users || []);
      }

      // Fetch client data to get custom funnel configurations
      // This will trigger getActiveCampaign with no campaignId to fetch client data
      setTimeout(() => {
        getActiveCampaign();
      }, 100);
    }

    setCampaignFormData((prev) => ({
      ...prev,
      [formId]: {
        id,
        value,
      },
    }));
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

  const filteredOptions = options?.filter(option =>
    option?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <div
        className="dropdown_button_width flex items-center px-4 py-2 h-[45px] bg-white max-w-xs border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
        onClick={toggleDropdown}
      >
        <span className="text-[#061237]">
          {/* Show the label for the selected value, not the id. If nothing is selected, show the label as placeholder. */}
          {
            (() => {
              const selected = options?.find(
                (opt) =>
                  opt.value === campaignFormData[formId]?.value ||
                  opt.id === campaignFormData[formId]?.id
              );
              // If nothing is selected, show the label (placeholder)
              if (!campaignFormData[formId] || (!campaignFormData[formId]?.value && !campaignFormData[formId]?.id)) {
                return label;
              }
              return selected ? selected.label : label;
            })()
          }
        </span>
        <span className="ml-auto text-[#061237]">
          <Image src={down} alt="dropdown-icon" />
        </span>
      </div>

      {/* Dropdown List */}
      {loadingClients && label === "Select Client" && (
        <div className="flex items-center gap-2">
          <BiLoader className="animate-spin" />
          <p>Loading clients...</p>
        </div>
      )}
      {isOpen &&
        ((label === "Client Architecture")
          ? campaignFormData["client_selection"]?.value
          : true) && (
          <div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-1 z-10 max-h-[300px] overflow-y-auto">
            {/* Search Input */}
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
                key={option?.value}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  handleSelect(option?.id || option?.value, option?.value)
                }
              >
                {option?.label}
              </div>
            ))}

            {filteredOptions?.length === 0 && (
              <div className="px-4 py-2 text-gray-500">
                No results found
              </div>
            )}
          </div>
        )}
    </div>
  );
};

const ClientSelection = ({
  options,
  label,
  formId,

}: {
  options: { value: string; label: string }[];
  label: string;
  formId: string;
}) => {
  return (
    <div className="flex items-center gap-4 mt-[5px]">
      <Dropdown label={label} options={options} formId={formId} />
    </div>
  );
};

export default ClientSelection;