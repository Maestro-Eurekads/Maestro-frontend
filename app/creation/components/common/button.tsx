'"use client"';

import React from "react";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";

interface ButtonProps {
  icon?: React.ElementType;
  text: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "tertiary";
  iconColor?: string;
  className?: string;
  image?: string; // URL for image
  iconPosition?: "start" | "end"; // Added to dynamically position the icon
  disabled?: boolean; // Added to enable or disable the button
  loading?: boolean; // Added to show loading state
}

const Button: React.FC<ButtonProps> = ({
  icon: Icon,
  text,
  onClick,
  variant = "primary",
  iconColor = "text-white",
  className = "",
  image,
  iconPosition = "start", // Default icon position
  disabled = false, // Default disabled state
  loading = false, // Default loading state
}) => {
  const baseStyles =
    "flex items-center justify-center gap-2 hover:cursor-pointer rounded-md h-[52px] text-white px-6 py-3 font-bold text-sm";
  const variantStyles = {
    primary:
      "bg-[#3175FF] px-8 py-3 h-[52px] whitespace-nowrap text-white text-lg font-medium rounded-md hover:opacity-90",
    secondary:
      "bg-black font-bold h-[52px] whitespace-nowrap hover:bg-gray-700 border border-black hover:text-white transition ease-out duration-200",
    tertiary:
      "bg-white font-bold h-[52px] whitespace-nowrap !text-black hover:bg-gray-700 border border-black hover:text-white transition ease-out duration-200",
    danger:
      "bg-[#FF5955] text-white whitespace-nowrap h-[52px] !rounded-full leading-wider border border-[#A7A7A7] font-bold hover:bg-orange-700 hover:text-white transition ease-out duration-200",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {iconPosition === "start" && Icon && (
        <Icon className={`size-4 ${iconColor}`} />
      )}
      {image && (
        <Image
          src={image}
          alt="button image"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      )}
      {loading ? (
        <center>
          <FaSpinner className="animate-spin" />
        </center>
      ) : (
        text
      )}
      {iconPosition === "end" && Icon && (
        <Icon className={`size-4 ${iconColor}`} />
      )}
    </button>
  );
};

export default Button;
