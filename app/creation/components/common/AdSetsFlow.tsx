// import React from "react";
// import Image from "next/image";

// // Example icons for the platforms (replace with your own)
// import facebookIcon from "../../../../public/facebook.svg";
// import instagramIcon from "../../../../public/ig.svg";
// import youtubeIcon from "../../../../public/youtube.svg";
// import theTradeDeskIcon from "../../../../public/TheTradeDesk.svg";
// import quantcastIcon from "../../../../public/quantcast.svg";
// import { Trash } from "lucide-react";

// // Minimal example component
// export default function AdSetsFlow() {


//   return (
//     <div className="relative flex items-center gap-10 mt-8 p-2">
//       {/* LEFT COLUMN: vertical list of platforms */}
//       <div className="flex absolute flex-col gap-4">
//         <PlatformItem icon={facebookIcon} label="Facebook" />
//         <PlatformItem icon={instagramIcon} label="Instagram" />
//         <PlatformItem icon={youtubeIcon} label="Youtube" />
//         <PlatformItem icon={theTradeDeskIcon} label="The TradeDesk" />
//         <PlatformItem icon={quantcastIcon} label="Quantcast" />
//       </div>

//       {/* RIGHT COLUMN: the flow with lines */}
//       <div className="relative min-h-[500px] rounded-lg p-6">
//         {/* "New add set" button + connecting line */}
//         <div className="relative left-[15%] w-max">
//           {/* Button */}
//           <button className="bg-blue-500 rounded-full text-white px-4 py-2 w-[133px] h-[39px] font-semibold">
//             + New add set
//           </button>

//           {/* The vertical line from the button to the ad-set row */}
//           <div className="absolute left-1/2 top-full h-[50px] w-[2px] bg-gray-300" />
//         </div>

//         {/* Ad set row (fields) + connecting line from above */}
//         <div className="flex flex-col md:flex-row relative ml-[8rem] items-center justify-center max-w-fit gap-2 rounded p-6 ">
//           {/* "Ad set n°1" label */}
//           <button className=" w-[96px] h-[51px] border-2 border-gray-300 bg-[#F9FAFB] rounded-md px-4 py-2 font-semibold">
//           <span className="text-[#3175FF] text-sm font-600 whitespace-nowrap">
//             Ad set n°1
//           </span>

//           <div className="absolute left-1/2 top-full h-[50px] w-[2px]"></div>
//           </button>


//           {/* A horizontal line from the label to the fields (optional) */}
//           <div className="h-[2px] w-4 bg-gray-300" />

//           {/* Fields */}
//           <input
//             placeholder="Your audience type"
//             className="rounded-md h-[52px] w-[202px]  bg-[#FFFFFF]  border-2 border-gray-300 px-4 py-2 text-[#656565] text-sm focus:border-none"
//           />
//           <input
//             placeholder="Enter ad set name"
//             className="border-2 border-gray-300  bg-[#FFFFFF] rounded-md h-[52px] w-[202px] px-4 py-2 text-[#656565]  text-sm focus:border-none"
//           />
//           <input
//             placeholder="Enter size"
//             className="border-2 border-gray-300 bg-[#FFFFFF]  rounded-md h-[52px] w-[202px] px-4 py-2  text-[#656565] text-sm focus:border-none"
//           />

//           {/* Delete button */}
//           <button className="text-white border-2 border-[#0000001A] bg-[#FF5955] px-4 py-2 rounded-full h-[38px] w-[94px] text-sm hover:bg-red-300">
//             <div className="flex items-center gap-2">
//             <span><Trash className="size-4" /></span>
//             <p>Delete</p>
//             </div>

//           </button>
//         </div>

//         {/* Validate button at bottom right */}
//         <div className="absolute bottom-1 right-16">
//           <button className="bg-blue-500 text-white w-[142px] h-[52px] px-4 py-2 rounded-md font-semibold hover:bg-blue-600">
//             Validate
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// function PlatformItem({ icon, label }) {
//     return (
//       <div className="flex border-2 border-gray-300 bg-[#F9FAFB] rounded-md px-4 py-2 h-[52px] items-center gap-2">
//         <div className="w-5 h-5 relative">
//           <Image src={icon} alt={label} fill style={{ objectFit: "contain" }} />
//         </div>
//         <span className="font-medium text-gray-700">{label}</span>
//       </div>
//     );
// }



"use client";

import Image, { StaticImageData } from "next/image";
import facebookIcon from "../../../../public/facebook.svg";
import instagramIcon from "../../../../public/ig.svg";
import youtubeIcon from "../../../../public/youtube.svg";
import theTradeDeskIcon from "../../../../public/TheTradeDesk.svg";
import quantcastIcon from "../../../../public/quantcast.svg";
import { FaAngleRight } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdAdd } from "react-icons/md";
import { useState } from "react";

// AudienceDropdown component with animated dropdown
function AudienceDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>("");

  const options = [
    "Lookalike audience",
    "Retargeting audience",
    "Broad audience",
    "Behavioral audience"
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative z-20 w-full bg-[#ffffff] text-left border border-gray-300 text-[#656565] text-sm flex items-center gap-2 py-4 px-8 rounded-[10px] transition-all duration-200"
      >
        {selected || "Your audience type"}
        <svg
          className={`ml-auto h-4 w-4 transform transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
            }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"

          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul className="absolute whitespace-nowrap left-0 right-0 px-4 py-2 mt-1 z-10 bg-white border-2 border-[#0000001A] rounded-[10px] transition-all duration-200">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className="px-6 py-4 whitespace-nowrap hover:bg-gray-100 cursor-pointer text-[#656565] text-sm font-bold"
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
}: {
  outlet: { id: number; outlet: string; icon: StaticImageData };
}) {
  // Only show full ad set settings for Facebook.
  const isFacebook = outlet.outlet === "Facebook";

  if (!isFacebook) {
    // For non-Facebook outlets, display only the outlet button.
    return (
      <div className="flex items-center gap-8">
        <div className="relative">
          <button className="relative w-[150px] z-20 flex gap-4 justify-between items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
            <Image src={outlet.icon} alt="" className="w-[22px] h-[22px]" />
            <span className="text-[#061237] font-medium">{outlet.outlet}</span>
            <FaAngleRight />
          </button>
        </div>
      </div>
    );
  }

  // For Facebook, include the full ad set settings UI.
  const [adsets, setAdSets] = useState([
    {
      id: Date.now(),
      addsetNumber: 1,
    },
  ]);

  const adsetAmount = adsets.length;

  function addNewAddset() {
    const newAdSet = {
      id: Date.now(),
      addsetNumber: adsetAmount + 1,
    };
    setAdSets((prev) => [...prev, newAdSet]);
  }

  function deleteAdSet(id: number) {
    setAdSets((prev) => prev.filter((adset) => adset.id !== id));
  }

  return (
    <div className="flex items-center gap-8">
      <div className="relative">
        <button className="relative w-[150px] z-20 flex gap-4 justify-between items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
          <Image src={outlet.icon} alt="" className="w-[22px] h-[22px]" />
          <span className="text-[#061237] font-medium">{outlet.outlet}</span>
          <FaAngleRight />
        </button>
        <hr className="border border-[#0000001A] w-[100px] absolute bottom-1/2 translate-y-1/2 -right-0 translate-x-3/4" />
      </div>
      <div className="relative w-full h-[194px]">
        <div
          className={`absolute ${adsetAmount === 1
              ? "top-0"
              : adsetAmount === 2
                ? "bottom-0"
                : "hidden"
            }`}
        >
          <span
            className={`border-l-2 border-[#0000001A] h-[78px] w-8 absolute -left-4 ${adsetAmount === 1
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
            className={`absolute ${index === 0
                ? "top-1/2 -translate-y-1/2"
                : index === 1
                  ? "top-0"
                  : "bottom-0"
              }`}
          >
            <span
              className={`border-l-2 border-[#0000001A] h-[70px] w-8 absolute -left-4 ${index === 0
                  ? "hidden"
                  : index === 1
                    ? "top-1/2 rounded-tl-[10px] border-t-2"
                    : "bottom-1/2 rounded-bl-[10px] border-b-2"
                }`}
            ></span>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <p className="relative z-20 text-[#3175FF] text-sm font-bold flex gap-4 items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
                  {`Ad set n°${adset.addsetNumber}`}
                </p>
                <hr className="border border-[#0000001A] w-[50px] absolute bottom-1/2 translate-y-1/2 -right-0 translate-x-3/4" />
              </div>
              <AudienceDropdown />
              <input
                type="text"
                placeholder="Enter ad set name"
                className="text-[#3175FF] text-sm font-bold flex gap-4 items-center border border-[#0000001A] py-4 px-2 rounded-[10px]"
              />
              <input
                type="text"
                placeholder="Enter size"
                className="text-[#3175FF] text-sm font-bold flex gap-4 items-center border border-[#0000001A] py-4 px-2 rounded-[10px]"
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
      id: Date.now(),
      outlet: "Instagram",
      icon: instagramIcon,
    },
    {
      id: Date.now(),
      outlet: "Youtube",
      icon: youtubeIcon,
    },
    {
      id: Date.now(),
      outlet: "TheTradeDesk",
      icon: theTradeDeskIcon,
    },
    {
      id: Date.now(),
      outlet: "Quantcast",
      icon: quantcastIcon,
    },
  ];
  return (
    <>
      <div className="w-full space-y-4">
        {outlets.map((outlet) => (
          <AdsetSettings key={outlet.id} outlet={outlet} />
        ))}


      </div>

      <div className="flex justify-end gap-2">
        <button className="bg-[#3175FF] text-white px-6 py-3 rounded-md text-sm font-bold">
          <span>Validate</span>
        </button>

      </div>
    </>
  );
}