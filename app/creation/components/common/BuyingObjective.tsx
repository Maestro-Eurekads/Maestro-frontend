import React, { useState } from "react";
import Button from "./button";
import Awareness from "./Awareness";
import Consideration from "./Consideration";
import Conversion from "./Conversion";
import { Plus, Trash, UserRoundSearch } from "lucide-react";


// This component handles the channel selector behavior
const ChannelSelector = ({ channelName }) => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  // Options for the dropdown with their respective images
  const options = [
    { name: "TikTok"},
    { name: "Youtube"},
    { name: "Twitter/X"},
    { name: "Linkedin" },
  ];

  return (
    <div>
      {selectMode ? (
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="text-black bg-white border-2 border-gray-300 px-4 py-2 rounded-lg shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select channel
          </option>
          {options.map((option) => (
            <option key={option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      ) : (
        
        
        <Button
          text="Add select channel"
          variant="primary"
          onClick={() => setSelectMode(true)}
        />
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

  // State to handle the two-step Loyalty flow
  const [isLoyalty, setIsLoyalty] = useState(false);
  const [showLoyaltyField, setShowLoyaltyField] = useState(false);

  // Function to add a stage
  const addStage = (stageName) => {
    if (!stages.includes(stageName)) {
      setStages((prevStages) => [...prevStages, stageName]);
    }
  };

  // Function to remove a stage
  const removeStage = (stageName) => {
    setStages(stages.filter((stage) => stage !== stageName));
  };

  // Function to confirm changes
  const confirmChanges = () => {
    setSavedStages([...stages]);
    setEdit(false);
  };

  // Handler for the Loyalty/Stage button click
  const handleLoyaltyButtonClick = () => {
    if (!isLoyalty) {
      // First click: change button text to "Loyalty" and render container with gray background
      setIsLoyalty(true);
    } else {
      // Second click: reveal the loyalty channels field within the gray container
      setShowLoyaltyField(true);
    }
  };

  // Handler to delete the loyalty stage
  const handleDeleteLoyaltyStage = () => {
    // Reset the loyalty state
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

      {/* Loyalty Container with Gray Background (visible only in edit mode when loyalty is active) */}
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
            {/* Delete this stage Button */}
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
                    {/* Use the ChannelSelector component */}
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
