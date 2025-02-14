import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
}) => {
  return (
    <div className="mb-4">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`select bg-white w-full max-w-xs border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${className}`}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
