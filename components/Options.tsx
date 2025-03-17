
import { MdOutlineErrorOutline } from "react-icons/md";
import { VscCloudDownload } from "react-icons/vsc";
import { SVGLoader } from "./SVGLoader";




// EntriesPerPage
const EntriesPerPage = ({ data, entriesPerPage, setEntriesPerPage }: any) => (
  <div className="entries-perpage">
    {data?.length >= 8 && (
      // <>
      // Show
      <select
        value={entriesPerPage}
        onChange={(e) => setEntriesPerPage(e.target.value)}
      >
        <option value="8">8</option>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>

    )}
  </div>
);

const TableProgressBar = () => (
  <div id="container-progressbar">
    <div id="bar"></div>
  </div>
);




// TableFetch
const TableFetch = ({ colSpan }: any) => (
  <tr>
    <td colSpan={colSpan} id="table-loader">
      <div className="center-content">
        <VscCloudDownload size={75} />
        <p id="mt-3">Fetching request...</p>
      </div>
    </td>
  </tr>
);
// SVGLoader Fetch
const SVGLoaderFetch = ({ colSpan, text }: any) => (
  <tr>
    <td colSpan={colSpan} id="table-loader">
      <div className="center-content">
        <SVGLoader width={"40px"} height={"40px"} color={"#0866FF"} />

        <p className="mt-3">{text}</p>
      </div>
    </td>
  </tr>
);

// NoRecordFound
const NoRecordFound = ({ colSpan }: any) => (
  <tr>
    <td colSpan={colSpan} id="table-loader">
      <div className="center-content">
        <MdOutlineErrorOutline size={75} />
        <p id="mt-3">No record found</p>
      </div>
    </td>
  </tr>
);
// NoRecordFound
const NoRecordFoundD = ({ colSpan }: any) => (

  <div className="center-content" id="table-loader">
    <MdOutlineErrorOutline size={75} />
    <p id="mt-3">No record found</p>
  </div>
);





const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const customId = "custom-id-yes";
const tokenKey = "svd-sYUDugysad-sdkjhsadkrjyteyugd--dskghjksdh";

const getMonth = (data: any) => {
  // Get the current date
  const currentDate = new Date();

  // Get the current year and month in the format "YYYY-MM"
  const currentYearMonth = currentDate.toISOString().slice(0, 7);

  // Filter the data for the current year and month
  const currentMonthData = data?.filter((item: { createdAt: string | number | Date }) => {
    const itemYearMonth = new Date(item?.createdAt).toISOString().slice(0, 7);
    return itemYearMonth === currentYearMonth;
  });

  return currentMonthData;
};

const getDailyData = (data: any) => {
  // Get the current date in "YYYY-MM-DD" format
  const currentDate = new Date().toISOString().slice(0, 10);

  // Filter the data for the current day
  const currentDayData = data?.filter((item: { createdAt: string | number | Date }) => {
    const itemDate = new Date(item?.createdAt).toISOString().slice(0, 10);
    return itemDate === currentDate;
  });

  return currentDayData;
};

const getWeeklyData = (data: any) => {
  const today = new Date();
  const currentDay = today.getDay(); // Get the current day of the week (0 for Sunday, 1 for Monday, etc.)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay); // Calculate the start date of the current week

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Calculate the end date of the current week 
  // Filter the data for the current week
  const currentWeekData = data?.filter((item: { createdAt: string | number | Date }) => {
    const itemDate = new Date(item?.createdAt);

    // Compare if the item's date is within the start and end dates of the current week
    return itemDate >= startOfWeek && itemDate <= endOfWeek;
  });

  return currentWeekData;
};


function getCurrentMonth() {
  const currentDate = new Date();
  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  return currentMonth;
}

function TooltipPositioned(userInfo: any, userInfo2: any) {
  return (
    <>
      <p aria-label={userInfo + ' ' + userInfo2} tooltip-position="bottom">
        <strong>{userInfo.slice(0, 14)}</strong>
      </p>
    </>
  );
}
function TooltipPositioned2(words: any) {
  return (
    <>
      <p aria-label={words} tooltip-position="bottom">
        {words.slice(0, 14)}
      </p>
    </>
  );
}




const LoginSpiner = () => {
  return (
    <div className="spinner-box">
      <div className="configure-border-1">
        <div className="configure-core"></div>
      </div>
      <div className="configure-border-2">
        <div className="configure-core"></div>
      </div>
    </div>
  )
}







export {
  TableFetch,
  EntriesPerPage,
  NoRecordFound,
  TableProgressBar,
  months,
  getMonth,
  getCurrentMonth,
  getDailyData,
  getWeeklyData,
  TooltipPositioned,
  TooltipPositioned2,
  LoginSpiner,
  customId,
  tokenKey,
  SVGLoaderFetch,
  NoRecordFoundD
};
