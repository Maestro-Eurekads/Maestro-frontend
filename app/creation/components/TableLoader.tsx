import { CSSProperties } from "react";
import BarLoader from "react-spinners/BarLoader";

const TableLoader = ({ isLoading }: any) => {



  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
    width: "99.8%",
    borderRadius: "50px"
  };


  return (
    <div>
      <BarLoader
        cssOverride={override}
        color={"#3175FF"}
        loading={isLoading}
      />
    </div>
  );
};

export default TableLoader;
