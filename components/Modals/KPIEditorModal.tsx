// import React, { useState, useCallback } from "react";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import { X } from "lucide-react";

// // Drag type
// const ItemType = "KPI_BOX";

// // Draggable Card Component
// const KpiCard = ({ id, index, moveCard, kpi, removeCard }) => {
// 	const ref = React.useRef(null);

// 	const [, drop] = useDrop({
// 		accept: ItemType,
// 		hover(item: { index: number }) {
// 			if (!ref.current) return;
// 			const dragIndex = item.index;
// 			const hoverIndex = index;
// 			if (dragIndex === hoverIndex) return;
// 			moveCard(dragIndex, hoverIndex);
// 			item.index = hoverIndex;
// 		},
// 	});

// 	const [{ isDragging }, drag] = useDrag({
// 		type: ItemType,
// 		item: { id, index },
// 		collect: (monitor) => ({
// 			isDragging: monitor.isDragging(),
// 		}),
// 	});

// 	drag(drop(ref));

// 	return (
// 		<div
// 			ref={ref}
// 			className="relative bg-white border border-gray-300 rounded-xl shadow-md p-4 cursor-move min-w-[200px]"
// 			style={{ opacity: isDragging ? 0.5 : 1 }}
// 		>
// 			<button
// 				className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
// 				onClick={() => removeCard(id)}
// 			>
// 				<X size={16} />
// 			</button>
// 			<p className="text-sm text-gray-600">{kpi.label}</p>
// 			<h2 className="text-2xl font-semibold text-black">{kpi.value}</h2>
// 		</div>
// 	);
// };

// // Modal Component
// const KPIEditorModal = ({ campaign, aggregatedStats }) => {
// 	const [showModal, setShowModal] = useState(false);



// 	const initialKpis = [
// 		{ id: "reach", label: "Reach", value: campaign?.brand_awareness?.reach || "0" },
// 		{ id: "frequency", label: "Frequency", value: campaign?.brand_awareness?.frequency || "0%" },
// 		{ id: "ctr_traffic", label: "CTR (Traffic)", value: campaign?.traffic?.ctr || "0" },
// 		{ id: "clicks", label: "Total Clicks", value: campaign?.traffic?.total_clicks || "0" },
// 		{ id: "bounce", label: "Bounce Rate", value: campaign?.traffic?.bounce_rate || "0%" },
// 		{ id: "ctr_purchase", label: "CTR (Purchase)", value: campaign?.purchase?.ctr || "0" },
// 		{ id: "orders", label: "Total Orders", value: campaign?.purchase?.total_orders || "0%" },
// 		{ id: "conversion", label: "Conversion Rate", value: campaign?.purchase?.conversion_rate || "0%" },
// 		{ id: "cvr", label: "CVR", value: campaign?.leads?.cvr || "0" },
// 		{ id: "leads", label: "Total Leads", value: campaign?.leads?.total || "0" },
// 		{ id: "cpl", label: "CPL", value: campaign?.leads?.cpl || "0%" },
// 		{ id: "ctr_installs", label: "CTR (Installs)", value: campaign?.installs?.ctr || "0" },
// 		{ id: "installs", label: "Total Installs", value: campaign?.installs?.total || "0%" },
// 		{ id: "install_rate", label: "Install Rate", value: campaign?.installs?.rate || "0%" },
// 		{ id: "video_ctr", label: "CTR (Video)", value: campaign?.video?.ctr || "0" },
// 		{ id: "views", label: "Total Views", value: campaign?.video?.views || "0%" },
// 		{ id: "watch_rate", label: "Watch Rate", value: campaign?.video?.watch_rate || "0%" },
// 	];

// 	const [kpis, setKpis] = useState(initialKpis);

// 	const moveCard = useCallback((fromIndex, toIndex) => {
// 		const updated = [...kpis];
// 		const [moved] = updated.splice(fromIndex, 1);
// 		updated.splice(toIndex, 0, moved);
// 		setKpis(updated);
// 	}, [kpis]);

// 	const removeCard = (id) => {
// 		setKpis((prev) => prev.filter((item) => item?.id !== id));
// 	};

// 	return (
// 		<>
// 			<button
// 				className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
// 				style={{ border: "1px solid #3175FF" }} onClick={() => setShowModal(true)}>	Edit KPI
// 			</button>
// 			{showModal && (
// 				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
// 					<div className="bg-white w-full max-w-4xl rounded-xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
// 						<div className="flex justify-between items-center mb-4">
// 							<h3 className="text-xl font-semibold">Edit KPIs</h3>
// 							<button
// 								className="text-gray-600 hover:text-red-600"
// 								onClick={() => setShowModal(false)}
// 							>
// 								<X size={24} />
// 							</button>
// 						</div>

// 						<DndProvider backend={HTML5Backend}>
// 							<div className="flex flex-wrap gap-4">
// 								{kpis.map((kpi, index) => (
// 									<KpiCard
// 										key={kpi?.id}
// 										id={kpi?.id}
// 										index={index}
// 										kpi={kpi}
// 										moveCard={moveCard}
// 										removeCard={removeCard}
// 									/>
// 								))}
// 							</div>
// 						</DndProvider>

// 						<div className="mt-6 text-right">
// 							<button
// 								className="px-4 py-2 bg-[#3175FF] text-white rounded-lg hover:bg-[#3176ffcf] transition"
// 								onClick={() => setShowModal(false)}
// 							>
// 								Save KPIs
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</>
// 	);
// };

// export default KPIEditorModal;


// import React, { useState, useCallback } from "react";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import { X } from "lucide-react";

// const ItemType = "KPI_BOX";

// // Draggable Card Component
// const KpiCard = ({ id, index, kpi, moveCard, removeCard, category }) => {
// 	const ref = React.useRef(null);

// 	const [, drop] = useDrop({
// 		accept: ItemType,
// 		hover(item: { index: number; category: string }) {
// 			if (!ref.current || item.category !== category) return;
// 			const dragIndex = item.index;
// 			const hoverIndex = index;
// 			if (dragIndex === hoverIndex) return;
// 			moveCard(category, dragIndex, hoverIndex);
// 			item.index = hoverIndex;
// 		},
// 	});

// 	const [{ isDragging }, drag] = useDrag({
// 		type: ItemType,
// 		item: { id, index, category },
// 		collect: (monitor) => ({
// 			isDragging: monitor.isDragging(),
// 		}),
// 	});

// 	drag(drop(ref));

// 	return (
// 		<div
// 			ref={ref}
// 			className="relative bg-white border border-gray-300 rounded-xl shadow-md p-4 cursor-move min-w-[200px]"
// 			style={{ opacity: isDragging ? 0.5 : 1 }}
// 		>
// 			<button
// 				className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
// 				onClick={() => removeCard(category, id)}
// 			>
// 				<X size={16} />
// 			</button>
// 			<p className="text-sm text-gray-600">{kpi.label}</p>
// 			<h2 className="text-2xl font-semibold text-black">{kpi.value}</h2>
// 		</div>
// 	);
// };

// // Modal Component
// const KPIEditorModal = ({ aggregatedStats }) => {
// 	const [showModal, setShowModal] = useState(false);

// 	// Transform data into categorized KPI object
// 	const generateGroupedKpis = (stats) => {
// 		const grouped = {};
// 		for (const category in stats) {
// 			grouped[category] = Object.entries(stats[category]).map(([label, value], i) => ({
// 				id: `${category}-${label}`.replace(/\s+/g, "_").toLowerCase(),
// 				label,
// 				value,
// 			}));
// 		}
// 		return grouped;
// 	};

// 	const [groupedKpis, setGroupedKpis] = useState<Record<string, { id: string; label: string; value: string }[]>>(generateGroupedKpis(aggregatedStats));

// 	const moveCard = useCallback((category, fromIndex, toIndex) => {
// 		const updated = [...groupedKpis[category]];
// 		const [moved] = updated.splice(fromIndex, 1);
// 		updated.splice(toIndex, 0, moved);
// 		setGroupedKpis((prev) => ({
// 			...prev,
// 			[category]: updated,
// 		}));
// 	}, [groupedKpis]);

// 	const removeCard = (category, id) => {
// 		setGroupedKpis((prev) => ({
// 			...prev,
// 			[category]: prev[category].filter((kpi) => kpi.id !== id),
// 		}));
// 	};

// 	return (
// 		<>
// 			<button
// 				className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
// 				style={{ border: "1px solid #3175FF" }}
// 				onClick={() => setShowModal(true)}
// 			>
// 				Edit KPI
// 			</button>
// 			{showModal && (
// 				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
// 					<div className="bg-white w-full max-w-6xl rounded-xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
// 						<div className="flex justify-between items-center mb-4">
// 							<h3 className="text-xl font-semibold">Edit KPIs</h3>
// 							<button
// 								className="text-gray-600 hover:text-red-600"
// 								onClick={() => setShowModal(false)}
// 							>
// 								<X size={24} />
// 							</button>
// 						</div>

// 						<DndProvider backend={HTML5Backend}>
// 							<div className="space-y-10">
// 								{Object.entries(groupedKpis).map(([category, kpis]) => (
// 									<div key={category}>
// 										<h4 className="text-lg font-bold text-gray-800 mb-3">{category}</h4>
// 										<div className="flex flex-wrap gap-4">
// 											{kpis?.map((kpi, index) => (
// 												<KpiCard
// 													key={kpi.id}
// 													id={kpi.id}
// 													index={index}
// 													kpi={kpi}
// 													category={category}
// 													moveCard={moveCard}
// 													removeCard={removeCard}
// 												/>
// 											))}
// 										</div>
// 									</div>
// 								))}
// 							</div>
// 						</DndProvider>

// 						<div className="mt-6 text-right">
// 							<button
// 								className="px-4 py-2 bg-[#3175FF] text-white rounded-lg hover:bg-[#3176ffcf] transition"
// 								onClick={() => setShowModal(false)}
// 							>
// 								Save KPIs
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</>
// 	);
// };

// export default KPIEditorModal;


// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import { X } from "lucide-react";

// const ItemType = "CATEGORY_CARD";

// // Draggable Category Card
// const KpiCategoryCard = ({ id, index, category, data, moveCard }) => {
// 	const ref = useRef(null);

// 	const [, drop] = useDrop({
// 		accept: ItemType,
// 		hover(item: { id: string; index: number }) {
// 			if (!ref.current) return;
// 			const dragIndex = item.index;
// 			const hoverIndex = index;
// 			if (dragIndex === hoverIndex) return;
// 			moveCard(dragIndex, hoverIndex);
// 			item.index = hoverIndex;
// 		},
// 	});

// 	const [{ isDragging }, drag] = useDrag({
// 		type: ItemType,
// 		item: { id, index },
// 		collect: (monitor) => ({
// 			isDragging: monitor.isDragging(),
// 		}),
// 	});

// 	drag(drop(ref));

// 	return (
// 		<div
// 			ref={ref}
// 			className="bg-white border border-gray-300 rounded-xl shadow-md p-4 min-w-[250px] w-full cursor-move"
// 			style={{ opacity: isDragging ? 0.5 : 1 }}
// 		>
// 			<h4 className="text-lg font-bold text-[#3175FF] mb-2">{category}</h4>
// 			<div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
// 				{Object.entries(data).map(([label, value]) => (
// 					<div key={label} className="flex justify-between">
// 						<span>{label}</span>
// 						<span className="font-medium">{typeof value === "number" ? value.toFixed(2) : String(value)}</span>
// 					</div>
// 				))}
// 			</div>
// 		</div>
// 	);
// };

// // Main Modal
// const KPIEditorModal = ({ aggregatedStats }) => {
// 	const [showModal, setShowModal] = useState(false);
// 	const [categoryOrder, setCategoryOrder] = useState([]);

// 	useEffect(() => {
// 		if (aggregatedStats && Object.keys(aggregatedStats).length > 0) {
// 			setCategoryOrder(Object.keys(aggregatedStats));
// 		}
// 	}, [aggregatedStats]);

// 	const moveCard = useCallback((fromIndex, toIndex) => {
// 		setCategoryOrder((prev) => {
// 			const updated = [...prev];
// 			const [moved] = updated.splice(fromIndex, 1);
// 			updated.splice(toIndex, 0, moved);
// 			return updated;
// 		});
// 	}, []);

// 	return (
// 		<>
// 			<button
// 				className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
// 				style={{ border: "1px solid #3175FF" }}
// 				onClick={() => setShowModal(true)}
// 			>
// 				Edit KPI
// 			</button>

// 			{showModal && (
// 				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
// 					<div className="bg-white w-full max-w-5xl rounded-xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
// 						<div className="flex justify-between items-center mb-4">
// 							<h3 className="text-xl font-semibold">Edit KPIs</h3>
// 							<button
// 								className="text-gray-600 hover:text-red-600"
// 								onClick={() => setShowModal(false)}
// 							>
// 								<X size={24} />
// 							</button>
// 						</div>

// 						<DndProvider backend={HTML5Backend}>
// 							<div className="grid gap-4 grid-cols-1 md:grid-cols-2">
// 								{categoryOrder.map((category, index) => (
// 									<KpiCategoryCard
// 										key={category}
// 										id={category}
// 										index={index}
// 										category={category}
// 										data={aggregatedStats[category]}
// 										moveCard={moveCard}
// 									/>
// 								))}
// 							</div>
// 						</DndProvider>

// 						<div className="mt-6 text-right">
// 							<button
// 								className="px-4 py-2 bg-[#3175FF] text-white rounded-lg hover:bg-[#3176ffcf] transition"
// 								onClick={() => setShowModal(false)}
// 							>
// 								Save KPIs
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</>
// 	);
// };

// export default KPIEditorModal;



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
const KPIEditorModal = ({ aggregatedStats, campaign_id, }) => {
	const [showModal, setShowModal] = useState(false);
	const { addKpis, isLoading, error, createKpisSuccess } = useKpis();
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

	const [groupedKpis, setGroupedKpis] = useState(generateGroupedKpis(aggregatedStats));
	const [categoryOrder, setCategoryOrder] = useState(Object.keys(aggregatedStats));


	console.log('groupedKpis-groupedKpis', groupedKpis)
	console.log('createKpisSuccess-createKpisSuccess', createKpisSuccess)
	console.log('error-error', error)

	const moveCategory = useCallback((fromIndex: number, toIndex: number) => {
		const updated = [...categoryOrder];
		const [moved] = updated.splice(fromIndex, 1);
		updated.splice(toIndex, 0, moved);
		setCategoryOrder(updated);
	}, [categoryOrder]);

	const removeKpi = (category: string | number, id: any) => {
		setGroupedKpis((prev) => ({
			...prev,
			[category]: prev[category].filter((kpi: { id: any; }) => kpi.id !== id),
		}));
	};

	const removeCard = (category: string) => {
		setGroupedKpis((prev) => {
			const updated = { ...prev };
			delete updated[category];
			return updated;
		});

		setCategoryOrder((prev) => prev.filter((cat) => cat !== category));
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

	const aggregated_kpis = {
		groupedKpis
	}


	const handleAddKpis = async () => {

		try {
			await addKpis(campaign_id, groupedKpis);
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
								{categoryOrder?.map((category, index) => (
									<CategoryCard
										key={category}
										category={category}
										index={index}
										kpis={groupedKpis[category]}
										moveCategory={moveCategory}
										removeKpi={removeKpi}
										removeCard={removeCard}
									/>

								))}
							</div>
						</DndProvider>

						<div className="mt-6 text-right">
							<button
								className="px-4 py-2 bg-[#3175FF] text-white rounded-lg hover:bg-[#3176ffcf] transition"
								onClick={handleAddKpis}>
								{isLoading ? <SVGLoader width={"25px"} height={"25px"} color={"#FFF"} /> : "	Save KPIs"}

							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default KPIEditorModal;
