import React from "react";
import Image from "next/image";
import facebook from "../../../../public/facebook.svg";
import instagram from "../../../../public/ig.svg";
import quantcast from "../../../../public/quantcast.svg";
import trade from "../../../../public/TheTradeDesk.svg";
import table from "../../../../public/tabler_zoom-filled.svg";
import google from "../../../../public/Google.svg";
import ConsiderationEdit from "./ConsiderationEdit";

const socialMedia = [
  { id: 1, name: "Facebook", icon: facebook, link: "https://www.facebook.com" },
  { id: 2, name: "Instagram", icon: instagram },
  { id: 3, name: "CPM" },
  { id: 4, name: "CPM" },
  { id: 5, name: "Traffic" },
  { id: 6, name: "Traffic" },
];

const displayMedia = [
  { id: 1, name: "The TradeDesk", icon: trade },
  { id: 2, name: "QuantCast", icon: quantcast },
  { id: 3, name: "CPV" },
  { id: 4, name: "CPV" },
  { id: 5, name: "View view" },
  { id: 6, name: "Traffic" },
];

const searchMedia = [
  { id: 1, name: "Google", icon: google },
  { id: 2, name: "CPM" },
  { id: 3, name: "CPM" },
];

const Consideration = ({ edit }) => {
  return (
    <div className="mt-6 bg-gray-100 p-6 rounded-lg">
      {/* Header */}
      
      {!edit && (
        <div className="flex items-center gap-4">
        <Image src={table} alt="Consideration icon" className="size-4" />
        <p className="text-black font-bold text-md">Consideration</p>
      </div>

      )}
    
      

      {/* Content Layout */}
      {edit ? (
        <ConsiderationEdit />
      ) : (
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          {/* Social Media Section (Left) */}
          <div className="w-full md:w-1/3">
            <h2 className="text-black font-bold text-md mb-4">Social Media</h2>
            <div className="grid grid-cols-2 grid-rows-2 gap-4">
              {socialMedia.map((item) => (
                <a
                  key={item.id}
                  onClick={() => item.link && window.open(item.link, '_blank')}
                  className="flex bg-white px-4 py-3 rounded-md border border-gray-200 items-center gap-2"
                >
                  {item.icon && <Image src={item.icon} alt={item.name} className="size-4" />}
                  <p className="text-black text-center text-md">{item.name}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Display Network Section (Right) */}
          <div className="w-full md:w-1/2">
            <h2 className="text-black font-bold text-md mb-4">Display Network</h2>
            <div className="grid grid-cols-2 grid-rows-2 gap-4">
              {displayMedia.slice(0, 6).map((item) => (
                <a
                  key={item.id}
                  className="flex bg-white px-4 py-3 rounded-md border border-gray-200 justify-center items-center gap-2"
                >
                  {item.icon && <Image src={item.icon} alt={item.name} className="size-4" />}
                  <p className="text-black text-md text-center">{item.name}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Search Engine Section */}
          <div className="w-full md:w-1/5">
            <h2 className="text-black font-bold text-md mb-4">Search Engines</h2>
            <div className="grid grid-cols-1 grid-rows-3 gap-4">
              {searchMedia.slice(0, 3).map((item) => (
                <a
                  key={item.id}
                  className="flex bg-white px-4 py-3 rounded-md border border-gray-200 justify-center items-center gap-2"
                >
                  {item.icon && <Image src={item.icon} alt={item.name} className="size-4" />}
                  <p className="text-black text-md text-center">{item.name}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consideration;
