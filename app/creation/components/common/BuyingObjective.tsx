import React, { useState } from "react";
import Button from "./button";
import Awareness from "./Awareness";
import Consideration from "./Consideration";
import Conversion from "./Conversion";
import { Plus } from "lucide-react";

const stageComponents = {
  Awareness,
  Consideration,
  Conversion,
};

const BuyingObjective = () => {
  const [edit, setEdit] = useState(false);
  const [stages, setStages] = useState(["Awareness", "Consideration", "Conversion"]);
  const [savedStages, setSavedStages] = useState([...stages]); 

  // Function to add a stage
  const addStage = (stageName) => {
    if(!stages.includes(stageName)) {
      setStages((prevStages) => [...prevStages, stageName])
    }
  }

  // Function to remove a stage
  const removeStage = (stageName) => {
    setStages(stages.filter((stage) => stage !== stageName));
  };

  // Function to confirm changes
  const confirmChanges = () => {
    setSavedStages([...stages]); 
    setEdit(false); 
  };

  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-blue-500 justify-center items-center size-6">
            <span className="text-white font-bold">2</span>
          </div>
          <h1 className="text-blue-500 font-semibold text-base">
            Your buying objectives and types
          </h1>
        </div>
        
        {edit ? (
          <Button text="Confirm Changes" variant="secondary" onClick={confirmChanges} />
        ) : (
          <Button text="Edit" variant="primary" onClick={() => setEdit(true)} />
        )}
      </div>

      {/* Add Stage Buttons (Only in Edit Mode) */}
      {edit && (
        <div className="flex flex-wrap gap-2 mb-4">
          {["Awareness", "Consideration", "Conversion"].map((stage) => (
            !stages.includes(stage) && (
              <Button
                key={stage}
                text={`Add ${stage}`}
                icon={Plus}
                variant="primary"
                onClick={() => addStage(stage)}
              />
            )
          ))}
        </div>
      )}

      {/* Render Each Stage */}
      {stages.map((stage) => {
        const StageComponent = stageComponents[stage];
        return (
          <StageComponent key={stage} edit={edit} onDelete={() => removeStage(stage)} />
        );
      })}
    </div>
  );
};

export default BuyingObjective;
