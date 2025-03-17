import React, { useState } from "react";
import { Trash } from "lucide-react";
import Button from "./button";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

import trade from "../../../../public/TheTradeDesk.svg";
import instagram from "../../../../public/ig.svg";
import quantcast from "../../../../public/quantcast.svg";
import arrowdown from "../../../../public/arrow-down-2.svg";
import vector from "../../../../public/Vector.svg";

import facebook from "../../../../public/facebook.svg";
import ig from "../../../../public/ig.svg";
import youtube from "../../../../public/youtube.svg";
import TheTradeDesk from "../../../../public/TheTradeDesk.svg";
import Quantcast from "../../../../public/quantcast.svg";
import speaker from "../../../../public/mdi_megaphone.svg";

import google from "../../../../public/social/google.svg";
import x from "../../../../public/x.svg";
import linkedin from "../../../../public/linkedin.svg";
import Display from "../../../../public/Display.svg";
import yahoo from "../../../../public/yahoo.svg";
import bing from "../../../../public/bing.svg";
import tictok from "../../../../public/tictok.svg";
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
    setDropdowns(id);
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

  const platformIcons = {
    Facebook: facebook,
    Instagram: ig,
    YouTube: youtube,
    TheTradeDesk: TheTradeDesk,
    Quantcast: Quantcast,
    Google: google,
    "Twitter/X": x,
    LinkedIn: linkedin,
    TikTok: tictok,
    "Display & Video": Display,
    Yahoo: yahoo,
    Bing: bing,
    "Apple Search": google,
    "The Trade Desk": TheTradeDesk,
    QuantCast: Quantcast,
  };

  const getPlatformIcon = (platformName) => {
    return platformIcons[platformName] || null;
  };

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
              {sm_data?.map((sm, index) => (
                <div className="flex flex-col gap-4">
                  <div
                    key={`${stageName - index}`}
                    className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={getPlatformIcon(sm?.platform_name)}
                        className="size-4"
                        alt="facebook"
                      />
                      <span className="text-[#061237] font-semibold whitespace-nowrap">
                        {sm?.platform_name}
                      </span>
                    </div>
                    <Image src={vector} alt="vector" />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <button
                        onClick={() =>
                          toggleDropdown(
                            `${stageName}${index}${sm?.platform_name}`
                          )
                        }
                        className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                      >
                        <span className="text-[#061237] font-semibold whitespace-nowrap">
                          {sm?.buy_type}
                        </span>
                        <Image
                          src={arrowdown}
                          className="size-4"
                          alt="dropdown"
                        />
                      </button>
                      {dropdowns ===
                        `${stageName}${index}${sm?.platform_name}` && (
                        <div className="absolute top-full left-0 w-[150px] bg-white border border-[#0000001A] rounded-[10px] mt-1 z-10">
                          {["option"].map((option, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                handleSelect(`${stageName - index}`, option)
                              }
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <button
                        onClick={() =>
                          toggleDropdown(
                            `${stageName}${index}${sm?.platform_name}`
                          )
                        }
                        className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                      >
                        <span className="text-[#061237] font-semibold whitespace-nowrap">
                          {sm?.objective_type}
                        </span>
                        <Image
                          src={arrowdown}
                          className="size-4"
                          alt="dropdown"
                        />
                      </button>
                      {dropdowns ===
                        `${stageName}${index}${sm?.platform_name}` && (
                        <div className="absolute top-full left-0 w-[150px] bg-white border border-[#0000001A] rounded-[10px] mt-1 z-10">
                          {["option"].map((option, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                handleSelect(`${stageName - index}`, option)
                              }
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Second row - Static buttons */}
          </div>
          <div className="shrink-0 max-w-[300px]">
            <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
              <span className="text-white">Add new channel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Display Networks */}
      <div className="flex flex-col items-start gap-4">
        <h2 className="font-bold text-[#061237]">Display Networks</h2>
        <div className="flex gap-4 w-full">
          <div className="flex flex-col gap-4 w-[680px] overflow-x-auto">
            {/* First row - Static buttons */}
            <div className="flex gap-4 items-center">
              {dn_data?.map((sm, index) => (
                <div className="flex flex-col gap-4">
                  <div
                    key={`${stageName - index}`}
                    className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={getPlatformIcon(sm?.platform_name)}
                        className="size-4"
                        alt="facebook"
                      />
                      <span className="text-[#061237] font-semibold whitespace-nowrap">
                        {sm?.platform_name}
                      </span>
                    </div>
                    <Image src={vector} alt="vector" />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <button
                        onClick={() =>
                          toggleDropdown(
                            `${stageName}${index}${sm?.platform_name}`
                          )
                        }
                        className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                      >
                        <span className="text-[#061237] font-semibold whitespace-nowrap">
                          {sm?.buy_type}
                        </span>
                        <Image
                          src={arrowdown}
                          className="size-4"
                          alt="dropdown"
                        />
                      </button>
                      {dropdowns ===
                        `${stageName}${index}${sm?.platform_name}` && (
                        <div className="absolute top-full left-0 w-[150px] bg-white border border-[#0000001A] rounded-[10px] mt-1 z-10">
                          {["option"].map((option, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                handleSelect(`${stageName - index}`, option)
                              }
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <button
                        onClick={() =>
                          toggleDropdown(
                            `${stageName}${index}${sm?.platform_name}`
                          )
                        }
                        className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                      >
                        <span className="text-[#061237] font-semibold whitespace-nowrap">
                          {sm?.objective_type}
                        </span>
                        <Image
                          src={arrowdown}
                          className="size-4"
                          alt="dropdown"
                        />
                      </button>
                      {dropdowns ===
                        `${stageName}${index}${sm?.platform_name}` && (
                        <div className="absolute top-full left-0 w-[150px] bg-white border border-[#0000001A] rounded-[10px] mt-1 z-10">
                          {["option"].map((option, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                handleSelect(`${stageName - index}`, option)
                              }
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Second row - Static buttons */}
          </div>
          <div className="shrink-0 max-w-[300px]">
            <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
              <span className="text-white">Add new channel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Engines */}
      <div className="flex flex-col items-start gap-4">
        <h2 className="font-bold text-[#061237]">Search engines</h2>
        <div className="flex gap-4 w-full">
          <div className="flex flex-col gap-4 w-[680px] overflow-x-auto">
            {/* First row - Static buttons */}
            <div className="flex gap-4 items-center">
              {se_data?.map((sm, index) => (
                <div className="flex flex-col gap-4">
                  <div
                    key={`${stageName - index}`}
                    className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={getPlatformIcon(sm?.platform_name)}
                        className="size-4"
                        alt="facebook"
                      />
                      <span className="text-[#061237] font-semibold whitespace-nowrap">
                        {sm?.platform_name}
                      </span>
                    </div>
                    <Image src={vector} alt="vector" />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <button
                        onClick={() =>
                          toggleDropdown(
                            `${stageName}${index}${sm?.platform_name}`
                          )
                        }
                        className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                      >
                        <span className="text-[#061237] font-semibold whitespace-nowrap">
                          {sm?.buy_type}
                        </span>
                        <Image
                          src={arrowdown}
                          className="size-4"
                          alt="dropdown"
                        />
                      </button>
                      {dropdowns ===
                        `${stageName}${index}${sm?.platform_name}` && (
                        <div className="absolute top-full left-0 w-[150px] bg-white border border-[#0000001A] rounded-[10px] mt-1 z-10">
                          {["option"].map((option, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                handleSelect(`${stageName - index}`, option)
                              }
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <button
                        onClick={() =>
                          toggleDropdown(
                            `${stageName}${index}${sm?.platform_name}`
                          )
                        }
                        className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                      >
                        <span className="text-[#061237] font-semibold whitespace-nowrap">
                          {sm?.objective_type}
                        </span>
                        <Image
                          src={arrowdown}
                          className="size-4"
                          alt="dropdown"
                        />
                      </button>
                      {dropdowns ===
                        `${stageName}${index}${sm?.platform_name}` && (
                        <div className="absolute top-full left-0 w-[150px] bg-white border border-[#0000001A] rounded-[10px] mt-1 z-10">
                          {["option"].map((option, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                handleSelect(`${stageName - index}`, option)
                              }
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Second row - Static buttons */}
          </div>
          <div className="shrink-0 max-w-[300px]">
            <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
              <span className="text-white">Add new channel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwarenessEdit;
