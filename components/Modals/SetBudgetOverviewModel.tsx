"use client";

const SetBudgetOverviewModel = ({ openBudget, setOpenBudget }) => {
  return (
    <div>
      <button
        className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
        style={{ border: "1px solid #3175FF" }}
        onClick={() => setOpenBudget((prev) => !prev)}
      >
        {`${openBudget ? "Hide" : "Show"} budget overview`}
      </button>
    </div>
  );
};

export default SetBudgetOverviewModel;
