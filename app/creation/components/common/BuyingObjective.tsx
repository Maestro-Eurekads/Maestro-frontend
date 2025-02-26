import React, { useState } from "react";
import Button from "./button";
import Awareness from "./Awareness";
import Consideration from "./Consideration";
import Conversion from "./Conversion";
import { Plus, Trash, UserRoundSearch, X } from "lucide-react";
import YoutubeIcon from "../../../../public/youtube.svg"
import LinkedinIcon from "../../../../public/linkedin.svg"
import TiktokIcon from "../../../../public/tictok.svg"
import TwitterIcon from "../../../../public/x.svg"
import Select, { components } from "react-select";
import Image from "next/image";

const buyObjectiveOptions = [
  { value: "awareness", label: "Awareness" },
  { value: "traffic", label: "Traffic" },
  { value: "purchase", label: "Purchase" }
];

const buyTypeOptions = [
  { value: "cpm", label: "CPM" },
  { value: "cpv", label: "CPV" }
];

// Updated ChannelSelector with react‑select and icons
const options = [
  { 
    value: "TikTok", 
    label: "TikTok", 
    icon: <Image src={TiktokIcon} alt="TikTok" width={16} height={16} className="cursor-pointer font-bold size-5" />
  },
  { 
    value: "Youtube", 
    label: "Youtube", 
    icon: <Image src={YoutubeIcon} alt="Youtube" width={16} height={16} className="font-bold size-5" />
  },
  { 
    value: "Twitter/X", 
    label: "Twitter/X", 
    icon: <Image src={TwitterIcon} alt="Twitter" width={16} height={16} className="cursor-pointer font-bold size-5" />
  }, 
  { 
    value: "Linkedin", 
    label: "Linkedin", 
    icon: <Image src={LinkedinIcon} alt="LinkedIn" width={16} height={16} className="cursor-pointer font-bold size-5" />
  },
];

const IconOption = (props) => (
  <components.Option {...props}>
    <div style={{ display: "flex", alignItems: "center" }}>
      {props.data.icon && <span style={{ marginRight: 8 }}>{props.data.icon}</span>}
      <span>{props.data.label}</span>
    </div>
  </components.Option>
);

const SingleValue = ({ children, ...props }) => (
  <components.SingleValue {...props}>
    <div style={{ display: "flex", alignItems: "center" }}>
      {props.data.icon && <span style={{ marginRight: 8 }}>{props.data.icon}</span>}
      <span>{props.data.label}</span>
    </div>
  </components.SingleValue>
);

const ChannelSelector = ({ channelName }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [selectedBuyObjective, setSelectedBuyObjective] = useState(null);
  const [selectedBuyType, setSelectedBuyType] = useState(null);

  const handleClearSelection = () => {
    if (["TikTok", "Youtube", "Twitter/X", "Linkedin"].includes(selectedOption.value)) {
      setSelectedOption(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!showSelect ? (
        <Button
          text="Add Channel"
          variant="primary"
          className="bg-blue-500 text-white"
          onClick={() => setShowSelect(true)}
        />
      ) : (
        <>
          <div className="relative">
            <Select
              options={options}
              components={{ 
                Option: IconOption,
                SingleValue
              }}
              value={selectedOption}
              onChange={(option) => {
                setSelectedOption(option);
              }}
              placeholder="Select channel"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "white",
                  padding: "8px 8px",
                  border: "2px solid #D1D5DB",
                  borderRadius: "0.8rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }),
              }}
            />
            {selectedOption && (
              <button
                onClick={handleClearSelection}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1  hover:bg-gray-100 rounded-full"
              >
                <X size={16} className="text-white bg-black" />
              </button>
            )}
          </div>
          
          {selectedOption && (
            <>
              <Select
                options={buyObjectiveOptions}
                value={selectedBuyObjective}
                onChange={setSelectedBuyObjective}
                placeholder="Buy Objective"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                    padding: "4px",
                    border: "2px solid #D1D5DB",
                    borderRadius: "0.8rem",
                    cursor: "pointer",
                  }),
                }}
              />

              <Select
                options={buyTypeOptions}
                value={selectedBuyType}
                onChange={setSelectedBuyType}
                placeholder="Buy Type"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                    padding: "4px",
                    border: "2px solid #D1D5DB",
                    borderRadius: "0.8rem",
                    cursor: "pointer",
                  }),
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

const stageComponents = {
  Awareness,
  Consideration,
  Conversion,
};

const BuyingObjective = () => {
  const [edit, setEdit] = useState(false);
  const [stages, setStages] = useState([
    "Awareness",
    "Consideration",
    "Conversion",
  ]);
  const [savedStages, setSavedStages] = useState([...stages]);

  // State for the two-step Loyalty flow
  const [isLoyalty, setIsLoyalty] = useState(false);
  const [showLoyaltyField, setShowLoyaltyField] = useState(false);

  // Add a new stage
  const addStage = (stageName) => {
    if (!stages.includes(stageName)) {
      setStages((prevStages) => [...prevStages, stageName]);
    }
  };

  // Remove an existing stage
  const removeStage = (stageName) => {
    setStages(stages.filter((stage) => stage !== stageName));
  };

  // Confirm changes to stages
  const confirmChanges = () => {
    setSavedStages([...stages]);
    setEdit(false);
  };

  // Loyalty button handler
  const handleLoyaltyButtonClick = () => {
    if (!isLoyalty) {
      setIsLoyalty(true);
    } else {
      setShowLoyaltyField(true);
    }
  };

  // Delete the loyalty stage
  const handleDeleteLoyaltyStage = () => {
    setIsLoyalty(false);
    setShowLoyaltyField(false);
  };

  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
            <span className="text-white font-bold">2</span>
          </div>
          <h1 className="text-blue-500 font-semibold text-base">
            Your buying objectives and types
          </h1>
        </div>
        {edit ? (
          <Button
            text="Confirm Changes"
            variant="secondary"
            onClick={confirmChanges}
          />
        ) : (
          <Button text="Edit" variant="primary" onClick={() => setEdit(true)} />
        )}
      </div>

      {/* Loyalty / Add new Stage Button (visible only in edit mode) */}
      {edit && !isLoyalty && (
        <div className="mb-4">
          <Button
            text="Add new Stage"
            variant="primary"
            onClick={handleLoyaltyButtonClick}
          />
        </div>
      )}

      {/* Loyalty Container with Gray Background (visible in edit mode when loyalty is active) */}
      {edit && isLoyalty && (
        <div className="bg-gray-200 p-4 rounded-lg mt-4">
          <div className="flex justify-between items-center mb-4">
            {/* Loyalty Button */}
            <Button
              text="Loyalty"
              icon={UserRoundSearch}
              className="!rounded-md my-4"
              variant="danger"
              onClick={handleLoyaltyButtonClick}
            />
            {/* Delete Loyalty Stage Button */}
            <Button
              text="Delete this stage"
              icon={Trash}
              variant="danger"
              onClick={handleDeleteLoyaltyStage}
            />
          </div>
          {showLoyaltyField && (
            <div className="flex gap-4">
              {["Social Media", "Display network", "Search engine"].map(
                (channel) => (
                  <div key={channel} className="flex flex-col items-center">
                    <span className="mb-2 font-medium">{channel}</span>
                    {/* Use the updated ChannelSelector */}
                    <ChannelSelector channelName={channel} />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Additional Stage Buttons (Only in Edit Mode) */}
      {edit && (
        <div className="flex flex-wrap gap-2 mb-4">
          {["Awareness", "Consideration", "Conversion"].map(
            (stage) =>
              !stages.includes(stage) && (
                <Button
                  key={stage}
                  text={`Add ${stage}`}
                  icon={Plus}
                  variant="primary"
                  onClick={() => addStage(stage)}
                />
              )
          )}
        </div>
      )}

      {/* Render Each Stage */}
      {stages.map((stage) => {
        const StageComponent = stageComponents[stage];
        return (
          <StageComponent
            key={stage}
            edit={edit}
            onDelete={() => removeStage(stage)}
          />
        );
      })}
    </div>
  );
};

export default BuyingObjective;
