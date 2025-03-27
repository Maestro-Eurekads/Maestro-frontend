import React, { useState } from "react";
import Button from "./button";
import { X, ChevronDown } from "lucide-react";
import YoutubeIcon from "../../../../public/youtube.svg";
import LinkedinIcon from "../../../../public/linkedin.svg";
import TiktokIcon from "../../../../public/tictok.svg";
import TwitterIcon from "../../../../public/x.svg";
import Select, { components } from "react-select";
import Image from "next/image";

const buyObjectiveOptions = [
  { value: "awareness", label: "Awareness" },
  { value: "traffic", label: "Traffic" },
  { value: "purchase", label: "Purchase" },
];

const buyTypeOptions = [
  { value: "CPM", label: "CPM" },
  { value: "CPV", label: "CPV" },
];

// Updated ChannelSelector with react‑select and icons
const options = [
  {
    value: "TikTok",
    label: "TikTok",
    icon: (
      <Image
        src={TiktokIcon}
        alt="TikTok"
        width={16}
        height={16}
        className="cursor-pointer font-bold size-5"
      />
    ),
  },
  {
    value: "YouTube",
    label: "YouYube",
    icon: (
      <Image
        src={YoutubeIcon}
        alt="Youtube"
        width={16}
        height={16}
        className="font-bold size-5"
      />
    ),
  },
  {
    value: "Twitter/X",
    label: "Twitter/X",
    icon: (
      <Image
        src={TwitterIcon}
        alt="Twitter"
        width={16}
        height={16}
        className="cursor-pointer font-bold size-5"
      />
    ),
  },
  {
    value: "LinkedIn",
    label: "LinkedIn",
    icon: (
      <Image
        src={LinkedinIcon}
        alt="LinkedIn"
        width={16}
        height={16}
        className="cursor-pointer font-bold size-5"
      />
    ),
  },
];

const IconOption = (props) => (
  <components.Option {...props}>
    <div style={{ display: "flex", alignItems: "center" }}>
      {props.data.icon && (
        <span style={{ marginRight: 8 }}>{props.data.icon}</span>
      )}
      <span>{props.data.label}</span>
    </div>
  </components.Option>
);

const CustomControl = (props) => {
  const { hasValue, selectProps, innerProps, innerRef, children } = props;

  if (hasValue) {
    const selectedValue = selectProps.value;
    return (
      <div
        className="flex items-center justify-between p-2 bg-white border-2 border-[#D1D5DB] rounded-[0.8rem] cursor-pointer min-w-[200px]"
        ref={innerRef}
        {...innerProps}
      >
        <div className="flex items-center flex-1">
          <div className="flex-shrink-0">{selectedValue.icon}</div>
          <span className="ml-2 truncate">{selectedValue.label}</span>
        </div>
        <div className="flex-shrink-0 ml-2">
          <X
            size={14}
            className="text-white rounded-full bg-black cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              selectProps.onChange(null);
              selectProps.onMenuClose();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <components.Control {...props}>
      <div className="flex items-center justify-between w-full">
        {children}
        <ChevronDown size={20} />
      </div>
    </components.Control>
  );
};

export const ChannelSelector = ({
  stageName,
  channelName,
  handlePlatformSelect,
  handleDropDownSelection,
  hideSelectAfterSelection,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [selectedBuyObjective, setSelectedBuyObjective] = useState(null);
  const [selectedBuyType, setSelectedBuyType] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      {!showSelect ? (
        <Button
          text="Add Channel"
          variant="primary"
          className="bg-blue-500 text-white"
          onClick={() => setShowSelect(true)}
        />
      ) : (
        <>
          <div className="relative">
            <Select
              options={options}
              components={{
                Option: IconOption,
                Control: CustomControl,
                IndicatorSeparator: () => null,
                DropdownIndicator: () => null,
              }}
              value={selectedOption}
              onChange={(option) => {
                handlePlatformSelect(stageName, channelName, option?.value);
                setSelectedOption(option);
                if (hideSelectAfterSelection) {
                  setShowSelect(false);
                  setSelectedOption("");
                }
              }}
              placeholder="Select channel"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "white",
                  padding: "8px 8px",
                  border: "2px solid #D1D5DB",
                  borderRadius: "0.8rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  minWidth: "200px",
                }),
                valueContainer: (provided) => ({
                  ...provided,
                  padding: 0,
                }),
              }}
              isClearable={false}
            />
          </div>

          {selectedOption && (
            <>
              <Select
                options={buyObjectiveOptions}
                value={selectedBuyObjective}
                onChange={(option) => {
                  handleDropDownSelection(
                    stageName,
                    channelName,
                    selectedOption?.value,
                    "objective_type",
                    option?.value
                  );
                  setSelectedBuyObjective(option);
                }}
                placeholder="Buy Objective"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                    padding: "4px",
                    border: "2px solid #D1D5DB",
                    borderRadius: "0.8rem",
                    cursor: "pointer",
                    minWidth: "200px",
                  }),
                }}
              />

              <Select
                options={buyTypeOptions}
                value={selectedBuyType}
                onChange={(option) => {
                  handleDropDownSelection(
                    stageName,
                    channelName,
                    selectedOption?.value,
                    "buy_type",
                    option?.value
                  );
                  setSelectedBuyType(option);
                }}
                placeholder="Buy Type"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                    padding: "4px",
                    border: "2px solid #D1D5DB",
                    borderRadius: "0.8rem",
                    cursor: "pointer",
                    minWidth: "200px",
                  }),
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
