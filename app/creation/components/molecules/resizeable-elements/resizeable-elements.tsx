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




