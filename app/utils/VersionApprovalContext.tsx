"use client";
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

// Create the context
const VersionContext = createContext(null);

// Custom hook to access context
export const useVersionContext = () => useContext(VersionContext);

// Provider component
export const VersionApprovalProvider = ({ children }) => {
	const [viewsId, setViewsId] = useState(null);
	const [isError, setIsError] = useState(null);
	const [createsSuccess, setCreatesSuccess] = useState(null);
	const [generalsSuccess, setGeneralsSuccess] = useState(null);
	const [createApprovalSuccess, setCreateApprovalSuccess] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [getLoading, setgetLoading] = useState(false);
	const [updateLoading, setupdateLoading] = useState(false);
	const [version, setVersion] = useState(1);
	const [id, setid] = useState(null);

	// Create campaign version
	const createCampaignVersion = async (campaign_id, version) => {
		setIsLoading(true);
		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/client-campaign-versions`,
				{
					data: {
						campaign_id: campaign_id,
						version
					},
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			setGeneralsSuccess(true);
		} catch (error) {
			setIsError(error);
		} finally {
			setIsLoading(false);
		}
	};

	// get Campaign Version
	const getCampaignVersion = async (campaign_id) => {
		setgetLoading(true);
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/client-campaign-versions?filters[campaign_id][$eq]=${campaign_id}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			const versions = response.data.data;
			setGeneralsSuccess(true);
			setVersion(versions)
			setgetLoading(false);
		} catch (error) {
			setIsError(error);
		} finally {
			setgetLoading(false);
		}
	};


	// Update general note
	const updateCampaignVersion = async (campaign_id, version) => {
		setupdateLoading(true);
		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/client-campaign-versions/${id}`,
				{
					data: {
						campaign_id: campaign_id,
						version
					},
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			setupdateLoading(true);
		} catch (error) {
			setIsError(error);
		} finally {
			setupdateLoading(false);
		}
	};



	return (
		<VersionContext.Provider
			value={{
				createCampaignVersion,
				getCampaignVersion,
				updateCampaignVersion,
				version,
				getLoading,
				updateLoading,
				setViewsId,
				viewsId,
				id,
				setid,
				isLoading,
				setIsLoading,
				createApprovalSuccess,
				setCreateApprovalSuccess,
				generalsSuccess,
				isError,
				createsSuccess,
			}}
		>
			{children}
		</VersionContext.Provider>
	);
};
