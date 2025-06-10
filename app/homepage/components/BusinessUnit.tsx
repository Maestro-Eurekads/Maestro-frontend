"use client";

import React, { useState, useEffect } from "react";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import Image from "next/image";
import { MdOutlineCancel } from "react-icons/md";

const EditInput = ({
  placeholder,
  setInputs,
  label,
  setAlert,
}) => {
  const [fields, setFields] = useState([{ id: 1, text: "" }]);

  useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      businessUnits: fields.map((item) => item.text),
    }));
  }, [fields, setInputs]);

  // Handle adding a new field
  const handleAddField = () => {
    if (fields.length >= 5) {
      setAlert({
        variant: "warning",
        message: "Maximum 5 business units allowed",
        position: "bottom-right",
      });
      return;
    }

    if (!fields[fields.length - 1].text.trim()) {
      setAlert({
        variant: "error",
        message: "Business unit name cannot be empty",
        position: "bottom-right",
      });
      return;
    }

    setFields((prev) => [...prev, { id: prev.length + 1, text: "" }]);
  };

  // Handle removing a field
  const handleRemoveField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle clearing a field
  const handleClear = (index) => {
    setFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text: "" } : item))
    );
  };

  // Handle input change
  const handleInputChange = (index, text) => {
    setFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text } : item))
    );
  };

  return (
    <div className="relative w-full">
      <div className="mb-4">
        <label className="font-medium text-[15px] leading-5 text-gray-600">
          {label}
        </label>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={`mt-[8px] flex items-center px-4 py-2  h-[40px] border border-[#EFEFEF] rounded-[10px] ${index > 0 ? "ml-4 w-[85%]" : "w-full"}`}
          >
            <input
              type="text"
              className="w-full bg-transparent outline-none text-gray-600"
              placeholder={index === 0 ? "Business Level 2" : `Parameter ${index}`}
              value={field.text}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
            {fields.length > 1 && (
              <MdOutlineCancel
                size={18}
                color="red"
                onClick={() => handleRemoveField(index)}
                className="cursor-pointer"
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 mt-[8px]">
          <button
            onClick={handleAddField}
            className="flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
          >
            <Image src={blueSmallPlue} alt="add" />
            Add parameter
          </button>
        </div>
      </div>
    </div>
  );
};

const BusinessUnit = ({ setInputs, setAlert }) => {
  return (
    <div className="flex flex-col gap-4 mt-[20px]">
      <EditInput
        placeholder="Business Unit"
        setInputs={setInputs}
        setAlert={setAlert}
        label="Business level 1"
      />
    </div>
  );
};

export default BusinessUnit;


// "use client";

// import React from "react";
// import BusinessUnitGroup from "./BusinessUnitGroup";

// const BusinessUnit = ({ setInputs, setAlert }) => {
//   const [groups, setGroups] = React.useState([[]]);

//   // Sync groups to parent state
//   React.useEffect(() => {
//     setInputs((prev) => ({
//       ...prev,
//       businessUnits: groups,
//     }));
//   }, [groups]);

//   const updateGroup = (index, updatedValues) => {
//     setGroups((prev) => {
//       const newGroups = [...prev];
//       newGroups[index] = updatedValues;
//       return newGroups;
//     });
//   };

//   const addGroup = () => {
//     setGroups((prev) => [...prev, [""]]);
//   };

//   const removeGroup = (index) => {
//     setGroups((prev) => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 ">
//       {groups?.map((group, index) => (
//         <BusinessUnitGroup
//           key={index}
//           label={`Business Level ${index + 1}`}
//           initial={group}
//           onUpdate={(updated) => updateGroup(index, updated)}
//           onRemove={groups?.length > 1 ? () => removeGroup(index) : null}
//           setAlert={setAlert}
//         />
//       ))}
//       <button
//         className="mt-12 flex items-center justify-center px-6 py-3 w-[76px] h-[40px] bg-[#061237] rounded-lg font-semibold text-[14px] leading-[19px] text-white"
//         onClick={addGroup}>
//         Add
//       </button>
//     </div>
//   );
// };

// export default BusinessUnit;
