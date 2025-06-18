"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import { MdOutlineCancel } from "react-icons/md";
import { toast } from "sonner";

const EditInput = ({
  setInputs,
  label,
  setAlert,
  initialData,
  isAgencyCreator,
}) => {
  const key = initialData?.key || "categories";
  const [title, setTitle] = useState(initialData?.title || "");
  const [parameters, setParameters] = useState(initialData?.parameters || []);

  useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      [key]: {
        title,
        parameters: parameters.map((param) => ({
          name: param.name,
          subParameters: param.subParameters,
        })),
      },
    }));
  }, [title, parameters, setInputs, key]);

  const handleAddParameter = () => {
    if (isAgencyCreator) {
      toast.error("You do not have permission to perform this action.");
      return;
    }

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
    if (isAgencyCreator) {
      toast.error("You do not have permission to perform this action.");
      return;
    }

    const updated = [...parameters];
    updated.splice(index, 1);
    setParameters(updated);
  };

  const handleParameterChange = (index, value) => {
    if (isAgencyCreator) {
      toast.error("You do not have permission to perform this action.");
      return;
    }

    const updated = [...parameters];
    updated[index].name = value;
    setParameters(updated);
  };

  const handleAddSubParameter = (index) => {
    if (isAgencyCreator) {
      toast.error("You do not have permission to perform this action.");
      return;
    }

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
    if (isAgencyCreator) {
      toast.error("You do not have permission to perform this action.");
      return;
    }

    const updated = [...parameters];
    updated[pIndex].subParameters[sIndex] = value;
    setParameters(updated);
  };

  const handleRemoveSub = (pIndex, sIndex) => {
    if (isAgencyCreator) {
      toast.error("You do not have permission to perform this action.");
      return;
    }

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
          placeholder="business level 3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isAgencyCreator}
        />
      </div>

      {/* Parameters */}
      {parameters.map((param, index) => (
        <div key={index} className="mb-4">
          <div className="mt-3 flex items-center px-4 py-2 h-[40px] border border-[#EFEFEF] rounded-[10px] ml-3">
            <input
              type="text"
              className="w-full bg-transparent outline-none text-gray-600"
              placeholder={`Add parameter ${index + 1}`}
              value={param.name}
              onChange={(e) => handleParameterChange(index, e.target.value)}
              disabled={isAgencyCreator}
            />
            <MdOutlineCancel
              size={18}
              color="red"
              onClick={() => handleRemoveParameter(index)}
              className="cursor-pointer"
            />
          </div>

          {param.subParameters.map((sub, sIndex) => (
            <div
              key={sIndex}
              className="ml-6 mt-2 flex items-center px-4 py-2 h-[40px] border border-[#EFEFEF] rounded-[10px]"
            >
              <input
                type="text"
                className="w-full bg-transparent outline-none text-gray-600"
                placeholder={`Add sub-parameter ${sIndex + 1}`}
                value={sub}
                onChange={(e) =>
                  handleSubChange(index, sIndex, e.target.value)
                }
                disabled={isAgencyCreator}
              />
              <MdOutlineCancel
                size={18}
                color="red"
                onClick={() => handleRemoveSub(index, sIndex)}
                className="cursor-pointer"
              />
            </div>
          ))}

          <button
            onClick={() => handleAddSubParameter(index)}
            className="ml-4 mt-2 flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
            disabled={isAgencyCreator}
          >
            <Image src={blueSmallPlue} alt="add" />
            Add sub-parameter {param.subParameters.length + 1}
          </button>
        </div>
      ))}

      <div className="flex items-center gap-2 mt-3 ml-1">
        <button
          onClick={handleAddParameter}
          className="flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
          disabled={isAgencyCreator}
        >
          <Image src={blueSmallPlue} alt="add" />
          Add parameter {parameters.length + 1}
        </button>
      </div>
    </div>
  );
};

const CategoryDropdownEdit = ({
  setInputs,
  setAlert,
  initialData,
  isAgencyCreator,
}) => {
  return (
    <div className="flex flex-col gap-4 mt-[20px]">
      <EditInput
        setInputs={setInputs}
        setAlert={setAlert}
        label="Business level 3"
        initialData={initialData}
        isAgencyCreator={isAgencyCreator}
      />
    </div>
  );
};

export default CategoryDropdownEdit;