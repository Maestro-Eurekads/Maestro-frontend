"use client";
// import ResizeableBar from "../../atoms/drag-timeline/drag-timeline";
import Image from 'next/image';
import { useState } from "react";
import DraggableChannel from "../../../../../components/DraggableChannel";
import whiteplus from '../../../../../public/white-plus.svg';
import ResizableChannels from "./ResizableChannels";
import { useFunnelContext } from "../../../../utils/FunnelContextType";
import { channels, funnels } from "../../../../../components/data";
import AddNewChennelsModel from '../../../../../components/Modals/AddNewChennelsModel';


const ResizeableElements = ({ dateList }) => {
  const { funnelWidths } = useFunnelContext(); // Get width for all channels
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({}); // Track open state per channel
  const [isOpen, setIsOpen] = useState(false);

  const toggleChannel = (id: string) => {
    setOpenChannels((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle only the clicked channel
    }));
  };

  return (
    <div
      className="w-full min-h-[494px] relative pb-5"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `calc(100% / ${dateList.length}) 100%`,
      }}
    >
      {funnels.map(({ startWeek, endWeek, bg, description, Icon }, index) => {
        const channelWidth = funnelWidths[description] || 400;
        const isOpen = openChannels[description] || false; // Get open state by ID

        return (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${dateList.length}, 1fr)`,
            }}
          >
            <div
              className="flex flex-col mt-6 rounded-[10px] p-4 justify-between"
              style={{
                gridColumnStart: startWeek,
                gridColumnEnd: endWeek + 1,
              }}
            >
              <DraggableChannel
                id={description} // Use description as ID
                openChannel={isOpen} // Pass specific open state
                bg={bg}
                description={description}
                setIsOpen={setIsOpen}
                setOpenChannel={() => toggleChannel(description)} // Toggle only this channel
                Icon={Icon}
                dateList={dateList}
              />

              {isOpen && ( // Only show this if the specific channel is open
                <div>
                  {channelWidth < 350 && (
                    <button className="channel-btn-blue mt-[12px] mb-[12px]"
                      onClick={() => {
                        setIsOpen(true);
                      }}>
                      <Image src={whiteplus} alt="whiteplus" />
                      <p>Add new channel</p>
                    </button>
                  )}
                  <ResizableChannels channels={channels} parentId={description} />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <AddNewChennelsModel isOpen={isOpen} setIsOpen={setIsOpen} />
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
