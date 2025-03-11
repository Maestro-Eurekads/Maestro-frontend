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
import card from "../../../../public/mdi_credit-card.svg";
import quantcast from "../../../../public/quantcast.svg";
import arrowdown from "../../../../public/arrow-down-2.svg";
import vector from "../../../../public/Vector.svg";
import { campaignObjectives } from '../../../../components/data';

const ConversionEdit = ({ onDelete }) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState({
    traffic1: false,
    traffic2: false,
    videoView1: false,
    videoView2: false,
    cpm1: false,
    cpm2: false,
    cpv1: false,
    cpv2: false,
    searchTraffic: false,
    searchBuyType: false
  });

  const [selectedValues, setSelectedValues] = useState({
    traffic1: "Traffic",
    traffic2: "Traffic", 
    videoView1: "Video view",
    videoView2: "Video view",
    cpm1: "CPM",
    cpm2: "CPM",
    cpv1: "CPV",
    cpv2: "CPV",
    searchTraffic: "Traffic",
    searchBuyType: "CPM"
  });

  const objectives = ["Traffic", "Awareness", "Video view"];
  const buyTypes = ["CPM", "CPV"];

  const toggleDropdown = (key) => {
    setShowDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelect = (key, value) => {
    setSelectedValues(prev => ({
      ...prev,
      [key]: value
    }));
    setShowDropdowns(prev => ({
      ...prev,
      [key]: false
    }));
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this stage?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3175FF',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setIsDeleted(true);
      if (onDelete) {
        onDelete();
      }
      Swal.fire(
        'Deleted!',
        'Your stage has been deleted.',
        'success'
      );
    }
  };

  const handleAddBack = () => {
    setIsDeleted(false);
  };

  if (isDeleted) {
    return (
      <div className="w-full flex justify-center py-8">
        <button 
          onClick={handleAddBack}
          className="bg-[#3175FF] text-white px-6 py-3 rounded-lg hover:bg-[#2861db]"
        >
          Add Conversion Stage
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start flex-col gap-6">
      {/* Awareness */}
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-4">
          <Image src={card} alt="card" className="size-5" />
          <span className="text-lg leading-wider text-[#061237] font-semibold">Conversion</span>
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
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('traffic1')}
                className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
              >
                <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.traffic1}</span>
                <Image src={arrowdown} className="size-4" alt="traffic" />
              </button>
              {showDropdowns.traffic1 && (
                <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                  {objectives.map((objective) => (
                    <div 
                      key={objective}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelect('traffic1', objective)}
                    >
                      {objective}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => toggleDropdown('traffic2')}
                className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
              >
                <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.traffic2}</span>
                <Image src={arrowdown} className="size-4" alt="traffic" />
              </button>
              {showDropdowns.traffic2 && (
                <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                  {objectives.map((objective) => (
                    <div 
                      key={objective}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelect('traffic2', objective)}
                    >
                      {objective}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Third rows */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('cpm1')}
                className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
              >
                <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.cpm1}</span>
                <Image src={arrowdown} className="size-4" alt="cpv" />
              </button>
              {showDropdowns.cpm1 && (
                <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                  {buyTypes.map((type) => (
                    <div 
                      key={type}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelect('cpm1', type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => toggleDropdown('cpm2')}
                className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
              >
                <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.cpm2}</span>
                <Image src={arrowdown} className="size-4" alt="cpm" />
              </button>
              {showDropdowns.cpm2 && (
                <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                  {buyTypes.map((type) => (
                    <div 
                      key={type}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelect('cpm2', type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
              <span className="text-white">Add new channel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Display network and Search engine container */}
      <div className="flex gap-8">
        {/* Display network */}
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
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('videoView1')}
                  className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                >
                  <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.videoView1}</span>
                  <Image src={arrowdown} className="size-4" alt="video view" />
                </button>
                {showDropdowns.videoView1 && (
                  <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                    {objectives.map((objective) => (
                      <div 
                        key={objective}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelect('videoView1', objective)}
                      >
                        {objective}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('videoView2')}
                  className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                >
                  <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.videoView2}</span>
                  <Image src={arrowdown} className="size-4" alt="video view" />
                </button>
                {showDropdowns.videoView2 && (
                  <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                    {objectives.map((objective) => (
                      <div 
                        key={objective}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelect('videoView2', objective)}
                      >
                        {objective}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Third rows */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('cpv1')}
                  className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                >
                  <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.cpv1}</span>
                  <Image src={arrowdown} className="size-4" alt="video view" />
                </button>
                {showDropdowns.cpv1 && (
                  <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                    {buyTypes.map((type) => (
                      <div 
                        key={type}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelect('cpv1', type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('cpv2')}
                  className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                >
                  <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.cpv2}</span>
                  <Image src={arrowdown} className="size-4" alt="video view" />
                </button>
                {showDropdowns.cpv2 && (
                  <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                    {buyTypes.map((type) => (
                      <div 
                        key={type}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelect('cpv2', type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="w-[153px] h-[52px] bg-[#3175FF] rounded-[8px] border border-[#0000001A] border-solid">
              <span className="text-white">Add new channel</span>
            </button>
          </div>
        </div>

        {/* Search engine */}
        <div className="flex flex-col items-start gap-4">
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

              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('searchTraffic')}
                  className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                >
                  <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.searchTraffic}</span>
                  <Image src={arrowdown} className="size-4" alt="traffic" />
                </button>
                {showDropdowns.searchTraffic && (
                  <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                    {objectives.map((objective) => (
                      <div 
                        key={objective}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelect('searchTraffic', objective)}
                      >
                        {objective}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('searchBuyType')}
                  className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4"
                >
                  <span className="text-[#061237] font-semibold whitespace-nowrap">{selectedValues.searchBuyType}</span>
                  <Image src={arrowdown} className="size-4" alt="buy type" />
                </button>
                {showDropdowns.searchBuyType && (
                  <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-10">
                    {buyTypes.map((type) => (
                      <div 
                        key={type}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelect('searchBuyType', type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

export default ConversionEdit;