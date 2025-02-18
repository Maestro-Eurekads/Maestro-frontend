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

  // Default stages in order
  const [stages, setStages] = useState(["Awareness", "Consideration", "Conversion"]);

  // Function to add a new stage
  const addStage = (stageName) => {
    if (!stages.includes(stageName)) {
      setStages([...stages, stageName]);
    }
  };

  // Function to remove a stage
  const removeStage = (stageName) => {
    setStages(stages.filter((stage) => stage !== stageName));
  };

  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
      {/* Main objective header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-blue-500 justify-center items-center p-1">
            <span className="text-white font-bold">2</span>
          </div>
          <h1 className="text-blue-500 font-semibold text-base">
            Your buying objectives and types
          </h1>
        </div>
        {edit ? (
          <Button
            text="Confirm changes"
            variant="secondary"
            onClick={() => setEdit(false)}
          />
        ) : (
          <Button
            text="Edit"
            variant="primary"
            className="!rounded-md h-[52px] whitespace-nowrap px-4 py-2 text-sm"
            onClick={() => setEdit(true)}
          />
        )}
      </div>

      {/* Add Stages Buttons with "+" Icon */}
      {edit && (
        <div className="flex flex-wrap gap-2 mb-4">
          {["Awareness", "Consideration", "Conversion"].map((stage) => (
            !stages.includes(stage) && (
              <Button
                key={stage}
                text={`Add ${stage}`}
                icon={Plus} // This adds the "+" icon
                variant="primary"
                onClick={() => addStage(stage)}
              />
            )
          ))}
        </div>
      )}

      {/* Render Stages Dynamically */}
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
