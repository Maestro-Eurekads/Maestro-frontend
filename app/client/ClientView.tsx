"use client"
import React, { useState } from 'react'
import Header from './Header';
import ClientToggleSwitch from './ClientToggleSwitch';
import ClientTableView from './ClientTableView';
import ClientEstablishedGoals from './ClientEstablishedGoals';
import facebook from "../../public/facebook.svg";
import instagram from "../../public/instagram.svg";
import youtube from "../../public/youtube.svg";
import tradedesk from "../../public/tradedesk.svg";
import quantcast from "../../public/quantcast.svg";
import TimelineView from './TimelineView';
import ApproverContainer from './ApproverContainer';


const channels = [
	{
		icon: facebook,
		name: "Facebook",
		color: "#0866FF",
		audience: "Men 25+ Int. Sport",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 50000,
		budgetSize: "1,800 €",
		impressions: 2000000,
		reach: 2000000,
		hasChildren: true,
	},
	{
		icon: instagram,
		name: "Instagram",
		color: "#E01389",
		audience: "Lookalike Buyers 90D",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 40000,
		budgetSize: 8000,
		impressions: 2000000,
		reach: 2000000,
		hasChildren: true,
	},
	{
		icon: youtube,
		name: "Youtube",
		color: "#FF0302",
		audience: "Men 25+ Int. Sport",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 60000,
		budgetSize: 12000,
		impressions: 2000000,
		reach: 2000000,
		hasChildren: false,
	},
	{
		icon: tradedesk,
		name: "TheTradeDesk",
		color: "#0099FA",
		audience: "Lookalike Buyers 90D",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 60000,
		budgetSize: 12000,
		impressions: 2000000,
		reach: 2000000,
		hasChildren: false,
	},
	{
		icon: quantcast,
		name: "Quantcast",
		color: "#061237",
		audience: "Men 25+ Int. Sport",
		startDate: "01/02/2024",
		endDate: "01/03/2024",
		audienceSize: 60000,
		budgetSize: 12000,
		impressions: 2000000,
		reach: 2000000,
		hasChildren: false,
	},
];
const ClientView = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [active, setActive] = useState("Timeline view");



	return (
		<>
			<div id="page-wrapper-client">
				<Header setIsOpen={setIsOpen} />
				<main className="!px-0 mt-[20px]">
					<div className=" md:px-[150px] xl:px-[200px]">
						<div >

							<ApproverContainer />

							<div className="my-[50px] flex flex-col justify-between gap-4 md:flex-row">
								<ClientToggleSwitch active={active} setActive={setActive} />
								<button
									className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
									style={{ border: "1px solid #3175FF" }}
								// onClick={handleOpenModal}
								>
									See budget overview
								</button>
							</div>
						</div>
					</div>
					<div >
						{active === "Timeline view" && <TimelineView />}
						<div className=" md:px-[150px] xl:px-[200px]">
							{active === "Table" && <ClientTableView channels={channels} />}
						</div>
					</div>
				</main>

			</div>
		</>
	)
}

export default ClientView