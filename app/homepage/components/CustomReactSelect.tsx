"use client";
import Select, {
  type StylesConfig,
  components,
  type Props,
} from "react-select";
import { ChevronDown } from "lucide-react";

// Define the option type
export type SelectOption = {
  value: string;
  label: string;
  isDisabled?: boolean;
};

// Extend the react props
export interface CustomSelectProps extends Props<SelectOption, false> {
  error?: string;
  label?: string;
  className?: string;
}

export function CustomSelect({
  required,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  isDisabled = false,
  className = "",
  error,
  label,
  ...props
}: CustomSelectProps) {
  // Custom styles to match our UI
  const customStyles: StylesConfig<SelectOption, false> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: error ? "#ef4444" : state.isFocused ? "#d1d5db" : "#d1d5db",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(209, 213, 219, 0.5)"
        : "none",
      borderRadius: "0.375rem",
      padding: "1px",
      "&:hover": {
        borderColor: error ? "#ef4444" : "#9ca3af",
      },
      minHeight: "38px",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.375rem",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.6)",
      marginTop: "8px",
      border: "1px solid #e5e7eb",
      zIndex: 20,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#f3f4f6"
        : state.isFocused
          ? "#f9fafb"
          : "white",
      color: state.isDisabled ? "#9ca3af" : "#111827",
      fontWeight: state.isSelected ? "500" : "400",
      padding: "8px 12px",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      "&:active": {
        backgroundColor: "#f3f4f6",
      },
    }),
    placeholder: (provided, state) => ({
      ...provided,
      color:
        state.selectProps.menuIsOpen || state.isFocused || state.selectProps.inputValue
          ? "#A0AEC0"
          : "#6b7280",
      fontStyle:
        state.selectProps.menuIsOpen || state.isFocused || state.selectProps.inputValue
          ? "italic"
          : "normal",
      transition: "color 0.2s ease",
    }),
    singleValue: (provided, state) => {
      const isOpenWithoutTyping =
        state.selectProps.menuIsOpen && !state.selectProps.inputValue;

      return {
        ...provided,
        color: isOpenWithoutTyping ? "#A0AEC0" : "#111827",
        fontStyle: isOpenWithoutTyping ? "italic" : "normal",
        transition: "color 0.2s ease, font-style 0.2s ease",
      };
    },
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: "#6b7280",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0)",
      transition: "transform 0.2s ease",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 8px",
    }),
  };

  // Custom dropdown indicator (chevron)
  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown className="h-4 w-4" />
      </components.DropdownIndicator>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}

      <Select
        required={required}
        options={options}
        value={value}
        onChange={onChange as any}
        placeholder={placeholder}
        isDisabled={isDisabled}
        styles={customStyles}
        components={{ DropdownIndicator }}
        className="react-select-container"
        classNamePrefix="react-select"
        isSearchable={true}
        data-testid="custom-select"
        {...props}
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
