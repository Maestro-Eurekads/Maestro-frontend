

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import { MdOutlineCancel } from "react-icons/md";


const RenderParameterLevel = ({ param, indices, level, onAddSub, onChange, onRemove }) => {
  const canAddSubParameters = level < 4;
  const indentClass = 'ml-6'; // Same indentation for all levels

  return (
    <div className="relative">
      {/* Sub-parameters with extended vertical line */}
      {param.subParameters && param.subParameters.length > 0 && (
        <div className={`relative mt-2 pl-4 ${indentClass} before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-[#3175FF] before:translate-x-[-1px]`}>
          {param.subParameters.map((sub, sIndex) => (
            <div
              key={`${indices.join('-')}-${sIndex}`}
              className="relative mb-2 before:content-[''] before:absolute before:left-[-16px] before:top-[20px] before:w-4 before:h-0.5 before:bg-[#3175FF]"
            >
              {/* Sub-parameter input */}
              <div className="flex items-center px-4 py-2 h-[40px] border border-[#EFEFEF] rounded-[10px] bg-white mb-2">
                <input
                  type="text"
                  className="w-full bg-transparent outline-none text-gray-600"
                  placeholder={`Add sub-parameter ${sIndex + 1} (Level ${level + 1})`}
                  value={sub.name}
                  onChange={(e) => onChange([...indices, sIndex], e.target.value)}
                />
                <MdOutlineCancel
                  size={18}
                  color="red"
                  onClick={() => onRemove([...indices, sIndex])}
                  className="cursor-pointer"
                />
              </div>

              {/* Recursively render deeper levels */}
              <RenderParameterLevel
                param={sub}
                indices={[...indices, sIndex]}
                level={level + 1}
                onAddSub={onAddSub}
                onChange={onChange}
                onRemove={onRemove}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add sub-parameter button */}
      {canAddSubParameters && (
        <button
          onClick={() => onAddSub(indices)}
          className={`mt-2 flex items-center gap-1 text-[#3175FF] font-semibold text-[14px] ${indentClass}`}
        >
          <Image src={blueSmallPlue} alt="add" />
          Add sub-parameter {param.subParameters.length + 1} (Level {level + 1})
        </button>
      )}
    </div>
  );
};

const EditInput = ({ setInputs, label, setAlert, clientName }) => {
  const [title, setTitle] = useState(clientName || "");
  const [parameters, setParameters] = useState([]);

  useEffect(() => {
    setTitle(clientName || "");
  }, [clientName]);

  // Sync with parent
  useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      businessUnits: {
        title,
        parameters: parameters.map((param) => ({
          name: param.name,
          subParameters: param.subParameters,
        })),
      },
    }));
  }, [title, parameters, setInputs]);

  const handleAddParameter = () => {
    if (
      parameters.length > 0 &&
      !parameters[parameters.length - 1].name.trim()
    ) {
      setAlert({
        variant: "error",
        message: "Parameter name cannot be empty",
        position: "bottom-right",
      });
      return;
    }

    setParameters((prev) => [...prev, { name: "", subParameters: [] }]);
  };

  const handleRemoveParameter = (index) => {
    setParameters(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleParameterChange = (index, value) => {
    setParameters(prev => {
      const updated = [...prev];
      updated[index].name = value;
      return updated;
    });
  };

  // Generic function to add sub-parameter at any level
  const handleAddSubParameter = (indices) => {
    const updated = [...parameters];
    let current = updated;

    // Navigate to the correct level
    for (let i = 0; i < indices.length - 1; i++) {
      current = current[indices[i]].subParameters;
    }

    const targetIndex = indices[indices.length - 1];
    const targetParam = current[targetIndex];

    if (!targetParam.name.trim()) {
      setAlert({
        variant: "error",
        message: "Please enter the parameter name first",
        position: "bottom-right",
      });
      return;
    }

    // Remove the validation that prevents adding sub-parameters when the last one is empty
    // This validation was causing the false error message

    targetParam.subParameters.push({ name: "", subParameters: [] });
    setParameters(updated);
  };

  // Generic function to handle changes at any level
  const handleSubChange = (indices, value) => {
    setParameters(prev => {
      const updated = [...prev];
      let current = updated;

      // Navigate to the correct level
      for (let i = 0; i < indices.length - 1; i++) {
        current = current[indices[i]].subParameters;
      }

      current[indices[indices.length - 1]].name = value;
      return updated;
    });
  };

  // Generic function to remove sub-parameter at any level
  const handleRemoveSub = (indices) => {
    setParameters(prev => {
      const updated = [...prev];
      let current = updated;

      // Navigate to the parent level
      for (let i = 0; i < indices.length - 1; i++) {
        current = current[indices[i]].subParameters;
      }

      current.splice(indices[indices.length - 1], 1);
      return updated;
    });
  };

  return (
    <div className="relative w-full">
      {/* Title input */}
      <label className="font-medium text-[15px] leading-5 text-gray-600">
        {label}
      </label>
      <div className="mt-2 px-4 py-2 h-[40px] border border-[#EFEFEF] rounded-[10px] bg-white flex items-center">
        <input
          type="text"
          className="w-full bg-transparent outline-none text-gray-600"
          placeholder="Client Architecture"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Parameters */}
      <div className="relative mt-2 ml-4 border-l-2 border-dashed border-[#3175FF] pl-4">
        {parameters.map((param, index) => (
          <div key={index} className="mb-4 relative">
            {/* Horizontal connector from main line to parameter */}
            <div className="absolute left-[-16px] top-[20px] w-4 h-0.5 bg-[#3175FF]" />

            {/* Parameter input */}
            <div className="flex items-center px-4 py-2 h-[40px] border border-[#EFEFEF] rounded-[10px] bg-white">
              <input
                type="text"
                className="w-full bg-transparent outline-none text-gray-600"
                placeholder={`Add parameter ${index + 1} (Level 1)`}
                value={param.name}
                onChange={(e) => handleParameterChange(index, e.target.value)}
              />
              <MdOutlineCancel
                size={18}
                color="red"
                onClick={() => handleRemoveParameter(index)}
                className="cursor-pointer"
              />
            </div>

            {/* Render nested sub-parameters */}
            <RenderParameterLevel
              param={param}
              indices={[index]}
              level={1}
              onAddSub={handleAddSubParameter}
              onChange={handleSubChange}
              onRemove={handleRemoveSub}
            />
          </div>
        ))}
      </div>

      {/* Add parameter button */}
      <div className="flex items-center gap-2 mt-3 ml-1">
        <button
          onClick={handleAddParameter}
          className="flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
        >
          <Image src={blueSmallPlue} alt="add" />
          Add parameter {parameters.length + 1}
        </button>
      </div>
    </div>
  );
};
const BusinessUnit = ({ setInputs, setAlert, clientName }) => {
  return (
    <div className="flex flex-col gap-4 mt-[20px]">
      <EditInput
        setInputs={setInputs}
        setAlert={setAlert}
        clientName={clientName}
        label="Client Architecture"
      />
    </div>
  );
};

export default BusinessUnit;
