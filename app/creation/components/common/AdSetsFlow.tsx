"use client";

import Image, { StaticImageData } from "next/image";
import facebookIcon from "../../../../public/facebook.svg";
import instagramIcon from "../../../../public/ig.svg";
import youtubeIcon from "../../../../public/youtube.svg";
import theTradeDeskIcon from "../../../../public/TheTradeDesk.svg";
import quantcastIcon from "../../../../public/quantcast.svg";
import { FaAngleRight } from "react-icons/fa";
import { MdDelete, MdAdd } from "react-icons/md";
import { useState } from "react";

// AudienceDropdown component with animated dropdown
function AudienceDropdown({ onChange, selectedAudience }: { onChange: (selected: string) => void, selectedAudience: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(selectedAudience);

  const options = [
    "Lookalike audience",
    "Retargeting audience",
    "Broad audience",
    "Behavioral audience",
  ];

  const handleSelect = (option: string) => {
    setSelected(option);
    setOpen(false);
    onChange(option); // Notify parent component of change with selected value
  };

  return (
    <div className="relative border-2 border-[#0000001A] rounded-[10px]">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative z-20 w-[200px] bg-white text-left border-2 border-[#0000001A] rounded-lg text-[#656565] text-sm flex items-center justify-between py-4 px-4"
      >
        <span className="truncate">{selected || "Your audience type"}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <ul className="absolute w-full mt-1 z-10 bg-white border-2 border-[#0000001A] rounded-lg shadow-lg overflow-auto">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleSelect(option)}
              className="p-4 cursor-pointer text-[#656565] text-base text-cener whitespace-nowrap hover:bg-gray-100"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdsetSettings({
  outlet,
  onChange,
  adsets,
  setAdSets,
}: {
  outlet: { id: number; outlet: string; icon: StaticImageData };
  onChange: (selected: string) => void; // Prop to notify parent of changes with selected value
  adsets: { id: number; addsetNumber: number; audienceType: string; adSetName: string; size: string }[];
  setAdSets: React.Dispatch<React.SetStateAction<{ id: number; addsetNumber: number; audienceType: string; adSetName: string; size: string }[]>>;
}) {
  const isFacebook = outlet.outlet === "Facebook";

  if (!isFacebook) {
    return (
      <div className="flex items-center gap-4"> {/* Adjusted gap from 8 to 4 */}
        <div className="relative border border-[#0000001A] rounded-[10px]">
          <button className="relative w-[150px] z-20 flex gap-4 justify-between items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
            <Image src={outlet.icon} alt="" className="w-[22px] h-[22px]" />
            <span className="text-[#061237] font-medium whitespace-nowrap">{outlet.outlet}</span>
            <FaAngleRight />
          </button>
        </div>
      </div>
    );
  }

  const adsetAmount = adsets.length;

  function addNewAddset() {
    const newAdSet = {
      id: Date.now(),
      addsetNumber: adsetAmount + 1,
      audienceType: "", // Initialize with empty audience type
      adSetName: "", // Initialize with empty ad set name
      size: "", // Initialize with empty size
    };
    setAdSets((prev) => [...prev, newAdSet]);
    onChange(""); // Notify parent component of change
  }

  function deleteAdSet(id: number) {
    setAdSets((prev) => prev.filter((adset) => adset.id !== id));
    onChange(""); // Notify parent component of change
  }

  const handleAudienceChange = (index: number, selected: string) => {
    const updatedAdSets = [...adsets];
    updatedAdSets[index].audienceType = selected; // Update the selected audience type
    setAdSets(updatedAdSets);
    onChange(selected); // Notify parent component of change
  };

  const handleAdSetNameChange = (index: number, value: string) => {
    const updatedAdSets = [...adsets];
    updatedAdSets[index].adSetName = value; // Update the ad set name
    setAdSets(updatedAdSets);
  };

  const handleSizeChange = (index: number, value: string) => {
    const updatedAdSets = [...adsets];
    updatedAdSets[index].size = value; // Update the size
    setAdSets(updatedAdSets);
  };

  return (
    <div className="flex items-center gap-8 w-full max-w-[1024px]">
      <div className="relative ">
        <button className="relative w-[150px] z-20 flex gap-4 justify-between items-center bg-[#F9FAFB] border border-[#0000001A] border-solid py-4 px-4 rounded-[10px]">
          <Image src={outlet.icon} alt="" className="w-[22px] h-[22px]" />
          <span className="text-[#061237] font-medium">{outlet.outlet}</span>
          <FaAngleRight />
        </button>
        <hr className="border border-[#0000001A] w-[100px] absolute bottom-1/2 translate-y-1/2 -right-0 translate-x-3/4" />
      </div>
      <div className="relative w-full min-h-[194px]">
        <div
          className={`absolute ${
            adsetAmount === 1
              ? "top-0"
              : adsetAmount === 2
              ? "bottom-0"
              : "hidden"
          }`}
        >
          <span
            className={`border-l-2 border-[#0000001A] h-[78px] w-8 absolute -left-4 ${
              adsetAmount === 1
                ? "top-1/2 rounded-tl-[10px] border-t-2"
                : adsetAmount === 2
                ? "bottom-1/2 rounded-bl-[10px] border-b-2"
                : ""
            }`}
          ></span>
          <button
            onClick={addNewAddset}
            className="flex gap-2 items-center text-white bg-[#3175FF] px-4 py-2 rounded-full text-sm font-bold z-20 relative"
          >
            <MdAdd />
            <span>New add set</span>
          </button>
        </div>
        {adsets.map((adset, index) => (
          <div
            key={adset.id}
            className={`absolute ${
              index === 0
                ? "top-1/2 -translate-y-1/2"
                : index === 1
                ? "top-0"
                : "bottom-0"
            }`}
          >
            <span
              className={`border-l-2 border-[#0000001A] h-[70px] w-8 absolute -left-4 ${
                index === 0
                  ? "hidden"
                  : index === 1
                  ? "top-1/2 rounded-tl-[10px] border-t-2"
                  : "bottom-1/2 rounded-bl-[10px] border-b-2"
              }`}
            ></span>
            <div className="flex gap-2 items-center w-full px-4">
              <div className="relative">
                <p className="relative z-50 text-[#3175FF] text-sm whitespace-nowrap font-bold flex gap-4 items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
                  {`Ad set n°${adset.addsetNumber}`}
                </p>
                <hr className="border border-[#0000001A] w-[50px] absolute bottom-1/2 translate-y-1/2 -right-0 translate-x-3/4" />
              </div>
              <AudienceDropdown onChange={(selected) => handleAudienceChange(index, selected)} selectedAudience={adset.audienceType} />
              <input
                type="text"
                placeholder="Enter ad set name"
                value={adset.adSetName} // Set value to the ad set name
                onChange={(e) => handleAdSetNameChange(index, e.target.value)} // Update ad set name
                className="text-black text-sm font-semibold flex gap-4 items-center border border-gray-300 py-3 px-3 rounded-lg h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Enter size"
                value={adset.size} // Set value to the size
                onChange={(e) => handleSizeChange(index, e.target.value)} // Update size
                className="text-black text-sm font-semibold flex gap-4 items-center border border-[#D0D5DD] py-4 px-2 rounded-[10px] h-[52px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => deleteAdSet(adset.id)}
                className="flex items-center gap-2 rounded-full px-4 py-2 bg-[#FF5955] text-white text-sm font-bold"
              >
                <MdDelete /> <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdSetFlow() {
  const outlets = [
    {
      id: Date.now(),
      outlet: "Facebook",
      icon: facebookIcon,
    },
    {
      id: Date.now() + 1, // Ensure unique IDs
      outlet: "Instagram",
      icon: instagramIcon,
    },
    {
      id: Date.now() + 2, // Ensure unique IDs
      outlet: "Youtube",
      icon: youtubeIcon,
    },
    {
      id: Date.now() + 3, // Ensure unique IDs
      outlet: "TheTradeDesk",
      icon: theTradeDeskIcon,
    },
    {
      id: Date.now() + 4, // Ensure unique IDs
      outlet: "Quantcast",
      icon: quantcastIcon,
    },
  ];

  const [isValidateEnabled, setIsValidateEnabled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [adsets, setAdSets] = useState<{ id: number; addsetNumber: number; audienceType: string; adSetName: string; size: string }[]>([
    {
      id: Date.now(),
      addsetNumber: 1,
      audienceType: "", // Store selected audience type
      adSetName: "", // Store ad set name
      size: "", // Store size
    },
  ]);

  const handleChange = () => {
    setIsValidateEnabled(adsets.some(adset => adset.audienceType !== "")); // Enable the validate button if any audience type is selected
  };

  const handleValidate = () => {
    setSelectedData(adsets); // Store the current adsets data
    setIsEditing(true); // Switch to editing mode
    setIsValidateEnabled(false); // Disable validate button after validation
  };

  const handleEdit = () => {
    setIsEditing(false); // Switch back to normal mode
    setIsValidateEnabled(adsets.some(adset => adset.audienceType !== "")); // Check if any audience type is selected to enable validate button
  };

  return (
    <div className="w-full space-y-4 p-4">
      {outlets.map((outlet) => (
        <AdsetSettings key={outlet.id} outlet={outlet} onChange={handleChange} adsets={adsets} setAdSets={setAdSets} />
      ))}
      <div className="flex justify-end gap-2 w-full">
        {isEditing ? (
          <button 
            onClick={handleEdit}
            className="bg-[#3175FF] w-[142px] h-[52px] text-white px-6 py-3 rounded-md text-sm font-bold"
          >
            <span>Edit</span>
          </button>
        ) : (
          <button 
            className={`bg-[#3175FF] w-[142px] h-[52px] text-white px-6 py-3 rounded-md text-sm font-bold ${isValidateEnabled ? '' : 'opacity-50 cursor-not-allowed'}`} 
            disabled={!isValidateEnabled}
            onClick={handleValidate}
          >
            <span>Validate</span>
          </button>
        )}
      </div>
      {isEditing && selectedData && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Selected Data</h2>
          <pre>{JSON.stringify(selectedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}