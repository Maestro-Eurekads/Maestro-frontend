import React, { useState } from "react";
import { Trash } from "lucide-react";
import Button from "./button";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';

import trade from "../../../../public/TheTradeDesk.svg";
import table from "../../../../public/tabler_zoom-filled.svg";
import facebook from "../../../../public/facebook.svg";
import google from "../../../../public/Google.svg"
import instagram from "../../../../public/ig.svg";
import quantcast from "../../../../public/quantcast.svg";
import arrowdown from "../../../../public/arrow-down-2.svg";
import vector from "../../../../public/Vector.svg";
import { campaignObjectives } from '../../../../components/data';

const ConsiderationEdit = ({ onDelete }) => {
  const [showConsideration, setShowConsideration] = useState(true);
  const [selectedObjectives, setSelectedObjectives] = useState({
    socialVideoView: "",
    socialTraffic: "",
    displayVideoView: "",
    displayTraffic: "",
    searchTraffic: "",
    socialBuyType1: "CPM",
    socialBuyType2: "CPM",
    displayBuyType1: "CPV",
    displayBuyType2: "CPV",
    searchBuyType: "CPM"
  });

  const [showDropdowns, setShowDropdowns] = useState({
    socialVideoView: false,
    socialTraffic: false,
    displayVideoView: false,
    displayTraffic: false,
    searchTraffic: false,
    socialBuyType1: false,
    socialBuyType2: false,
    displayBuyType1: false,
    displayBuyType2: false,
    searchBuyType: false
  });

  const objectives = ["Video view", "Traffic", "Awareness"];
  const buyTypes = ["CPV", "CPM"];

  const handleObjectiveClick = (type, objective) => {
    setSelectedObjectives(prev => ({
      ...prev,
      [type]: objective
    }));
    setShowDropdowns(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const toggleDropdown = (type) => {
    setShowDropdowns(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this stage?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3175FF',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        setShowConsideration(false);
        if (onDelete) {
          onDelete();
        }
      }
    });
  };

  const DropdownButton = ({ type, defaultText }) => (
    <div className="relative">
      <button
        className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
        onClick={() => toggleDropdown(type)}
      >
        <span className="text-[#061237] font-semibold whitespace-nowrap">
          {selectedObjectives[type] || defaultText}
        </span>
        <Image src={arrowdown} className="size-4" alt="dropdown" />
      </button>

      {showDropdowns[type] && (
        <div className="absolute top-full left-0 w-[150px] bg-white border border-[#0000001A] rounded-[10px] mt-1 z-10">
          {objectives.map((objective) => (
            <div
              key={objective}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleObjectiveClick(type, objective)}
            >
              {objective}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const BuyTypeDropdown = ({ type }) => (
    <div className="relative">
      <button
        className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
        onClick={() => toggleDropdown(type)}
      >
        <span className="text-[#061237] font-semibold whitespace-nowrap">
          {selectedObjectives[type]}
        </span>
        <Image src={arrowdown} className="size-4" alt="dropdown" />
      </button>

      {showDropdowns[type] && (
        <div className="absolute top-full left-0 w-[150px] bg-white border border-[#0000001A] rounded-[10px] mt-1 z-10">
          {buyTypes.map((buyType) => (
            <div
              key={buyType}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleObjectiveClick(type, buyType)}
            >
              {buyType}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!showConsideration) {
    return (
      <button
        onClick={() => setShowConsideration(true)}
        className="w-full h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid text-white"
      >
        Add Consideration Stage
      </button>
    );
  }

  return (
    <div className="flex items-start flex-col gap-6">
      {/* Awareness */}
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-4">
          <Image src={table} alt="speaker" className="size-5" />
          <span className="text-lg leading-wider text-[#061237] font-semibold">Consideration</span>
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
        <div className="flex justify-center gap-4">
          <div className="grid grid-cols-2 gap-4">
            <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">
              <div className="flex items-center gap-2">
                <Image src={facebook} className="size-4" alt="facebook" />
                <span className="text-[#061237] font-semibold whitespace-nowrap">Facebook</span>
              </div>
              <Image src={vector} alt="vector" />
            </button>

            <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">
              <div className="flex items-center gap-2">
                <Image src={instagram} className="size-4" alt="instagram" />
                <span className="text-[#061237] font-semibold whitespace-nowrap">Instagram</span>
              </div>
              <Image src={vector} alt="vector" />
            </button>

            {/* second row */}
            <DropdownButton type="socialVideoView" defaultText="Video view" />
            <DropdownButton type="socialTraffic" defaultText="Traffic" />

            {/* Third rows */}
            <BuyTypeDropdown type="socialBuyType1" />
            <BuyTypeDropdown type="socialBuyType2" />
          </div>

          <div>
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
              <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">
                <div className="flex items-center gap-2">
                  <Image src={trade} className="size-4" alt="facebook" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">TradeDesk</span>
                </div>
                <Image src={vector} alt="vector" />
              </button>

              <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">
                <div className="flex items-center gap-2">
                  <Image src={quantcast} className="size-4" alt="instagram" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">Quantcast</span>
                </div>
                <Image src={vector} alt="vector" />
              </button>

              {/* second row */}
              <DropdownButton type="displayVideoView" defaultText="Video view" />
              <DropdownButton type="displayTraffic" defaultText="Traffic" />

              {/* Third rows */}
              <BuyTypeDropdown type="displayBuyType1" />
              <BuyTypeDropdown type="displayBuyType2" />
            </div>

            <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
              <span className="text-white">Add new channel</span>
            </button>
          </div>
        </div>

        {/* Search engine */}
        <div className="flex ml-8 flex-col items-start gap-4">
          <h2 className="font-bold text-[#061237] pt-4">Search engines</h2>
          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-start gap-4">
              <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">
                <div className="flex items-center gap-2">
                  <Image src={google} className="size-4" alt="google" />
                  <span className="text-[#061237] font-semibold whitespace-nowrap">Google</span>
                </div>
                <Image src={vector} alt="vector" />
              </button>

              <DropdownButton type="searchTraffic" defaultText="Traffic" />

              <BuyTypeDropdown type="searchBuyType" />
            </div>

            <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
              <span className="text-white">Add new channel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsiderationEdit;