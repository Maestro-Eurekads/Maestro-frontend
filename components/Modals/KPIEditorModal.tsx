import React, { useState, useCallback, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { X } from "lucide-react";
import { useKpis } from "app/utils/KpiProvider";
import { SVGLoader } from "components/SVGLoader";
import AlertMain from "components/Alert/AlertMain";
const ItemType = "CATEGORY_CARD";

// Draggable Category Card
const CategoryCard = ({ category, index, moveCategory, kpis, removeKpi, removeCard }) => {

	const [show, setShow] = useState(false);
	const ref = React.useRef(null);

	const [, drop] = useDrop({
		accept: ItemType,
		hover(item: { index: number }) {
			if (!ref.current) return;
			const dragIndex = item.index;
			const hoverIndex = index;
			if (dragIndex === hoverIndex) return;
			moveCategory(dragIndex, hoverIndex);
			item.index = hoverIndex;
		},
	});

	const [{ isDragging }, drag] = useDrag({
		type: ItemType,
		item: { category, index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	drag(drop(ref));

	return (
		<div
			ref={ref}
			className="bg-white border border-gray-300 rounded-xl shadow-md p-6 w-full"
			style={{ opacity: isDragging ? 0.5 : 1 }}>

			<button
				className=" float-right text-gray-500 hover:text-red-500"
				onClick={() => removeCard(category)} >
				<X size={16} />
			</button>
			<h4 className="text-sm font-bold text-gray800 mb-4 cursor-pointer"
				onClick={() => setShow(!show)}>{category}</h4>

			{show &&
				<div className="grid grid-cols-1 gap-4 h-20 overflow-y-scroll">
					{kpis?.map((kpi) => (

						<div
							key={kpi?.id}
							className="relative bg-[#f9fafb] border border-gray-200 rounded-lg p-3">

							<p className="text-xs text-gray-500 mb-1">{kpi?.label}</p>
							<h2 className="text-lg font-medium text-black">{kpi?.value}</h2>
						</div>
					))}
				</div>}


		</div>
	);
};

// Main Modal
const KPIEditorModal = ({ aggregatedStats, campaign_id, finalCategoryOrder }) => {


	const { addKpis, isLoading, error, createKpisSuccess, kpisData, updateKpis, showModal, setShowModal } = useKpis();
	const [alert, setAlert] = useState(null);




	const generateGroupedKpis = (stats) => {
		const grouped = {};
		for (const category in stats) {
			grouped[category] = Object.entries(stats[category]).map(([label, value]) => ({
				id: `${category}-${label}`.replace(/\s+/g, "_").toLowerCase(),
				label,
				value: typeof value === "number" ? value.toFixed(2) : value,
			}));
		}
		return grouped;
	};





	const [groupedKpis, setGroupedKpis] = useState(generateGroupedKpis(aggregatedStats || {}));
	const [orderedKpis, setOrderedKpis] = useState([]);

	useEffect(() => {
		setGroupedKpis(generateGroupedKpis(aggregatedStats));
		// setCategoryOrder(Object.keys(aggregatedStats));
	}, [aggregatedStats]);


	// Adjust grouping and order based on `categoryOrder`
	useEffect(() => {
		// Reorder `groupedKpis` according to the custom `categoryOrder`
		const orderedData = finalCategoryOrder?.reduce((acc, category) => {
			if (groupedKpis[category]) {
				acc[category] = groupedKpis[category];
			}
			return acc;
		}, {});

		setOrderedKpis(Object.entries(orderedData).map(([category, kpis]) => ({ category, kpis })));
	}, [groupedKpis]);


	const moveCategory = useCallback((fromIndex: number, toIndex: number) => {
		const updated = [...orderedKpis];
		const [moved] = updated.splice(fromIndex, 1);
		updated.splice(toIndex, 0, moved);
		setOrderedKpis(updated);
	}, [orderedKpis]);


	const removeKpi = (category: string | number, id: any) => {
		setGroupedKpis((prev) => ({
			...prev,
			[category]: prev[category].filter((kpi: { id: any; }) => kpi.id !== id),
		}));
	};

	// Remove Category Handler
	const removeCard = (category) => {
		setGroupedKpis((prev) => {
			const updated = { ...prev };
			delete updated[category];
			return updated;
		});
		setOrderedKpis((prev) => prev.filter((item) => item?.category !== category));
	};

	useEffect(() => {
		if (alert) {
			const timer = setTimeout(() => setAlert(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [alert]);


	useEffect(() => {
		if (createKpisSuccess) {
			setAlert({ variant: "success", message: "Kpi created!", position: "bottom-right" });
		}
		if (error) {
			setAlert({
				variant: "error", message: error.response?.data || error.response?.data?.error?.message || error?.message, position: "bottom-right"
			});
		}
	}, [createKpisSuccess, error]);

	function getCategoryNames(data) {
		return data?.map(item => item?.category);
	}

	// Assuming `groupedData` is your original big JSON object
	const categories = getCategoryNames(orderedKpis);

	const handleAddKpis = async () => {

		try {
			await addKpis(campaign_id, categories);
		} catch (error) {
		}
	};
	const handleUpdateKpis = async () => {
		try {
			await updateKpis(kpisData?.documentId, categories);
		} catch (error) {
		}
	};

	return (
		<>
			{alert && <AlertMain alert={alert} />}
			<button
				className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
				style={{ border: "1px solid #3175FF" }}
				onClick={() => setShowModal(true)}
			>
				Edit KPI
			</button>
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white w-full max-w-6xl rounded-xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Edit KPIs</h3>
							<button
								className="text-gray-600 hover:text-red-600"
								onClick={() => setShowModal(false)}>
								<X size={24} />
							</button>
						</div>

						<DndProvider backend={HTML5Backend}>
							<div className="space-y-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{orderedKpis?.map(({ category, kpis }, index) => (
									<CategoryCard
										key={category}
										category={category}
										index={index}
										kpis={kpis}
										moveCategory={moveCategory}
										removeKpi={removeKpi}
										removeCard={removeCard}
									/>
								))}
							</div>
						</DndProvider>

						<div className="mt-6 text-right">
							{kpisData?.isCreated ? <button
								className="px-[20px] py-4 bg-[#3175FF] text-white rounded-lg hover:bg-[#3176ffcf] transition"
								onClick={handleUpdateKpis}>
								{isLoading ? <SVGLoader width={"25px"} height={"25px"} color={"#FFF"} /> : "	Update KPIs"}
							</button> : <button
								className="px-[20px] py-4 bg-[#3175FF] text-white rounded-lg hover:bg-[#3176ffcf] transition"
								onClick={handleAddKpis}>
								{isLoading ? <SVGLoader width={"25px"} height={"25px"} color={"#FFF"} /> : "	Save KPIs"}
							</button>}

						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default KPIEditorModal;
