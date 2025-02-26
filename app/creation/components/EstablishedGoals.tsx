import React, { useState } from "react";
import facebook from "../../../public/facebook.svg";
import instagram from "../../../public/instagram.svg";
import youtube from "../../../public/youtube.svg";
import tradedesk from "../../../public/tradedesk.svg";
import quantcast from "../../../public/quantcast.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import TableView from "./EstablishedGoals/TableView";
import ToggleSwitch from "./EstablishedGoals/ToggleSwitch";
import SetBudgetOverviewModel from "../../../components/Modals/SetBudgetOverviewModel";
import TimelineView from "./EstablishedGoals/TimelineView";

const channels = [
  {
    icon: facebook,
    name: "Facebook",
    color: "#0866FF",
    audience: "Men 25+ Int. Sport",
    startDate: "01/02/2024",
    endDate: "01/03/2024",
    audienceSize: 50000,
    budgetSize: 10000,
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

export const EstablishedGoals = () => {
  const [active, setActive] = useState("Timeline View");



  return (
    <div >

      <div className="creation_continer">

        <div className="flex justify-between ">
          <PageHeaderWrapper
            t1={' Establish your goals'}
            t2={'Define the KPIs for each phase, channel, and ad set. Use the Table View to input and customize'}
            t3={'your metrics, and switch to the Timeline View to visualize them across the campaign.'}
          />

          <SetBudgetOverviewModel />
        </div>

        <div className="my-9">

          <ToggleSwitch active={active} setActive={setActive} />
        </div>
      </div>


      {active === "Timeline View" ? <TimelineView /> : < TableView channels={channels} />}
    </div>
  );
};
