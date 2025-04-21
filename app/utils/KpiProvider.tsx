// "use client";
// import React, { createContext, useContext, useState } from "react";
// import axios from "axios";
// const KpisContext = createContext(null);

// export const useKpis = () => {
// 	return useContext(KpisContext);
// };

// export const KpiProvider = ({ children }) => {
// 	const [error, setError] = useState(null);
// 	const [createKpisSuccess, setCreateKpisSuccess] = useState(null);
// 	const [isLoading, setIsLoading] = useState(false);









// 	// const updateGeneralComment = async (commentId, generalComment, author, id) => {
// 	// 	setIsLoadingGeneral(true);
// 	// 	try {
// 	// 		await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/general-comments/${id}`, {
// 	// 			data: {
// 	// 				commentId,
// 	// 				generalComment,
// 	// 				author
// 	// 			},
// 	// 		}, {
// 	// 			headers: {
// 	// 				"Content-Type": "application/json",
// 	// 				Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
// 	// 			},
// 	// 		});
// 	// 		dispatch(getGeneralComment(commentId));
// 	// 		setGeneralComment("");
// 	// 		setIsLoadingGeneral(false);
// 	// 		setGeneralcommentsSuccess(true);
// 	// 	} catch (error) {
// 	// 		setGeneralError(error);
// 	// 		setIsLoadingGeneral(false);
// 	// 	}
// 	// };

// 	const addKpis = async (campaign_id, groupedKpis) => {
// 		setIsLoading(true);
// 		try {
// 			await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/aggregated-kpis`, {
// 				data: {
// 					campaign_id,
// 					aggregated_kpis: groupedKpis
// 				},
// 			}, {
// 				headers: {
// 					"Content-Type": "application/json",
// 					Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
// 				},
// 			});
// 			setIsLoading(false);
// 			setCreateKpisSuccess(true);
// 		} catch (error) {
// 			setError(error);
// 			setIsLoading(false);
// 		}
// 	};











// 	return (
// 		<KpisContext.Provider
// 			value={{
// 				addKpis,
// 				error,
// 				createKpisSuccess,
// 				isLoading
// 			}}
// 		>
// 			{children}
// 		</KpisContext.Provider>
// 	);
// };


"use client";
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const KpisContext = createContext(null);

export const useKpis = () => useContext(KpisContext);

export const KpiProvider = ({ children }) => {
	const [kpisData, setKpisData] = useState(null);

	// Add states
	const [isAddingKpis, setIsAddingKpis] = useState(false);
	const [addKpisError, setAddKpisError] = useState(null);
	const [createKpisSuccess, setCreateKpisSuccess] = useState(null);

	const [isFetchingKpis, setIsFetchingKpis] = useState(false);
	const [getKpisError, setGetKpisError] = useState(null);

	const [isUpdatingKpis, setIsUpdatingKpis] = useState(false);
	const [updateKpisError, setUpdateKpisError] = useState(null);

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
	};

	const addKpis = async (campaign_id, groupedKpis) => {
		setIsAddingKpis(true);
		setAddKpisError(null);
		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/aggregated-kpis`,
				{
					data: {
						campaign_id,
						aggregated_kpis: groupedKpis,
					},
				},
				{ headers }
			);
			setCreateKpisSuccess(true);
		} catch (error) {
			setAddKpisError(error);
		} finally {
			setIsAddingKpis(false);
		}
	};

	const getKpis = async (campaign_id) => {
		setIsFetchingKpis(true);
		setGetKpisError(null);
		try {
			const res = await axios.get(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/aggregated-kpis?filters[campaign_id][$eq]=${campaign_id}`,
				{ headers }
			);
			const kpis = res.data?.data[0];
			setKpisData(kpis);
			return kpis;
		} catch (error) {
			setGetKpisError(error);
			console.error("Error fetching KPIs:", error);
		} finally {
			setIsFetchingKpis(false);
		}
	};

	const updateKpis = async (id, updatedGroupedKpis) => {
		setIsUpdatingKpis(true);
		setUpdateKpisError(null);
		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/aggregated-kpis/${id}`,
				{
					data: {
						aggregated_kpis: updatedGroupedKpis,
					},
				},
				{ headers }
			);
			setCreateKpisSuccess(true);
		} catch (error) {
			setUpdateKpisError(error);
			console.error("Error updating KPIs:", error);
		} finally {
			setIsUpdatingKpis(false);
		}
	};

	return (
		<KpisContext.Provider
			value={{
				addKpis,
				getKpis,
				updateKpis,
				kpisData,

				// Add states
				isAddingKpis,
				addKpisError,
				isFetchingKpis,
				getKpisError,
				isUpdatingKpis,
				updateKpisError,

				createKpisSuccess,
			}}
		>
			{children}
		</KpisContext.Provider>
	);
};



