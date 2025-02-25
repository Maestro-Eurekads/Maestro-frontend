"use client";
import { BsFillMegaphoneFill } from "react-icons/bs";
import { TbZoomFilled, TbCreditCardFilled } from "react-icons/tb";
import ResizeableBar from "../../atoms/drag-timeline/drag-timeline";
import Image from 'next/image';
import facebook from '../../../../../public/social/facebook.svg';
import youtube from '../../../../../public/social/youtube.svg';
import thetradedesk from '../../../../../public/social/thetradedesk.svg';
import quantcast from '../../../../../public/social/quantcast.svg';
import google from '../../../../../public/social/google.svg';
import ig from '../../../../../public/social/ig.svg';
import { useRef, useState } from "react";
import { useDateRange } from "../../../../../src/date-range-context";
import DraggableChannel from "../../../../../components/DraggableChannel";
import whiteplus from '../../../../../public/white-plus.svg';
import reddelete from '../../../../../public/red-delete.svg';
import ResizableChannels from "./ResizableChannels";


const ResizeableElements = ({ dateList }) => {


  const [openChannel, setOpenChannel] = useState(false);
  const [show, setShow] = useState(false);


  const channels = [
    { icon: facebook, name: "Facebook", color: "#0866FF", bg: "#F0F6FF" },
    { icon: ig, name: "Instagram", color: "#C13584", bg: "#FEF1F8" },
    { icon: youtube, name: "YouTube", color: "#FF0000", bg: "#FFF0F0" },
    { icon: thetradedesk, name: "TheTradeDesk", color: "#0099FA", bg: "#F0F9FF" },
    { icon: quantcast, name: "Quantcast", color: "#000000", bg: "#F7F7F7" },
    { icon: google, name: "Google", color: "#4285F4", bg: "#F1F6FE" },
  ];


  const funnels = [
    {
      startWeek: 3,
      endWeek: 10,
      label: "Campaign 1",
      bg: "#3175FF",
      description: "Awareness",
      Icon: < BsFillMegaphoneFill />
    },
    {
      startWeek: 4,
      endWeek: 13,
      label: "Campaign 2",
      bg: "#0ABF7E",
      description: "Consideration",
      Icon: < TbZoomFilled />
    },
    {
      startWeek: 2,
      endWeek: 9,
      label: "Campaign 2",
      bg: "#ff9037",
      description: "Conversion",
      Icon: <TbCreditCardFilled />
    },
  ];


  return (
    <div
      className="w-full min-h-[494px] relative pb-5"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `calc(100% / ${dateList.length}) 100%`,
      }}
    >
      {
        funnels.map(({ startWeek, endWeek, bg, description, Icon }, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${dateList.length}, 1fr)`,
            }}
          >
            {/* shadow-sm */}
            {/* border-[rgba(0,0,0,0.1)]  */}
            <div
              className="flex flex-col mt-6  rounded-[10px] p-4 justify-between"
              style={{
                gridColumnStart: startWeek,
                gridColumnEnd: endWeek + 1,
              }}
            >
              <DraggableChannel
                openChannel={openChannel}
                bg={bg}
                description={description}
                setShow={setShow}
                setOpenChannel={setOpenChannel}
                Icon={Icon} dateList={dateList} />

              {/* Mapped Draggable Dropdowns */}
              {
                openChannel && (
                  <div>
                    {show &&
                      <button className="channel-btn-blue mt-[12px] mb-[12px]">
                        <Image src={whiteplus} alt="whiteplus" />
                        <p>Add new channel</p>
                      </button>}
                    <ResizableChannels channels={channels} />
                  </div>
                )
              }

            </div>
          </div>
        ))
      }
    </div>

  );
};

export default ResizeableElements;



{/* <div className="relative w-full h-14 flex">
  <div
    className="top-0 w-5 h-full bg-opacity-80 bg-black cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
    style={{}}
    onMouseDown={() => handleMouseDown(0, "left")}
  >
    <MdDragHandle className="rotate-90" />
  </div>

  <div
    className="top-0 h-full flex justify-between items-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
    style={{
      width: 400,
      backgroundColor: "#C13584",
    }}>
    <div />
    <div className="flex items-center gap-3" onClick={() => setOpenChannel(!openChannel)}>
      {/* <Icon className="text-lg text-white" /> */}
//       <span className="font-medium">hhh</span>
//       <MdOutlineKeyboardArrowDown />
//     </div>

//     <button className="channel-btn" onClick={() => {
//       setShow(prev => !prev);
//       setOpenChannel(true);
//     }}>
//       <p>Add new channel</p>
//     </button>
//   </div>

//   <div
//     className="  top-0 right-[-5] w-5 h-full bg-opacity-80 bg-black cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
//     style={{}}
//     onMouseDown={() => handleMouseDown(0, "right")} >
//     <MdDragHandle className="rotate-90" />
//   </div>
// </div>  


//  <div className="open_channel_btn_container">
//                 {channels.map((channel, index) => (
//                   <div key={channel.name} className="relative w-full h-12">
//                     {/* Draggable Dropdown Item */}
//                     <div
//                       className="absolute top-0 h-full flex justify-center items-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
//                       style={{
//                         borderColor: channel.color,
//                         left: `${channelState[index]?.left || 0}px`,
//                         width: `${channelState[index]?.width || 150}px`,
//                         backgroundColor: channel.bg,
//                         color: channel.color,
//                         borderRadius: "10px",
//                       }}
//                     >
//                       <div className="flex items-center gap-3">
//                         <Image src={channel.icon} alt={channel.icon} />
//                         <span className="font-medium">{channel.name}</span>
//                       </div>
//                     </div>

//                     {/* Left Handle for Dropdown Item */}
//                     <div
//                       className="absolute top-0 w-5 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
//                       style={{
//                         left: `${channelState[index]?.left || 0}px`,
//                         backgroundColor: channel.color,
//                       }}
//                       onMouseDown={() => handleMouseDown(index, "left")}
//                     >
//                       <MdDragHandle className="rotate-90" />
//                     </div>

//                     {/* Right Handle for Dropdown Item */}
//                     <div
//                       className="absolute top-0 w-5 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
//                       style={{
//                         left: `${(channelState[index]?.left || 0) + (channelState[index]?.width || 150) - 5}px`,
//                         backgroundColor: channel.color,
//                       }}
//                       onMouseDown={() => handleMouseDown(index, "right")}
//                     >
//                       <MdDragHandle className="rotate-90" />
//                       <button className="delete-resizeableBar">
//                         {/* <Image src={reddelete} alt="reddelete" /> */}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

{/* Loop through funnels */ }
// {
//   funnels.map(({ startWeek, endWeek, label }, index) => (
//     <div
//       key={index}
//       style={{
//         display: "grid",
//         gridTemplateColumns: `repeat(${weeksCount}, 1fr)`,
//       }}
//     >
//       <div
//         className="flex flex-col min-h-[69px] bg-white border border-[rgba(0,0,0,0.1)] mt-6 shadow-sm rounded-[10px] p-4 justify-between"
//         style={{
//           gridColumnStart: startWeek,
//           gridColumnEnd: endWeek + 1,
//         }}
//       >
//         <div className="flex justify-between items-center">
//           <div>
//             <h3 className="text-[#061237] font-semibold text-[16px] leading-[22px]">
//               {label} - Running
//             </h3>
//             <p className="text-[#061237] font-medium text-[14px]">
//               250,000 €
//             </p>
//           </div>
//           {/* <button onClick={() => toggleShow(index)}>
//             {expanded[index] ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
//           </button> */}
//         </div>

//         {/* Expanded section */}
//         {/* {expanded[index] && (
//           <div>
//             {["Awareness", "Consideration", "Conversion"].map((section) => (
//               <div key={section}
//                 style={{
//                   display: 'grid',
//                   gridTemplateColumns: `repeat(${(endWeek + 1) - startWeek}, 1fr)`
//                 }}>
//                 <button
//                   onClick={() => toggleOpen(index, section)}
//                   className={`mt-5 w-full flex items-center rounded-[10px] text-[17px] font-[500] p-3 text-center ${section === "Awareness"
//                     ? "bg-[#3175FF]"
//                     : section === "Consideration"
//                       ? "bg-[#34A853]"
//                       : "bg-[#ff9037]"
//                     } text-white`}
//                   style={{
//                     gridColumnStart: 1,
//                     gridColumnEnd: ((endWeek + 1) - startWeek) + 1
//                   }}

//                 >
//                   <div className="flex items-center justify-center gap-3 flex-1">
//                     <span>
//                       {section === "Awareness"
//                         ? <BsFillMegaphoneFill />
//                         : section === "Consideration"
//                           ? <TbZoomFilled />
//                           : <TbCreditCardFilled />}

//                     </span>
//                     <span>{section}</span>
//                     <span>
//                       <FiChevronDown size={15} />
//                     </span>
//                   </div>
//                   <button className="justify-self-end px-3 py-[10px] text-[16px] font-[500] bg-white/25 rounded-[5px]">
//                     {section === "Awareness"
//                       ? "6,000 €"
//                       : section === "Consideration"
//                         ? "6,000 €"
//                         : "5,250 €"}
//                   </button>
//                 </button>


//               </div>
//             ))}
//           </div>
//         )} */}
//       </div>
//     </div>
//   ))
// }




// <div className="flex flex-col gap-y-6 select-none mt-3 ">
// <div
//   className="w-full min-h-[494px] relative pb-5"
//   style={{
//     backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
//     backgroundSize: `calc(100% / ${dateList.length}}) 100%`,
//   }}
// > 

{/* <ResizeableBar
        bg="#3175FF"
        description="Awareness"
        Icon={BsFillMegaphoneFill}
      />
      <ResizeableBar
        bg="#0ABF7E"
        description="Consideration"
        Icon={TbZoomFilled}
      />
      <ResizeableBar
        bg="#ff9037"
        description="Conversion"
        Icon={TbCreditCardFilled}
      /> */}
// </div>
