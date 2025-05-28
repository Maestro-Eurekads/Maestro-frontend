"use client";
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
import { useCampaigns } from "app/utils/CampaignsContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Default funnels from the provided file
const defaultFunnels = [
  { id: "Awareness", name: "Awareness", bg: "#3175FF" },
  { id: "Consideration", name: "Consideration", bg: "#0ABF7E" },
  { id: "Conversion", name: "Conversion", bg: "#ff9037" },
  { id: "Loyalty", name: "Loyalty", bg: "#F05406" },
];

// Targeting/Retargeting funnels with colors from MapFunnelStages
const targetingRetargetingFunnels = [
  { id: "Targeting", name: "Targeting", color: "bg-blue-500" },
  { id: "Retargeting", name: "Retargeting", color: "bg-green-500" },
];

const DoughnutChart = ({
  insideText = "0 €",
}: {
  insideText?: string;
}) => {
  const chartRef = useRef(null);
  const { campaignFormData } = useCampaigns();

  // Get funnel stages and type from campaignFormData
  const funnelStages = campaignFormData?.funnel_stages || [];
  const funnelType = campaignFormData?.funnel_type || "custom";
  const customFunnels = campaignFormData?.custom_funnels || defaultFunnels;

  // Determine which funnels to use based on funnel_type
  const activeFunnels = funnelType === "targeting_retargeting"
    ? targetingRetargetingFunnels
    : customFunnels;

  // Map selected funnel stages to their colors and maintain order
  const selectedFunnels = funnelStages
    .map((stage: string) => activeFunnels.find((funnel: any) => funnel.name === stage))
    .filter((funnel): funnel is { id: string; name: string; color?: string; bg?: string } => funnel !== undefined);

  // Map labels and colors
  const labels = selectedFunnels.map((funnel) => funnel.name);
  const colors = selectedFunnels.map((funnel) => {
    if (funnelType === "custom" && defaultFunnels.some((df) => df.name === funnel.name)) {
      // Use hex colors from defaultFunnels if the stage is a default stage
      const defaultFunnel = defaultFunnels.find((df) => df.name === funnel.name);
      return defaultFunnel?.bg || "#6B7280";
    } else {
      // Convert Tailwind classes to hex for custom or targeting/retargeting funnels
      const tailwindToHex: { [key: string]: string } = {
        "bg-blue-500": "#3B82F6",
        "bg-green-500": "#22C55E",
        "bg-orange-500 border border-orange-500": "#F97316",
        "bg-red-500 border border-red-500": "#EF4444",
        "bg-purple-500": "#A855F7",
        "bg-teal-500": "#14B8A6",
        "bg-pink-500 border border-pink-500": "#EC4899",
        "bg-indigo-500": "#6366F1",
        "bg-yellow-500 border border-yellow-500": "#EAB308",
        "bg-cyan-500": "#06B6D4",
        "bg-lime-500": "#84CC16",
        "bg-amber-500 border border-amber-500": "#F59E0B",
        "bg-fuchsia-500 border border-fuchsia-500": "#D946EF",
        "bg-emerald-500": "#10B981",
        "bg-violet-500 border border-violet-500": "#8B5CF6",
        "bg-rose-500 border border-rose-500": "#F43F5E",
        "bg-sky-500": "#0EA5E9",
        "bg-gray-700 border border-gray-700": "#374151",
        "bg-blue-700 border border-blue-700": "#1D4ED8",
        "bg-green-700 border border-green-700": "#15803D",
      };
      return tailwindToHex[funnel.color || ""] || "#6B7280"; // Fallback to gray
    }
  });

  // Generate data values (equal distribution for simplicity, adjust as needed)
  const dataValues = funnelStages.length > 0
    ? funnelStages.map(() => 100 / funnelStages.length)
    : [100];

  // Custom plugin to add text in the center
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart: any) => {
      const { width, height, ctx } = chart;
      ctx.restore();

      // Define text content
      const textTop = "Total spending";
      const textBottom = insideText;

      // Positioning
      const centerX = width / 2;
      const centerY = height / 2;

      // Styling for "Total spending"
      ctx.fillStyle = "rgba(6, 18, 55, 0.8)"; // Font color
      ctx.font = `500 ${height / 20}px Arial`; // Normal weight, dynamic font size
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(textTop, centerX, centerY - 15); // Position top text slightly above center

      // Styling for dynamic value (e.g., "9,800 €")
      ctx.fillStyle = "#061237"; // Dark text color
      ctx.font = `bold ${height / 12}px Arial`; // Bolder and larger font
      ctx.fillText(textBottom, centerX, centerY + 15); // Position bottom text slightly below center

      ctx.save();
    },
  };

  const doughnutData = {
    labels: labels.length > 0 ? labels : ["No Stages Selected"],
    datasets: [
      {
        label: "Phase",
        data: dataValues,
        backgroundColor: colors.length > 0 ? colors : ["#6B7280"], // Fallback to gray
        cutout: "70%", // Controls thickness of the ring
        borderRadius: 7, // Softens the edges
        hoverOffset: 7,
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
        labels: {
          font: {
            size: 10, // Increase legend font size
          },
          padding: 1, // Add padding to legend
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  return (
    <div
      className="doughnut_chart_settings"
      style={{
        width: "300px", // Set explicit width
        height: "300px", // Set explicit height
        maxWidth: "100%", // Ensure responsiveness
      }}
    >
      <Doughnut
        ref={chartRef}
        data={doughnutData}
        options={chartOptions}
        plugins={[centerTextPlugin]}
      />
    </div>
  );
};

export default DoughnutChart;