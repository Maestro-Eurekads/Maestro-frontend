"use client";
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const KpisContext = createContext(null);
export const useKpis = () => useContext(KpisContext);
export const KpiProvider = ({ children }) => {
	const [kpisData, setKpisData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingKpis, setIsLoadingKpis] = useState(false);
	const [addKpisError, setAddKpisError] = useState(null);
	const [createKpisSuccess, setCreateKpisSuccess] = useState(null);
	const [getKpisError, setGetKpisError] = useState(null);
	const [updateKpisError, setUpdateKpisError] = useState(null);
	const [kpiCategory, setkpiCategory] = useState<any>([]);
	const [refresh, setRefresh] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
	};

	const addKpis = async (campaign_id, groupedKpis) => {
		setIsLoading(true);
		setAddKpisError(null);
		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/aggregated-kpis`,
				{
					data: {
						campaign_id,
						aggregated_kpis: groupedKpis,
						isCreated: true,
					},
				},
				{ headers }
			);
			setCreateKpisSuccess(true);
			setRefresh(true);
			setShowModal(false);
		} catch (error) {
			setAddKpisError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const getKpis = async (campaign_id) => {
		setIsLoadingKpis(true);
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
			setIsLoadingKpis(false);
		} finally {
			setIsLoadingKpis(false);
		}
	};

	const updateKpis = async (id, updatedGroupedKpis) => {
		setIsLoading(true);
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
			setRefresh(true);
			setIsLoading(false);
			setShowModal(false);
		} catch (error) {
			setUpdateKpisError(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<KpisContext.Provider
			value={{
				addKpis,
				getKpis,
				updateKpis,
				kpisData,
				isLoading,
				isLoadingKpis,
				addKpisError,
				getKpisError,
				updateKpisError,
				createKpisSuccess,
				kpiCategory,
				setkpiCategory,
				refresh,
				setRefresh,
				showModal,
				setShowModal
			}}
		>
			{children}
		</KpisContext.Provider>
	);
};



