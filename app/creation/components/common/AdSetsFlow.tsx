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
    <div className="relative border-2 border-[#0000001A] rounded-[10px]">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative z-20 w-full bg-[#ffffff] text-left border-2 border-[#0000001A] rounded-[10px] text-[#656565] text-sm flex items-center gap-2 py-4 px-8 transition-all duration-200"
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
        <div className="relative border border-[#0000001A] rounded-[10px]">
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


      <div className="flex justify-end gap-2 w-full">
        <button className="bg-[#3175FF] w-[142px] h-[52px] text-white px-6 py-3 rounded-md text-sm font-bold">
          <span>Validate</span>
        </button>

      </div>
    </>
  );
}