import React, { useState } from "react";
import Image from "next/image";

// Example icons for the platforms (replace with your own)
import facebookIcon from "../../../../public/facebook.svg";
import instagramIcon from "../../../../public/ig.svg";
import youtubeIcon from "../../../../public/youtube.svg";
import theTradeDeskIcon from "../../../../public/TheTradeDesk.svg";
import quantcastIcon from "../../../../public/quantcast.svg";
import { Trash } from "lucide-react";

export default function AdSetsFlow() {
  // Each ad set row will be an object in the adSets array.
  const [adSets, setAdSets] = useState([
    { id: Date.now(), audience: "", adSetName: "", size: "" },
  ]);

  // Function to add a new ad set row
  const addAdSet = () => {
    const newAdSet = {
      id: Date.now(),
      audience: "",
      adSetName: "",
      size: "",
    };
    setAdSets((prev) => [...prev, newAdSet]);
  };

  // Function to remove a specific ad set row
  const removeAdSet = (id) => {
    setAdSets((prev) => prev.filter((set) => set.id !== id));
  };

  // Function to handle changes in the input fields
  const handleInputChange = (id, field, value) => {
    setAdSets((prev) =>
      prev.map((set) =>
        set.id === id ? { ...set, [field]: value } : set
      )
    );
  };

  return (
    <div className="relative flex items-center gap-10 mt-8 p-2">
      {/* LEFT COLUMN: vertical list of platforms */}
      <div className="flex absolute flex-col gap-4">
        <PlatformItem icon={facebookIcon} label="Facebook" />
        <PlatformItem icon={instagramIcon} label="Instagram" />
        <PlatformItem icon={youtubeIcon} label="Youtube" />
        <PlatformItem icon={theTradeDeskIcon} label="The TradeDesk" />
        <PlatformItem icon={quantcastIcon} label="Quantcast" />
      </div>

      {/* RIGHT COLUMN: the flow with lines */}
      <div className="relative min-h-[500px] rounded-lg p-6">
        {/* "New add set" button + connecting line */}
        <div className="relative left-[15%] w-max">
          <button
            onClick={addAdSet}
            className="bg-blue-500 rounded-full text-white px-4 py-2 w-[133px] h-[39px] font-semibold"
          >
            + New add set
          </button>
          <div className="absolute left-1/2 top-full h-[50px] w-[2px] bg-gray-300" />
        </div>

        {/* Render each ad set row */}
        {adSets.map((set, index) => (
          <div
            key={set.id}
            className="flex flex-col md:flex-row relative ml-[8rem] items-center justify-center max-w-fit gap-2 rounded p-6"
          >
            {/* Label for the ad set row */}
            <button className="w-[96px] h-[51px] border-2 border-gray-300 bg-[#F9FAFB] rounded-md px-4 py-2 font-semibold">
              <span className="text-[#3175FF] text-sm font-600 whitespace-nowrap">
                Ad set n°{index + 1}
              </span>
              <div className="absolute left-1/2 top-full h-[50px] w-[2px]" />
            </button>

            {/* A horizontal line from the label to the fields */}
            <div className="h-[2px] w-4 bg-gray-300" />

            {/* Input fields */}
            <input
              placeholder="Your audience type"
              value={set.audience}
              onChange={(e) =>
                handleInputChange(set.id, "audience", e.target.value)
              }
              className="rounded-md h-[52px] w-[202px] bg-[#FFFFFF] border-2 border-gray-300 px-4 py-2 text-[#656565] text-sm focus:border-none"
            />
            <input
              placeholder="Enter ad set name"
              value={set.adSetName}
              onChange={(e) =>
                handleInputChange(set.id, "adSetName", e.target.value)
              }
              className="border-2 border-gray-300 bg-[#FFFFFF] rounded-md h-[52px] w-[202px] px-4 py-2 text-[#656565] text-sm focus:border-none"
            />
            <input
              placeholder="Enter size"
              value={set.size}
              onChange={(e) =>
                handleInputChange(set.id, "size", e.target.value)
              }
              className="border-2 border-gray-300 bg-[#FFFFFF] rounded-md h-[52px] w-[202px] px-4 py-2 text-[#656565] text-sm focus:border-none"
            />

            {/* Delete button for the row */}
            <button
              onClick={() => removeAdSet(set.id)}
              className="text-white border-2 border-[#0000001A] bg-[#FF5955] px-4 py-2 rounded-full h-[38px] w-[94px] text-sm hover:bg-red-300"
            >
              <div className="flex items-center gap-2">
                <span>
                  <Trash className="size-4" />
                </span>
                <p>Delete</p>
              </div>
            </button>
          </div>
        ))}

        {/* Validate button at bottom right */}
        <div className="absolute bottom-1 right-16">
          <button className="bg-blue-500 text-white w-[142px] h-[52px] px-4 py-2 rounded-md font-semibold hover:bg-blue-600">
            Validate
          </button>
        </div>
      </div>
    </div>
  );
}

function PlatformItem({ icon, label }) {
  return (
    <div className="flex border-2 border-gray-300 bg-[#F9FAFB] rounded-md px-4 py-2 h-[52px] items-center gap-2">
      <div className="w-5 h-5 relative">
        <Image src={icon} alt={label} fill style={{ objectFit: "contain" }} />
      </div>
      <span className="font-medium text-gray-700">{label}</span>
    </div>
  );
}
