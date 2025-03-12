"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import speaker from "../../../public/mdi_megaphone.svg";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import checkmark from "../../../public/mingcute_check-fill.svg";
import facebook from "../../../public/facebook.svg";
import ig from "../../../public/ig.svg";
import youtube from "../../../public/youtube.svg";
import TheTradeDesk from "../../../public/TheTradeDesk.svg";
import Quantcast from "../../../public/quantcast.svg";
import orangecredit from "../../../public/orangecredit-card.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import Button from "./common/button";

const platformData = {
  "Social media": [
    { name: "Facebook", icon: facebook },
    { name: "Buy type" },
    { name: "Buy objective" },
    { name: "Instagram", icon: ig },
    { name: "Buy type" },
    { name: "Buy objective" },
    { name: "Youtube", icon: youtube },
    { name: "Buy type" },
    { name: "Buy objective" },
  ],
  "Display networks": [
    { name: "TheTradeDesk", icon: TheTradeDesk },
    { name: "Buy type" },
    { name: "Buy objective" },
    { name: "Quantcast", icon: Quantcast },
    { name: "Buy type" },
    { name: "Buy objective" },
  ],
};

const funnelStages = [
<<<<<<< HEAD
 {
  name: "Awareness",
  icon: speaker,
  status: "In progress",
  statusIsActive: true,
  platforms: {
   "Social media": [
    { name: "Facebook", icon: facebook },
    { name: "Buy type" },
    { name: "Buy objective" },
    { name: "Instagram", icon: ig },
    { name: "Buy type" },
    { name: "Buy objective" },
    { name: "Youtube", icon: youtube },
    { name: "Buy type" },
    { name: "Buy objective" },
   ],
   "Display networks": [
    { name: "TheTradeDesk", icon: TheTradeDesk },
    { name: "Buy type" },
    { name: "Buy objective" },
    { name: "Quantcast", icon: Quantcast },
    { name: "Buy type" },
    { name: "Buy objective" },
   ],
=======
  {
    name: "Awareness",
    icon: speaker,
    status: "In progress",
    statusIsActive: true,
    platforms: platformData,
  },
  {
    name: "Consideration",
    icon: tablerzoomfilled,
    status: "Not started",
    statusIsActive: false,
    platforms: platformData,
  },
  {
    name: "Conversion",
    icon: orangecredit,
    status: "Not started",
    statusIsActive: false,
    platforms: platformData,
>>>>>>> fa160ed9f8c7f3372893c69ac3e0244f32b4126a
  },
 },
 {
  name: "Consideration",
  icon: tablerzoomfilled,
  status: "Not started",
  statusIsActive: false,
  platforms: {},
 },
 {
  name: "Conversion",
  icon: orangecredit,
  status: "Not started",
  statusIsActive: false,
  platforms: {},
 },
];

const ObjectiveSelection = () => {
<<<<<<< HEAD
 const [openItems, setOpenItems] = useState({ Awareness: true });
 const [statuses, setStatuses] = useState(funnelStages.map((stage) => stage.status));
 const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
 const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
 const [isEditable, setIsEditable] = useState<{ [key: string]: boolean }>({});
 const [previousSelectedOptions, setPreviousSelectedOptions] = useState<{ [key: string]: string }>({});
 const [selectedNetworks, setSelectedNetworks] = useState<Set<string>>(new Set());
 const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
 const [validatedPlatforms, setValidatedPlatforms] = useState<Set<string>>(new Set());
=======
  const [openItems, setOpenItems] = useState({ Awareness: true });
  const [statuses, setStatuses] = useState(funnelStages.map((stage) => stage.status));
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [isEditable, setIsEditable] = useState<{ [key: string]: boolean }>({});
  const [previousSelectedOptions, setPreviousSelectedOptions] = useState<{ [key: string]: string }>({});
  const [selectedNetworks, setSelectedNetworks] = useState<{ [key: string]: Set<string> }>({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set()
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<{ [key: string]: Set<string> }>({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set()
  });
  const [validatedPlatforms, setValidatedPlatforms] = useState<{ [key: string]: Set<string> }>({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set()
  });
>>>>>>> fa160ed9f8c7f3372893c69ac3e0244f32b4126a

 // Toggle expand/collapse for a stage
 const toggleItem = (stage: string) => {
  setOpenItems((prev) => ({
   ...prev,
   [stage]: !prev[stage],
  }));
 };

 // Toggle the dropdown for dropdown items (only active when not completed)
 const toggleDropdown = (platformKey: string) => {
  setDropdownOpen({ [platformKey]: !dropdownOpen[platformKey] });
 };

<<<<<<< HEAD
 // Handle selecting an option from the dropdown
 const handleSelectOption = (platformKey: string, option: string, category: string) => {
  setSelectedOptions((prev) => ({
   ...prev,
   [platformKey]: option,
  }));

  // Extract platform name from the key
  const platformIndex = parseInt(platformKey.split('-')[2]);
  const platform = funnelStages[0].platforms[category][Math.floor(platformIndex / 3) * 3];

  if (platform && platform.name) {
   setSelectedPlatforms(prev => {
    const newSet = new Set(prev);
    newSet.add(platform.name);
    return newSet;
   });
  }

  setSelectedNetworks(prev => {
   const newSet = new Set(prev);
   newSet.add(category);
   return newSet;
  });

  setDropdownOpen((prev) => ({
   ...prev,
   [platformKey]: false,
  }));
 };

 // Mark the stage as validated/completed
 const handleValidate = (index: number) => {
  const updatedStatuses = [...statuses];
  updatedStatuses[index] = "Completed";
  setStatuses(updatedStatuses);
  setIsEditable((prev) => ({ ...prev, [funnelStages[index].name]: true }));

  // Store validated platforms
  const validatedPlatformsSet = new Set<string>();
  Object.entries(selectedOptions).forEach(([key]) => {
   const [_, category, platformIndex] = key.split('-');
   const platform = funnelStages[0].platforms[category][Math.floor(parseInt(platformIndex) / 3) * 3];
   if (platform && platform.name && hasCompletePlatformSelection(platform.name, category)) {
    validatedPlatformsSet.add(platform.name);
   }
  });
  setValidatedPlatforms(validatedPlatformsSet);

  // Store the current selected options before validation
  setPreviousSelectedOptions(selectedOptions);

  toast.success("Stage completed successfully! 🎉");

  if (navigator.vibrate) {
   navigator.vibrate(300);
  }
 };

 // Check if a platform has both buy type and objective selected
 const hasCompletePlatformSelection = (platformName: string, category: string) => {
  const platforms = funnelStages[0].platforms[category];
  const platformIndex = platforms.findIndex(p => p.name === platformName);
  if (platformIndex === -1) return false;

  const baseIndex = platformIndex;
  const buyTypeKey = `Awareness-${category}-${baseIndex + 1}`;
  const buyObjectiveKey = `Awareness-${category}-${baseIndex + 2}`;

  return selectedOptions[buyTypeKey] && selectedOptions[buyObjectiveKey];
 };

 // Check if at least one platform has both selections
 const hasMinimumBuySelections = () => {
  if (selectedNetworks.size === 0) return false;

  for (const network of selectedNetworks) {
   const platforms = funnelStages[0].platforms[network];
   for (let i = 0; i < platforms.length; i += 3) {
    const platform = platforms[i];
    if (platform.icon && hasCompletePlatformSelection(platform.name, network)) {
     return true;
    }
   }
  }
  return false;
 };

 // Return dropdown options based on field name
 const getDropdownOptions = (platform: { name: string }) => {
  if (platform.name === "Buy type") {
   return ["CPM", "CPV"];
  }
  if (platform.name === "Buy objective") {
   return ["Awareness", "Video views", "Traffic"];
  }
  return [];
 };

 const renderCompletedPlatform = (platform: any, idx: number, category: string) => {
  const baseIndex = idx * 3;
  const buyTypeKey = `Awareness-${category}-${baseIndex + 1}`;
  const buyObjectiveKey = `Awareness-${category}-${baseIndex + 2}`;

  if (!validatedPlatforms.has(platform.name)) {
   return null;
  }

  return (
   <div key={idx} className="flex flex-col gap-4">
    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg">
     <Image src={platform.icon} className="size-4" alt={platform.name} />
     <p className="text-sm font-medium text-[#061237] ">{platform.name}</p>
=======
  // Handle selecting an option from the dropdown
  const handleSelectOption = (platformKey: string, option: string, category: string, stageName: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [platformKey]: option,
    }));
    
    // Extract platform name from the key
    const platformIndex = parseInt(platformKey.split('-')[2]);
    const platform = funnelStages[0].platforms[category][Math.floor(platformIndex / 3) * 3];
    
    if (platform && platform.name) {
      setSelectedPlatforms(prev => ({
        ...prev,
        [stageName]: new Set([...prev[stageName], platform.name])
      }));
    }
    
    setSelectedNetworks(prev => ({
      ...prev,
      [stageName]: new Set([...prev[stageName], category])
    }));
    
    setDropdownOpen((prev) => ({
      ...prev,
      [platformKey]: false,
    }));
  };

  // Mark the stage as validated/completed
  const handleValidate = (index: number) => {
    const stageName = funnelStages[index].name;
    const updatedStatuses = [...statuses];
    updatedStatuses[index] = "Completed";
    setStatuses(updatedStatuses);
    setIsEditable((prev) => ({ ...prev, [stageName]: true }));

    // Store validated platforms
    const validatedPlatformsSet = new Set<string>();
    Object.entries(selectedOptions).forEach(([key]) => {
      const [stage, category, platformIndex] = key.split('-');
      if (stage === stageName) {
        const platform = funnelStages[0].platforms[category][Math.floor(parseInt(platformIndex) / 3) * 3];
        if (platform && platform.name && hasCompletePlatformSelection(platform.name, category, stageName)) {
          validatedPlatformsSet.add(platform.name);
        }
      }
    });

    setValidatedPlatforms(prev => ({
      ...prev,
      [stageName]: validatedPlatformsSet
    }));

    // Store the current selected options before validation
    setPreviousSelectedOptions(selectedOptions);

    toast.success("Stage completed successfully! 🎉");

    if (navigator.vibrate) {
      navigator.vibrate(300);
    }
  };

  // Check if a platform has both buy type and objective selected
  const hasCompletePlatformSelection = (platformName: string, category: string, stageName: string) => {
    const platforms = funnelStages[0].platforms[category];
    const platformIndex = platforms.findIndex(p => p.name === platformName);
    if (platformIndex === -1) return false;

    const baseIndex = platformIndex;
    const buyTypeKey = `${stageName}-${category}-${baseIndex + 1}`;
    const buyObjectiveKey = `${stageName}-${category}-${baseIndex + 2}`;

    return selectedOptions[buyTypeKey] && selectedOptions[buyObjectiveKey];
  };

  // Check if at least one platform has both selections
  const hasMinimumBuySelections = (stageName: string) => {
    if (!selectedNetworks[stageName] || selectedNetworks[stageName].size === 0) return false;

    for (const network of selectedNetworks[stageName]) {
      const platforms = funnelStages[0].platforms[network];
      for (let i = 0; i < platforms.length; i += 3) {
        const platform = platforms[i];
        if (platform.icon && hasCompletePlatformSelection(platform.name, network, stageName)) {
          return true;
        }
      }
    }
    return false;
  };

  // Return dropdown options based on field name
  const getDropdownOptions = (platform: { name: string }) => {
    if (platform.name === "Buy type") {
      return ["CPM", "CPV"];
    }
    if (platform.name === "Buy objective") {
      return ["Awareness", "Video views", "Traffic"];
    }
    return [];
  };

  const renderCompletedPlatform = (platform: any, idx: number, category: string, stageName: string) => {
    const baseIndex = idx * 3;
    const buyTypeKey = `${stageName}-${category}-${baseIndex + 1}`;
    const buyObjectiveKey = `${stageName}-${category}-${baseIndex + 2}`;

    if (!validatedPlatforms[stageName].has(platform.name)) {
      return null;
    }

    return (
      <div key={idx} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg">
          <Image src={platform.icon} className="size-4" alt={platform.name} />
          <p className="text-sm font-medium text-[#061237] ">{platform.name}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="px-4 py-2 bg-white border text-center whitespace-nowrap border-gray-300 rounded-lg">
            {selectedOptions[buyTypeKey] || "Buy type"}
          </div>
          <div className="px-4 py-2 bg-white whitespace-nowrap border text-center border-gray-300 rounded-lg">
            {selectedOptions[buyObjectiveKey] || "Buy objective"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
      <Toaster position="top-right" reverseOrder={false} />
      {funnelStages.map((stage, stageIndex) => (
        <div key={stageIndex} className="w-full">
          {/* Stage Header */}
          <div
            className="flex items-center justify-between px-6 py-4 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
            onClick={() => toggleItem(stage.name)}
          >
            <div className="flex items-center gap-4">
              <Image src={stage.icon} className="size-4" alt={stage.name} />
              <p className="text-sm font-semibold text-[#061237] whitespace-nowrap">{stage.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {statuses[stageIndex] === "Completed" ? (
                <>
                  <Image
                    className="w-5 h-5 rounded-full p-1 bg-green-500"
                    src={checkmark}
                    alt="Completed"
                  />
                  <p className="text-green-500 font-semibold text-base">Completed</p>
                </>
              ) : stage.statusIsActive ? (
                <p className="text-[#3175FF] font-semibold text-base whitespace-nowrap">{statuses[stageIndex]}</p>
              ) : (
                <p className="text-[#061237] opacity-50 text-base whitespace-nowrap">Not started</p>
              )}
            </div>
            <div>
              {openItems[stage.name] ? (
                <Image src={up} alt="collapse" />
              ) : (
                <Image src={down2} alt="expand" />
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {openItems[stage.name] && (
            <div className="flex items-start flex-col gap-8 p-6 bg-white border border-gray-300 rounded-b-lg">
              {statuses[stageIndex] === "Completed" ? (
                <div className="flex flex-col md:flex-row w-full gap-12">
                  {Array.from(selectedNetworks[stage.name] || []).map(network => (
                    <div key={network} className="flex-1">
                      <h3 className="text-xl font-semibold text-[#061237] mb-6">{network}</h3>
                      <div className="flex flex-row gap-8">
                        {stage.platforms[network]
                          .filter((p) => p.icon)
                          .map((platform, idx) => renderCompletedPlatform(platform, idx, network, stage.name))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Original grid layout for non-completed state
                Object.entries(stage.platforms).map(([category, platforms]) => (
                  <div key={category} className="w-full md:flex flex-col items-start gap-6 md:w-3/5">
                    <h3 className="text-xl font-semibold text-[#061237]">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
                      {platforms.map((platform, pIndex) => {
                        const platformKey = `${stage.name}-${category}-${pIndex}`;
                        if (platform.name === "Buy type" || platform.name === "Buy objective") {
                          return (
                            <div key={pIndex} className="relative w-full">
                              <div
                                className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
                                onClick={() => toggleDropdown(platformKey)}
                              >
                                <p className="text-sm font-medium text-[#061237]">
                                  {selectedOptions[platformKey] || platform.name}
                                </p>
                                <Image src={down2} alt="dropdown" />
                              </div>
                              {dropdownOpen[platformKey] && (
                                <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg transition-transform transform hover:scale-105 z-10">
                                  <ul>
                                    {getDropdownOptions(platform).map((option, i) => (
                                      <li
                                        key={i}
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleSelectOption(platformKey, option, category, stage.name)}
                                      >
                                        {option}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={pIndex}
                              className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg"
                            >
                              {platform.icon && (
                                <Image src={platform.icon} className="size-4" alt={platform.name} />
                              )}
                              <p className="text-base font-medium text-[#061237]">
                                {platform.name}
                              </p>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                ))
              )}
              {/* Validate Button (Only when not completed) */}
              {statuses[stageIndex] !== "Completed" && (
                <div className="flex justify-end mt-6 w-full">
                  <Button
                    text="Validate"
                    variant="primary"
                    onClick={() => handleValidate(stageIndex)}
                    disabled={!hasMinimumBuySelections(stage.name)}
                  />
                </div>
              )}
              {/* Edit Button (Only when completed) */}
              {statuses[stageIndex] === "Completed" && (
                <div className="flex justify-end mt-2 w-full">
                  <Button
                    text="Edit"
                    variant="primary"
                    className="bg-blue-500"
                    onClick={() => {
                      setIsEditable((prev) => ({ ...prev, [stage.name]: false }));
                      setSelectedOptions(previousSelectedOptions); // Restore previous selections
                      setStatuses((prev) => {
                        const updated = [...prev];
                        updated[stageIndex] = "In progress"; // Set status back to "In progress"
                        return updated;
                      });
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
>>>>>>> fa160ed9f8c7f3372893c69ac3e0244f32b4126a
    </div>
    <div className="flex flex-col gap-2">
     <div className="px-4 py-2 bg-white border text-center whitespace-nowrap border-gray-300 rounded-lg">
      {selectedOptions[buyTypeKey] || "Buy type"}
     </div>
     <div className="px-4 py-2 bg-white whitespace-nowrap border text-center border-gray-300 rounded-lg">
      {selectedOptions[buyObjectiveKey] || "Buy objective"}
     </div>
    </div>
   </div>
  );
 };

 return (
  <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
   <Toaster position="top-right" reverseOrder={false} />
   {funnelStages.map((stage, stageIndex) => (
    <div key={stageIndex} className="w-full">
     {/* Stage Header */}
     <div
      className="flex items-center justify-between px-6 py-4 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
      onClick={() => toggleItem(stage.name)}
     >
      <div className="flex items-center gap-4">
       <Image src={stage.icon} className="size-4" alt={stage.name} />
       <p className="text-sm font-semibold text-[#061237] whitespace-nowrap">{stage.name}</p>
      </div>
      <div className="flex items-center gap-2">
       {statuses[stageIndex] === "Completed" ? (
        <>
         <Image
          className="w-5 h-5 rounded-full p-1 bg-green-500"
          src={checkmark}
          alt="Completed"
         />
         <p className="text-green-500 font-semibold text-base">Completed</p>
        </>
       ) : stage.statusIsActive ? (
        <p className="text-[#3175FF] font-semibold text-base whitespace-nowrap">{statuses[stageIndex]}</p>
       ) : (
        <p className="text-[#061237] opacity-50 text-base whitespace-nowrap">Not started</p>
       )}
      </div>
      <div>
       {openItems[stage.name] ? (
        <Image src={up} alt="collapse" />
       ) : (
        <Image src={down2} alt="expand" />
       )}
      </div>
     </div>

     {/* Expanded Content */}
     {openItems[stage.name] && (
      <div className="flex items-start flex-col gap-8 p-6 bg-white border border-gray-300 rounded-b-lg">
       {stage.name === "Awareness" && statuses[stageIndex] === "Completed" ? (
        <div className="flex flex-col md:flex-row w-full gap-12">
         {Array.from(selectedNetworks).map(network => (
          <div key={network} className="flex-1">
           <h3 className="text-xl font-semibold text-[#061237] mb-6">{network}</h3>
           <div className="flex flex-row gap-8">
            {stage.platforms[network]
             .filter((p) => p.icon)
             .map((platform, idx) => renderCompletedPlatform(platform, idx, network))}
           </div>
          </div>
         ))}
        </div>
       ) : (
        // Original grid layout for non-completed state
        Object.entries(stage.platforms).map(([category, platforms]) => (
         <div key={category} className="w-full md:flex flex-col items-start gap-6 md:w-3/5">
          <h3 className="text-xl font-semibold text-[#061237]">{category}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
           {platforms.map((platform, pIndex) => {
            const platformKey = `${stage.name}-${category}-${pIndex}`;
            if (platform.name === "Buy type" || platform.name === "Buy objective") {
             return (
              <div key={pIndex} className="relative w-full">
               <div
                className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
                onClick={() => toggleDropdown(platformKey)}
               >
                <p className="text-sm font-medium text-[#061237]">
                 {selectedOptions[platformKey] || platform.name}
                </p>
                <Image src={down2} alt="dropdown" />
               </div>
               {dropdownOpen[platformKey] && (
                <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg transition-transform transform hover:scale-105 z-10">
                 <ul>
                  {getDropdownOptions(platform).map((option, i) => (
                   <li
                    key={i}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleSelectOption(platformKey, option, category)}
                   >
                    {option}
                   </li>
                  ))}
                 </ul>
                </div>
               )}
              </div>
             );
            } else {
             return (
              <div
               key={pIndex}
               className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg"
              >
               {platform.icon && (
                <Image src={platform.icon} className="size-4" alt={platform.name} />
               )}
               <p className="text-base font-medium text-[#061237]">
                {platform.name}
               </p>
              </div>
             );
            }
           })}
          </div>
         </div>
        ))
       )}
       {/* Validate Button (Only for Awareness stage when not completed) */}
       {stage.name === "Awareness" && statuses[stageIndex] !== "Completed" && (
        <div className="flex justify-end mt-6 w-full">
         <Button
          text="Validate"
          variant="primary"
          onClick={() => handleValidate(stageIndex)}
          disabled={!hasMinimumBuySelections()}
         />
        </div>
       )}
       {/* Edit Button (Only for Awareness stage when completed) */}
       {stage.name === "Awareness" && statuses[stageIndex] === "Completed" && (
        <div className="flex justify-end mt-2 w-full">
         <Button
          text="Edit"
          variant="primary"
          className="bg-blue-500"
          onClick={() => {
           setIsEditable((prev) => ({ ...prev, [stage.name]: false }));
           setSelectedOptions(previousSelectedOptions); // Restore previous selections
           setStatuses((prev) => {
            const updated = [...prev];
            updated[stageIndex] = "In progress"; // Set status back to "In progress"
            return updated;
           });
          }}
         />
        </div>
       )}
      </div>
     )}
    </div>
   ))}
  </div>
 );
};

export default ObjectiveSelection;