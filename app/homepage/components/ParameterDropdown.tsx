// components/ParameterDropdown.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import Image from "next/image";
import down from "../../../public/down.svg";
import { toast } from "react-hot-toast";
import axios from "axios";

const ParameterDropdown = ({
	label,
	parameters,
	selectedFilters,
	handleSelect,
	isDisabled = false,
	clientId,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [expanded, setExpanded] = useState({});
	const [newParamName, setNewParamName] = useState("");
	const [newParamParent, setNewParamParent] = useState(null);
	const dropdownRef = useRef(null);

	// Toggle dropdown
	const toggleDropdown = () => {
		if (isDisabled) {
			toast.error("Please select a year first");
			return;
		}
		setIsOpen(!isOpen);
	};

	// Toggle parameter expansion
	const toggleExpand = (path) => {
		setExpanded((prev) => ({
			...prev,
			[path]: !prev[path],
		}));
	};

	// Handle parameter selection
	const handleOptionSelect = (item, path) => {
		const itemName = typeof item === "object" ? item.name : item;
		const subParams = typeof item === "object" ? item.subParameters || [] : [];
		handleSelect(label.toLowerCase(), { name: itemName, subParameters: subParams });
		setIsOpen(false);
	};

	// Handle adding a new parameter
	const handleAddParameter = async (parentPath = null, parentName = null) => {
		if (!newParamName.trim()) {
			toast.error("Parameter name is required");
			return;
		}

		try {
			// Placeholder API call to Strapi
			await axios.post(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${clientId}`,
				{
					data: {
						[`level_${label.toLowerCase().slice(-1)}`]: {
							title: parameters[0]?.title || label.toLowerCase(),
							parameters: [
								...(parameters[0]?.parameters || []),
								{
									name: newParamName,
									subParameters: [],
									parent: parentName || null,
								},
							],
						},
					},
				},
				{
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			toast.success(`Added parameter: ${newParamName}`);
		} catch (error) {
			toast.error("Failed to add parameter");
			console.error(error);
		}

		setNewParamName("");
		setNewParamParent(null);
	};

	// Handle click outside to close dropdown
	const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Render tree recursively
	const renderTree = (items, pathPrefix = "", depth = 0) => {
		return items.map((item, index) => {
			const path = pathPrefix ? `${pathPrefix}.${index}` : `${index}`;
			const isExpanded = expanded[path];
			const isObject = typeof item === "object";
			const itemName = isObject ? item.name : item;
			const subItems = isObject ? item.subParameters || [] : [];
			const isSelected = selectedFilters[label.toLowerCase()]?.name === itemName;

			return (
				<div key={path} className={`ml-${depth * 4}`}>
					<div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100">
						{subItems.length > 0 && (
							<button onClick={() => toggleExpand(path)}>
								{isExpanded ? (
									<ChevronDown size={16} />
								) : (
									<ChevronRight size={16} />
								)}
							</button>
						)}
						<input
							type="checkbox"
							checked={isSelected}
							onChange={() => handleOptionSelect(item, path)}
							className="h-4 w-4"
						/>
						<span className="text-sm text-gray-600">{itemName}</span>
						<button
							className="text-blue-500 ml-auto"
							onClick={() => setNewParamParent(path)}
						>
							<Plus size={16} />
						</button>
					</div>
					{newParamParent === path && (
						<div className="ml-6 mt-2 flex gap-2 px-4">
							<input
								type="text"
								value={newParamName}
								onChange={(e) => setNewParamName(e.target.value)}
								placeholder="New parameter name"
								className="border border-[#EFEFEF] rounded-[10px] p-2 text-sm w-full"
							/>
							<button
								className="bg-[#061237] text-white px-4 py-2 rounded-[10px] text-sm"
								onClick={() => handleAddParameter(path, itemName)}
							>
								Add
							</button>
						</div>
					)}
					{isExpanded && subItems.length > 0 && (
						<div>{renderTree(subItems, path, depth + 1)}</div>
					)}
				</div>
			);
		});
	};

	const displayLabel =
		selectedFilters[label.toLowerCase()]?.name || label.replace("_", " ");

	return (
		<div className="relative" ref={dropdownRef}>
			<div
				className={`flex items-center gap-3 px-4 py-2 whitespace-nowrap h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer ${isDisabled ? "opacity-60" : ""
					}`}
				onClick={toggleDropdown}
			>
				<span className="text-gray-600 capitalize">{displayLabel}</span>
				<span className="ml-auto text-gray-500">
					<Image src={down || "/placeholder.svg"} alt="dropdown" />
				</span>
			</div>
			{isOpen && (
				<div className="absolute w-full bg-white border border-[#EFEFEF] rounded-[10px] shadow-lg mt-2 z-10 max-h-[200px] overflow-y-auto scrollbar-thin">
					{parameters.length > 0 ? (
						<>
							{renderTree(parameters)}
							<div className="px-4 py-2 border-t border-[#EFEFEF]">
								<input
									type="text"
									value={newParamName}
									onChange={(e) => setNewParamName(e.target.value)}
									placeholder="New top-level parameter"
									className="border border-[#EFEFEF] rounded-[10px] p-2 text-sm w-full"
								/>
								<button
									className="bg-[#061237] text-white px-4 py-2 rounded-[10px] mt-2 w-full text-sm"
									onClick={() => handleAddParameter()}
								>
									+ Parameter
								</button>
							</div>
						</>
					) : (
						<div className="px-4 py-2 text-sm text-gray-500">
							No parameters available
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ParameterDropdown;