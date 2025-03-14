import React, { useState } from "react";
import { Trash } from "lucide-react";
import Button from "./button";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

import trade from "../../../../public/TheTradeDesk.svg";
import speaker from "../../../../public/mdi_megaphone.svg";
import facebook from "../../../../public/facebook.svg";
import youtube from "../../../../public/youtube.svg";
import instagram from "../../../../public/ig.svg";
import quantcast from "../../../../public/quantcast.svg";
import arrowdown from "../../../../public/arrow-down-2.svg";
import vector from "../../../../public/Vector.svg";
import { campaignObjectives } from "../../../../components/data";

const AwarenessEdit = ({ onDelete, stageName, sm_data, dn_data, se_data }) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [values, setValues] = useState({});

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this stage?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3175FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsDeleted(true);
        if (onDelete) {
          onDelete();
        }
        Swal.fire("Deleted!", "Your stage has been deleted.", "success");
      }
    });
  };

  const handleAddBack = () => {
    setIsDeleted(false);
  };

  const toggleDropdown = (id) => {
    setDropdowns((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [id]: !prev[id],
    }));
  };

  const handleSelect = (id, value) => {
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
    setDropdowns((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const renderDropdownButton = (id, defaultValue, options) => {
    return (
      <div className="relative">
        <button
          onClick={() => toggleDropdown(id)}
          className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
        >
          <span className="text-[#061237] font-semibold whitespace-nowrap">
            {values[id] || defaultValue}
          </span>
          <Image src={arrowdown} className="size-4" alt="dropdown" />
        </button>
        {dropdowns[id] && (
          <div className="absolute top-full left-0 w-[150px] bg-white border border-[#0000001A] rounded-[10px] mt-1 z-10">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(id, option)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isDeleted) {
    return (
      <button
        onClick={handleAddBack}
        className="w-full py-4 bg-[#3175FF] text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Add Awareness Stage
      </button>
    );
  }

  return (
    <div className="flex items-start flex-col gap-6">
      {/* Awareness */}
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-4">
          <Image src={speaker} alt="speaker" className="size-5" />
          <span className="text-lg leading-wider text-[#061237] font-semibold">
            {stageName}
          </span>
        </div>

        <Button
          variant="danger"
          text="Delete this stage"
          icon={Trash}
          onClick={handleDelete}
          className="!rounded-full !px-4 !py-4 !text-white !w-[167px] !h-[31px]"
        />
      </div>

      {/* social media */}
      <div className="flex flex-col items-start gap-4">
        <h2 className="font-bold text-[#061237]">Social Media</h2>
        <div className="flex gap-4 w-full">
          <div className="flex flex-col gap-4 w-[680px] overflow-x-auto">
            {/* First row - Static buttons */}
            <div className="flex gap-4 items-center">
              <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                <div className="flex items-center gap-2">
                  <Image src={facebook} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    Facebook
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </div>
              <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                <div className="flex items-center gap-2">
                  <Image src={facebook} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    Facebook
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </div>
              <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                <div className="flex items-center gap-2">
                  <Image src={facebook} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    Facebook
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </div>
              <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                <div className="flex items-center gap-2">
                  <Image src={facebook} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    Facebook
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </div>
              <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                <div className="flex items-center gap-2">
                  <Image src={facebook} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    Facebook
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </div>
              <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                <div className="flex items-center gap-2">
                  <Image src={facebook} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    Facebook
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </div>
              <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                <div className="flex items-center gap-2">
                  <Image src={facebook} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    Facebook
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </div>
            </div>
            {/* Second row - Static buttons */}
            <div className="flex gap-4 items-center">
              <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                <div className="flex items-center gap-2">
                  <Image src={facebook} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    Facebook
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </div>
            </div>
          </div>
          <div className="shrink-0 max-w-[300px]">
            <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
              <span className="text-white">Add new channel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Display network */}
      <div className="flex justify-center gap-4">
        <div className="flex flex-col items-start gap-4">
          <h2 className="font-bold text-[#061237] pt-4">Display networks</h2>
          <div className="flex justify-center gap-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4">
                <div className="flex items-center gap-2">
                  <Image src={trade} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    TradeDesk
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </button>

              <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4">
                <div className="flex items-center gap-2">
                  <Image src={quantcast} className="size-4" alt="instagram" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">
                    Quantcast
                  </span>
                </div>
                <Image src={vector} alt="vector" />
              </button>

              {/* Second row - Dropdown buttons */}
              {renderDropdownButton("videoviews3", "Video views", [
                "Video View",
                "Awareness",
                "Traffic",
              ])}
              {renderDropdownButton("videoviews4", "Video views", [
                "Video View",
                "Awareness",
                "Traffic",
              ])}

              {/* Third row - Dropdown buttons */}
              {renderDropdownButton("cpm4", "CPM", ["CPM", "CPV"])}
              {renderDropdownButton("cpm5", "CPM", ["CPM", "CPV"])}
            </div>

            <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
              <span className="text-white">Add new channel</span>
            </button>
          </div>
        </div>

        {/* Search engine */}
        <div className="flex ml-8 flex-col items-start gap-4">
          <h2 className="font-bold text-[#061237] pt-4">Search engines</h2>
          <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
            <span className="text-white">Add new channel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AwarenessEdit;
