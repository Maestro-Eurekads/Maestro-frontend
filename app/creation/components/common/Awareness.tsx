import React from "react";
import Image from "next/image";
import speaker from "../../../../public/mdi_megaphone.svg";
import facebook from "../../../../public/facebook.svg";
import youtube from "../../../../public/youtube.svg";
import instagram from "../../../../public/ig.svg";
import quantcast from "../../../../public/quantcast.svg"; 
import trade from "../../../../public/TheTradeDesk.svg"; 
import AwarenessEdit from "./AwarenessEdit";

const socialMedia = [
  { id: 1, name: "Facebook", icon: facebook, link: "https://www.facebook.com" },
  { id: 2, name: "Instagram", icon: instagram },
  { id: 3, name: "Youtube", icon: youtube },
  { id: 4, name: "CPV" },
  { id: 5, name: "CPV" },
  { id: 6, name: "CPV" },
  { id: 7, name: "Awareness" },
  { id: 8, name: "Video view" },
  { id: 9, name: "Video view" }
];


const displayMedia = [
    { id: 1, name: "The TradeDesk", icon: trade },
    { id: 2, name: "QuantCast", icon: quantcast },
    { id: 3, name: "CPV" },
    { id: 4, name: "CPV" },
    { id: 5, name: "View view" },
    { id: 6, name: "Video view" },
   
  ];



const Awareness = ({edit}) => {
  return (
    <div className="mt-6 bg-gray-100 p-6 gap-8 rounded-lg">
      {/* Header */}
      {!edit && (
      <div className="flex items-center gap-4">
        <Image src={speaker} alt="Awareness icon" className="w-6 h-6" />
        <p className="text-black font-bold text-md">Awareness</p>
      </div>)}

      {edit ? <AwarenessEdit /> : <div className="mt-6 flex flex-col md:flex-row gap-8">
        {/* Social Media Section (Left) */}
        <div className="w-full md:w-1/2">
          <h2 className="text-black font-bold text-md mb-4">Social Media</h2>
          <div className="grid grid-cols-3 grid-rows-3 gap-4">
            {socialMedia.map((item) => (
              <a
                key={item.id}
                onClick={() => window.open(item.link, '_blank')}
                className="flex bg-white px-4 py-3 rounded-md border border-gray-200 items-center gap-2"
              >
                {item.icon && <Image src={item.icon} alt={item.name} className="size-5" />}
                <p className="text-black text-center text-md">{item.name}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Display Network Section (Right) */}
        <div className="w-full md:w-1/2">
          <h2 className="text-black font-bold text-md mb-4">Display Network</h2>
          <div className="grid grid-cols-2 grid-rows-3 gap-4">
            {displayMedia.slice(0, 6).map((item) => (
              <a
                key={item.id}
                className="flex bg-white px-4 py-3 rounded-md border border-gray-200 justify-center items-center gap-2"
              >
                {item.icon && <Image src={item.icon} alt={item.name} className="size-5" />}
                <p className="text-black text-md text-center">{item.name}</p>
              </a>
            ))}
          </div>
        </div>
      </div>}
      {/* Content Layout */}
      
    </div>
  );
};

export default Awareness;