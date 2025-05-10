import React from "react";
import Image from "next/image";
import AwarenessEdit from "./AwarenessEdit";
import { useCampaigns } from "../../../utils/CampaignsContext";
import speaker from "../../../../public/mdi_megaphone.svg";
import { getPlatformIcon } from "components/data";

const Awareness = ({
  edit,
  setEdit,
  onDelete,
  stageName,
  updatedData,
  setUpdatedData,
  handleLoyaltyButtonClick,
  handlePlatformSelect,
  handleDropDownSelection,
  stageData,
}) => {
  const { campaignFormData } = useCampaigns();

  return (
    <div className="mt-6 bg-gray-100 p-6 gap-8 rounded-lg">
      {/* Header */}
      {!edit && (
        <div className="flex items-center gap-4">
          <Image src={speaker} alt="Awareness icon" className="w-6 h-6" />
          <p className="text-black font-bold text-md">
            {stageName && stageName}
          </p>
        </div>
      )}

      {edit ? (
        // Pass the onDelete callback to AwarenessEdit
        <AwarenessEdit
          onDelete={onDelete}
          stageName={stageName}
          stageData={stageData}
          updatedData={updatedData}
          setUpdatedData={setUpdatedData}
          setEdit={setEdit}
          handleLoyaltyButtonClick={handleLoyaltyButtonClick}
          handlePlatformSelect={handlePlatformSelect}
          handleDropDownSelection={handleDropDownSelection}
        />
      ) : (
        <div className="mt-6 flex flex-col md:flex-row gap-8 overflow-x-auto w-full">
          {/* Social Media Section (Left) */}
          {[
            "social_media",
            "display_networks",
            "search_engines",
            "streaming",
            "mobile",
            "messaging",
            "in_game",
            "e_commerce",
            "broadcast",
            "print",
            "ooh",
          ]?.map((channel) => {
            if(stageData[channel]?.length === 0) return null;
            return (
              <div key={channel} className="shrink-0 w-full md:w-fit">
                <h2 className="text-black font-bold text-md mb-4 capitalize">
                  {channel?.replace("_", " ")}
                </h2>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    {stageData[channel].length > 0 &&
                      stageData[channel]?.map((item) => (
                        <a
                          key={item.platform_name}
                          // onClick={() => window.open(item.link, "_blank")}
                          className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 min-w-[150px]"
                        >
                          {getPlatformIcon(item.platform_name) && (
                            <Image
                              src={getPlatformIcon(item.platform_name)}
                              alt={item.platform_name}
                              className="size-4"
                            />
                          )}
                          <p className="text-black text-center text-md">
                            {item.platform_name}
                          </p>
                        </a>
                      ))}
                  </div>
                  <div className="flex items-center gap-4">
                    {stageData[channel].length > 0 &&
                      stageData[channel]?.map((item) => (
                        <a
                          key={item.platform_name}
                          // onClick={() => window.open(item.link, "_blank")}
                          className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 min-w-[150px]"
                        >
                          <p className="text-black text-center text-md">
                            {item.objective_type}
                          </p>
                        </a>
                      ))}
                  </div>
                  <div className="flex items-center gap-4">
                    {stageData[channel].length > 0 &&
                      stageData[channel]?.map((item) => (
                        <a
                          key={item.platform_name}
                          // onClick={() => window.open(item.link, "_blank")}
                          className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 min-w-[150px]"
                        >
                          <p className="text-black text-center text-md">
                            {item.buy_type}
                          </p>
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Content Layout */}
    </div>
  );
};

export default Awareness;
