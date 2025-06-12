"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import { MdOutlineCancel } from "react-icons/md";

const EditInput = ({ setInputs, label, setAlert }) => {
  const [title, setTitle] = useState(""); // Business level 1
  const [parameters, setParameters] = useState([]); // Business level 2

  // Sync with parent
  useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      sports: {
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
    const updated = [...parameters];
    updated.splice(index, 1);
    setParameters(updated);
  };

  const handleParameterChange = (index, value) => {
    const updated = [...parameters];
    updated[index].name = value;
    setParameters(updated);
  };

  const handleAddSubParameter = (index) => {
    const param = parameters[index];

    if (!param.name.trim()) {
      setAlert({
        variant: "error",
        message: "Please enter the parameter name first",
        position: "bottom-right",
      });
      return;
    }

    if (
      param.subParameters.length > 0 &&
      !param.subParameters[param.subParameters.length - 1].trim()
    ) {
      setAlert({
        variant: "error",
        message: "Sub-parameter cannot be empty",
        position: "bottom-right",
      });
      return;
    }

    const updated = [...parameters];
    updated[index].subParameters.push("");
    setParameters(updated);
  };

  const handleSubChange = (pIndex, sIndex, value) => {
    const updated = [...parameters];
    updated[pIndex].subParameters[sIndex] = value;
    setParameters(updated);
  };

  const handleRemoveSub = (pIndex, sIndex) => {
    const updated = [...parameters];
    updated[pIndex].subParameters.splice(sIndex, 1);
    setParameters(updated);
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
          placeholder="business level 2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Parameters */}
      {parameters.map((param, index) => (
        <div key={index} className="mb-4">
          {/* Parameter input */}
          <div className="mt-3 flex items-center px-4 py-2 h-[40px] border border-[#EFEFEF] rounded-[10px] w-full">
            <input
              type="text"
              className="w-full bg-transparent outline-none text-gray-600"
              placeholder={`Add parameter ${index + 1}`}
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

          {/* Sub-parameters */}
          {param?.subParameters?.map((sub, sIndex) => (
            <div
              key={sIndex}
              className="ml-4 mt-2 flex items-center px-4 py-2 h-[40px] w-[85%] border border-[#EFEFEF] rounded-[10px]"
            >
              <input
                type="text"
                className="w-full bg-transparent outline-none text-gray-600"
                placeholder={`Add sub-parameter ${sIndex + 1}`}
                value={sub}
                onChange={(e) =>
                  handleSubChange(index, sIndex, e.target.value)
                }
              />
              <MdOutlineCancel
                size={18}
                color="red"
                onClick={() => handleRemoveSub(index, sIndex)}
                className="cursor-pointer"
              />
            </div>
          ))}

          {/* Add sub-parameter button */}
          <button
            onClick={() => handleAddSubParameter(index)}
            className="ml-4 mt-2 flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
          >
            <Image src={blueSmallPlue} alt="add" />
            Add sub-parameter {param?.subParameters?.length + 1}
          </button>
        </div>
      ))}

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

const SportDropdown = ({ setInputs, setAlert }) => {
  return (
    <div className="flex flex-col gap-4 mt-[20px]">
      <EditInput
        setInputs={setInputs}
        setAlert={setAlert}
        label="Business level 2"
      />
    </div>
  );
};

export default SportDropdown;
