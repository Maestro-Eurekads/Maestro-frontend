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
	const [updateSuccess, setupdateSuccess] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [getLoading, setgetLoading] = useState(false);
	const [updateLoading, setupdateLoading] = useState(false);
	const [version, setVersion] = useState(0);
	const [versions, setVersions] = useState(null);
	const [documentId, setdocumentId] = useState(null);

	// Create campaign version
	const createCampaignVersion = async (newVersion, documentId) => {
		setIsLoading(true);
		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign/${documentId}`,
				{
					data: {
						campaign_version: newVersion
					},
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			setCreatesSuccess(true);
			setIsLoading(false);
		} catch (error) {
			setIsError(error);
		} finally {
			setIsLoading(false);
		}
	};
	// const createCampaignVersion = async (campaign_id, clientId, version) => {
	// 	setIsLoading(true);
	// 	try {
	// 		await axios.post(
	// 			`${process.env.NEXT_PUBLIC_STRAPI_URL}/client-campaign-versions`,
	// 			{
	// 				data: {
	// 					campaign_id: campaign_id,
	// 					clientId: clientId,
	// 					version: version
	// 				},
	// 			},
	// 			{
	// 				headers: {
	// 					"Content-Type": "application/json",
	// 					Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
	// 				},
	// 			}
	// 		);
	// 		setCreatesSuccess(true);
	// 		setIsLoading(false);
	// 	} catch (error) {
	// 		setIsError(error);
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// };

	// get Campaign Version
	const getCampaignVersion = async (campaign_id) => {
		setgetLoading(true);
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign?filters[campaign_id][$eq]=${campaign_id}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			const versions = response.data.data;
			setVersion(versions)
			setgetLoading(false);
		} catch (error) {
			setIsError(error);
		} finally {
			setgetLoading(false);
		}
	};

	// get Campaign Version
	const getCampaignVersionByclientID = async (clientId) => {
		setgetLoading(true);
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign?filters[clientId][$eq]=${clientId}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			const versions = response.data.data;
			setVersions(versions)
			setgetLoading(false);
		} catch (error) {
			setIsError(error);
		} finally {
			setgetLoading(false);
		}
	};


	// Update general note
	const updateCampaignVersion = async (newVersion, documentId) => {
		setupdateLoading(true);
		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign/${documentId}`,
				{
					data: {
						campaign_version: newVersion
					},
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			setupdateSuccess(true);
			setupdateLoading(false);
		} catch (error) {
			setIsError(error);
		} finally {
			setupdateLoading(false);
		}
	};



	return (
		<VersionContext.Provider
			value={{
				getCampaignVersionByclientID,
				createCampaignVersion,
				getCampaignVersion,
				updateCampaignVersion,
				version,
				getLoading,
				updateLoading,
				setViewsId,
				viewsId,
				documentId,
				setdocumentId,
				isLoading,
				setIsLoading,
				updateSuccess,
				isError,
				createsSuccess,
				versions
			}}
		>
			{children}
		</VersionContext.Provider>
	);
};
