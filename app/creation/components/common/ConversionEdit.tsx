import React, { useState } from "react";
import { Trash } from "lucide-react";
import Button from "./button";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const ConversionEdit = ( { onDelete }) => {
  // const [socialMedia, setSocialMedia] = useState([
  //   { id: 1, name: "Facebook", icon: facebook },
  //   { id: 2, name: "Instagram", icon: instagram },
  //   { id: 3, name: "Youtube", icon: youtube },
  //   { id: 4, name: "Awareness", icon: arrowdown },
  //   { id: 5, name: "Video Views", icon: arrowdown },
  //   { id: 6, name: "Video Views", icon: arrowdown },
  //   { id: 7, name: "Video Views", icon: arrowdown },
  //   { id: 8, name: "CPV", icon: arrowdown },
  //   { id: 9, name: "CPV", icon: arrowdown },
  // ]);

  // const [displayNetwork, setDisplayNetwork] = useState([
  //   { id: 1, name: "The TradeDesk", icon: trade },
  //   { id: 2, name: "QuantCast", icon: quantcast },
  //   { id: 3, name: "Video Views", icon: arrowdown },
  //   { id: 4, name: "Video Views", icon: arrowdown },
  //   { id: 5, name: "CPV", icon: arrowdown },
  //   { id: 6, name: "CPV", icon: arrowdown },
  // ]);

  // Social Media: sequentially add Facebook, Instagram, then Youtube
  // const socialTypes = [
  //   { name: "Facebook", icon: facebook },
  //   { name: "Instagram", icon: instagram },
  //   { name: "Youtube", icon: youtube },
  // ];
  // const [socialIndex, setSocialIndex] = useState(0);

  // const addNewSocialMediaChannel = () => {
  //   const nextId = socialMedia.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  //   const channelToAdd = socialTypes[socialIndex % socialTypes.length];
  //   setSocialMedia([...socialMedia, { id: nextId, ...channelToAdd }]);
  //   setSocialIndex(socialIndex + 1);
  // };

  // Display Network: sequentially add The TradeDesk then QuantCast
  // const displayTypes = [
  //   { name: "The TradeDesk", icon: trade },
  //   { name: "QuantCast", icon: quantcast },
  // ];
  // const [displayIndex, setDisplayIndex] = useState(0);

  // const addNewDisplayNetworkChannel = () => {
  //   const nextId = displayNetwork.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  //   const channelToAdd = displayTypes[displayIndex % displayTypes.length];
  //   setDisplayNetwork([...displayNetwork, { id: nextId, ...channelToAdd }]);
  //   setDisplayIndex(displayIndex + 1);
  // };

  // Remove functions
  // const removeSocialMediaChannel = (id) => {
  //   setSocialMedia(socialMedia.filter(item => item.id !== id));
  // };

  // const removeDisplayNetworkChannel = (id) => {
  //   setDisplayNetwork(displayNetwork.filter(item => item.id !== id));
  // };

  return (
    // <div className="flex flex-col items-start p-6">
    //   {/* Header */}
    //   <div className="flex justify-between w-full items-center mb-4">
    //     <div className="flex items-center gap-4">
    //       <Image src={speaker} alt="Awareness icon" className="w-5 h-5" />
    //       <span className="text-black font-semibold">Awareness</span>
    //     </div>
    //     <Button
    //       text="Delete this stage"
    //       variant="danger"
    //       icon={Trash}
    //       onClick={() => {
    //         toast.success("Stage Deleted successfully!");
    //         setTimeout(() => onDelete(), 2000);
    //       }}
    //       iconColor="text-white"
    //       className="rounded-full px-4 py-2 text-sm"
    //     />
    //   </div>

    //   {/* Social Media Section */}
    //   <h2 className="text-black font-bold text-md mb-4">Social Media</h2>

    //   <div className="flex flex-col md:flex-row justify-center gap-4">
    //     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
    //       {socialMedia.map((item) => (
    //         <div
    //           key={item.id}
    //           className="flex justify-between items-center gap-2 p-3 cursor-pointer whitespace-nowrap border rounded-md bg-white shadow-md"
    //         >
    //           <div className="flex items-center space-x-4">
    //             {/* Render the icon for YouTube, Instagram, and Facebook */}
    //             {item.icon !== arrowdown && (
    //               <Image src={item.icon} alt={item.name} className="w-4 h-4" />
    //             )}
    //             <p className="text-md text-black">{item.name}</p>
    //             {/* Render the arrowdown icon on the right */}
    //             {item.icon === arrowdown && (
    //               <Image src={item.icon} alt={item.name} className="w-4 h-4" />
    //             )}
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //     <Button
    //       text="Add new channel"
    //       variant="primary"
    //       onClick={addNewSocialMediaChannel}
    //       className="rounded-md whitespace-nowrap px-4 py-2"
    //     />
    //   </div>

    //   {/* Display Network Section */}
    //   <h2 className="text-black font-bold text-md mt-6 mb-4">Display Network</h2>
    //   <div className="flex flex-col md:flex-row justify-between gap-4">
    //     <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
    //       {displayNetwork.map((item) => (
    //         <div
    //           key={item.id}
    //           className="flex justify-between items-center gap-2 p-3 cursor-pointer border rounded-md bg-white shadow-md"
    //         >
    //           <div className="flex items-center space-x-4">
    //             {/* Render the icon for The TradeDesk and QuantCast */}
    //             {item.icon !== arrowdown && (
    //               <Image src={item.icon} alt={item.name} className="w-4 h-4" />
    //             )}
    //             <p className="text-md text-black whitespace-nowrap">{item.name}</p>
    //             {/* Render the arrowdown icon on the right */}
    //             {item.icon === arrowdown && (
    //               <Image src={item.icon} alt={item.name} className="w-4 h-4" />
    //             )}
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //     <Button
    //       text="Add new channel"
    //       variant="primary"
    //       onClick={addNewDisplayNetworkChannel}
    //       className="rounded-md whitespace-nowrap px-4 py-2"
    //     />
    //   </div>

    //   <ToastContainer />
    // </div>
    


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
         onClick={() => alert("Deleted")}
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
          <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

            <span className="text-[#061237] font-semibold whitespace-nowrap">Traffic</span>
            <Image src={arrowdown} className="size-4" alt="traffic" />

          </button>
          <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

            <span className="text-[#061237] font-semibold whitespace-nowrap">Traffic</span>
            <Image src={arrowdown} className="size-4" alt="traffic" />

          </button>
         

          {/* Third rows */}

          <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

            <span className="text-[#061237] font-semibold whitespace-nowrap">CPM</span>
            <Image src={arrowdown} className="size-4" alt="cpv" />

          </button>

          <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

            <span className="text-[#061237] font-semibold whitespace-nowrap">CPM</span>
            <Image src={arrowdown} className="size-4" alt="cpm" />

          </button>
          
         
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
          <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

            <span className="text-[#061237] font-semibold whitespace-nowrap">Video views</span>
            <Image src={arrowdown} className="size-4" alt="video view" />

          </button>
          <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

            <span className="text-[#061237] font-semibold whitespace-nowrap">Traffic</span>
            <Image src={arrowdown} className="size-4" alt="video view" />

          </button>
         

          {/* Third rows */}
         
          <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

            <span className="text-[#061237] font-semibold whitespace-nowrap">CPV</span>
            <Image src={arrowdown} className="size-4" alt="video view" />

          </button>

          <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

            <span className="text-[#061237] font-semibold whitespace-nowrap">CPV</span>
            <Image src={arrowdown} className="size-4" alt="video view" />

          </button>
          
         
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

          <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

          <span className="text-[#061237] font-semibold whitespace-nowrap">Traffic</span>
         <Image src={arrowdown} className="size-4" alt="video view" />

        </button>

        <button className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] w-[150px] h-[52px] px-4 ">

       <span className="text-[#061237] font-semibold whitespace-nowrap">CPM</span>
       <Image src={arrowdown} className="size-4" alt="video view" />

        </button>


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