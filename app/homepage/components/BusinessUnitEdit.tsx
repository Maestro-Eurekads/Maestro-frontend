
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import { MdOutlineCancel } from "react-icons/md";
import { toast } from "sonner";

const EditInput = ({ setInputs, label, setAlert, initialData, isAgencyCreator, setIsLevelChange }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [parameters, setParameters] = useState(() =>
    initialData?.parameters?.map(param => ({
      name: param.name,
      subParameters: [...param.subParameters],
    })) || []
  );


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
          placeholder="Client Architecture"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Parameters */}
      {/* Wrapper for hierarchy line from parent */}
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

            {/* Sub-parameters with extended vertical line */}
            <div className="relative ml-6 mt-2 pl-4 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-[#3175FF] before:translate-x-[-1px]">
              {param.subParameters.map((sub, sIndex) => (
                <div
                  key={sIndex}
                  className="relative flex items-center h-[45px] mb-2 px-4 border border-[#EFEFEF] rounded-[10px] bg-white before:content-[''] before:absolute before:left-[-16px] before:top-1/2 before:w-4 before:h-0.5 before:bg-[#3175FF]"
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
            </div>

            {/* Add sub-parameter button */}
            <button
              onClick={() => handleAddSubParameter(index)}
              className="ml-6 mt-2 flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
            >
              <Image src={blueSmallPlue} alt="add" />
              Add sub-parameter {param.subParameters.length + 1}
            </button>
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


const BusinessUnitEdit = ({ setInputs, setAlert, level1Options, initialData, isAgencyCreator, setIsLevelChange }) => {
  return (
    <div className="flex flex-col gap-4 mt-[20px]">
      <EditInput
        setInputs={setInputs}
        setAlert={setAlert}
        label="Client Architecture"
        initialData={initialData}
        isAgencyCreator={isAgencyCreator}
        setIsLevelChange={setIsLevelChange}
      />
    </div>
  );
};

export default BusinessUnitEdit;
