// "use client";
// import React, { useState, useEffect } from "react";
// import mdEdit from "../../../public/line-md_edit.svg";
// import blueSmallPlue from "../../../public/blueSmallPlue.svg";
// import Image from "next/image";
// import { MdOutlineCancel } from "react-icons/md";

// const EditInput = ({
//   placeholder,
//   inputs,
//   setInputs,
//   businessList,
//   setBusinessList,
//   label,
//   setAlert, // Pass setAlert for notifications
// }: {
//   placeholder: string;
//   inputs: any;
//   setInputs: any;
//   businessList: string[];
//   setBusinessList: any;
//   label?: string;
//   setAlert: any;
// }) => {
//   const [fields, setFields] = useState<{ id: number; text: string }[]>([
//     { id: 1, text: "" },
//   ]);

//   // Sync fields with global state
//   useEffect(() => {
//     setInputs((prev: any) => ({
//       ...prev,
//       businessUnits: fields.map((item) => item.text),
//     }));
//   }, [fields, setInputs]);

//   // Handle adding a new field 
//   const handleAddField = () => {
//     const trimmedUnit = inputs.businessUnits.trim().toLowerCase();

//     if (!trimmedUnit) {
//       setAlert({
//         variant: "error",
//         message: "Business unit name cannot be empty",
//         position: "bottom-right",
//       });
//       return;
//     }

//     if (businessList.includes(trimmedUnit)) {
//       setAlert({
//         variant: "warning",
//         message: "Business unit already exists",
//         position: "bottom-right",
//       });
//       return;
//     }

//     if (businessList.length >= 5) {
//       setAlert({
//         variant: "warning",
//         message: "Maximum 5 business units allowed",
//         position: "bottom-right",
//       });
//       return;
//     }

//     setBusinessList([...businessList, trimmedUnit]);
//     setInputs((prevState) => ({
//       ...prevState,
//       businessUnits: "",
//     }));

//     setAlert({
//       variant: "success",
//       message: "Business unit added successfully",
//       position: "bottom-right",
//     });
//   };

//   // Handle removing a field
//   const handleRemoveSport = (sport) => {
//     const filteredEmails = businessList.filter((e) => e !== sport);
//     setBusinessList(filteredEmails);
//     setAlert({
//       variant: "info",
//       message: "Business Units removed",
//       position: "bottom-right",
//     });
//   };

//   // Handle clearing a field
//   const handleClear = () => {
//     setInputs((prevState) => ({
//       ...prevState,
//       businessUnits: "",
//     }));
//   };

//   // Handle input change
//   const handleInputChange = (text: string) => {
//     setInputs((prevState) => ({
//       ...prevState,
//       businessUnits: text,
//     }));
//   };

//   return (
//     <div className="relative w-full">
//       <div className="mb-4">
//         <label className="font-medium text-[15px] leading-5 text-gray-600">
//           {label || placeholder}
//         </label>
//         <div className="mt-[8px] flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px]">
//           <input
//             type="text"
//             className="w-full bg-transparent outline-none text-gray-600"
//             placeholder={placeholder}
//             value={inputs.businessUnits}
//             onChange={(e) => handleInputChange(e.target.value)}
//           />
//           <span className="ml-auto text-gray-500 cursor-pointer">
//             <Image src={mdEdit} alt="edit" />
//           </span>
//         </div>

//         <div className="flex items-center gap-2 mt-[8px]">
//           {/* Add button */}
//           <button
//             onClick={handleAddField}
//             className="flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
//           >
//             <Image src={blueSmallPlue} alt="add" />
//             Add parameter
//           </button>

//           {/* Clear button */}
//           {inputs.businessUnits && (
//             <button
//               onClick={handleClear}
//               className="text-gray-500 font-semibold text-[14px]"
//             >
//               Clear
//             </button>
//           )}
//         </div>
//         {businessList.map((sport) => (
//           <div key={sport} className="flex justify-between items-center">
//             <p className="capitalize">{sport}</p>
//             <MdOutlineCancel
//               size={18}
//               color="red"
//               onClick={() => handleRemoveSport(sport)}
//               className="cursor-pointer"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const BusinessUnit = ({
//   inputs,
//   setInputs,
//   businessList,
//   setBusinessList,
//   setAlert,
// }: {
//   inputs: any;
//   setInputs: any;
//   businessList: any;
//   setBusinessList: any;
//   setAlert: any;
// }) => {
//   return (
//     <div className="flex flex-col gap-4 mt-[20px]">
//       <EditInput
//         placeholder="Business Unit"
//         inputs={inputs}
//         setInputs={setInputs}
//         businessList={businessList}
//         setBusinessList={setBusinessList}
//         setAlert={setAlert}
//         label="Business level 2"
//       />
//     </div>
//   );
// };

// export default BusinessUnit;



"use client";

import React, { useState, useEffect } from "react";
import mdEdit from "../../../public/line-md_edit.svg";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import Image from "next/image";
import { MdOutlineCancel } from "react-icons/md";

const EditInput = ({
  placeholder,
  inputs,
  setInputs,
  businessList,
  setBusinessList,
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
          {label || placeholder}
        </label>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="mt-[8px] flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px]"
          >
            <input
              type="text"
              className="w-full bg-transparent outline-none text-gray-600"
              placeholder={placeholder}
              value={field.text}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
            <span className="ml-auto text-gray-500 cursor-pointer">
              <Image src={mdEdit} alt="edit" />
            </span>
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
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

const BusinessUnit = ({ inputs, setInputs, setAlert }) => {
  return (
    <div className="flex flex-col gap-4 mt-[20px]">
      <EditInput
        placeholder="Business Unit"
        inputs={inputs}
        setInputs={setInputs}
        businessList={inputs.businessUnits}
        setBusinessList={(newList) => setInputs({ ...inputs, businessUnits: newList })}
        setAlert={setAlert}
        label="Business level 2"
      />
    </div>
  );
};

export default BusinessUnit;
