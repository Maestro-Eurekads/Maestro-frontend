import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useRef } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DoughnutChart = () => {
  const chartRef = useRef(null);

  // Custom plugin to add text in the center
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart: any) => {
      const { width, height, ctx } = chart;
      ctx.restore();

      // Define text content
      const textTop = "Total spending";
      const textBottom = "9,800 €";

      // Positioning
      const centerX = width / 2;
      const centerY = height / 2;

      // Styling for "Total spending"
      ctx.fillStyle = "rgba(6, 18, 55, 0.8)"; // Font color
      ctx.font = `500 ${height / 20}px Arial`; // Normal weight, dynamic font size
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(textTop, centerX, centerY - 15); // Position top text slightly above center

      // Styling for "9,800 €"
      ctx.fillStyle = "#061237"; // Dark text color
      ctx.font = `bold ${height / 12}px Arial`; // Bolder and larger font
      ctx.fillText(textBottom, centerX, centerY + 15); // Position bottom text slightly below center

      ctx.save();
    },
  };
  const doughnutData = {
    datasets: [
      {
        label: "Tickets",
        data: [25, 50, 25],
        backgroundColor: ["#3175FF", "#00A36C", "#FF9037"],
        cutout: "70%", // Controls thickness of the ring
        borderRadius: 5, // Softens the edges
        hoverOffset: 5, // Enhances hover effect
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
    },
  };

  return (
    <div className="w-[243.73px] h-[243.73px]">
      <Doughnut ref={chartRef} data={doughnutData} options={chartOptions} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default DoughnutChart;
