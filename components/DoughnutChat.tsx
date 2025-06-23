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

// Tailwind to hex mapping for converting Tailwind classes to hex colors for Chart.js
const tailwindToHex: { [key: string]: string } = {
  "bg-blue-500": "#3B82F6",
  "bg-green-500": "#22C55E",
  "bg-orange-500": "#F97316",
  "bg-red-500": "#EF4444",
  "bg-purple-500": "#A855F7",
  "bg-teal-500": "#14B8A6",
  "bg-pink-500": "#EC4899",
  "bg-indigo-500": "#6366F1",
  "bg-yellow-500": "#FACC15",
  "bg-cyan-500": "#06B6D4",
  "bg-lime-500": "#84CC16",
  "bg-amber-500": "#F59E0B",
  "bg-fuchsia-500": "#D946EF",
  "bg-emerald-500": "#10B981",
  "bg-violet-600": "#7C3AED",
  "bg-rose-600": "#F43F5E",
  "bg-sky-500": "#0EA5E9",
  "bg-gray-800": "#1F2937",
  "bg-blue-800": "#1E40AF",
  "bg-green-800": "#166534",
  "bg-purple-300": "#D8B4FE",
  "bg-darkBlue-700": "#1E3A8A",
  "bg-deepPurple-600": "#5B2C86",
  "bg-lightGreen-400": "#7EE787",
  "bg-deepOrange-300": "#FF9E66",
  "bg-brown-500": "#A18072",
  "bg-heliotrope-500": "#A855F7",
  "bg-mauve-400": "#C084FC",
  "bg-lavender-300": "#BDB2FF",
  "bg-periwinkle-600": "#4F46E5",
  "bg-mint-500": "#06D6A0",
  "bg-olive-400": "#A3B34D",
  "bg-maroon-700": "#7F2B2B",
  "bg-peach-300": "#FFC4A3",
  "bg-rust-500": "#B45309",
  "bg-salmon-600": "#D45D5D",
  "bg-tangerine-500": "#FF8C42",
  "bg-mustard-300": "#FFDB58",
  "bg-gold-700": "#B8860B",
  "bg-platinum-400": "#E5E4E2",
  "bg-silver-300": "#C0C0C0",
  "bg-gunmetal-800": "#2C3539",
  "bg-cement-700": "#7D8475",
  "bg-storm-300": "#B5BAB6",
  "bg-mist-500": "#C4D0D0",
  "bg-frost-600": "#92B3B5",
  "bg-dusk-400": "#897F98",
  "bg-twilight-700": "#4E5180",
  "bg-midnight-900": "#191970",
};

// Fallback palette for assigning unique colors when duplicates occur
const distinctColorPalette = [
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#EF4444",
  "#A855F7",
  "#14B8A6",
  "#EC4899",
  "#6366F1",
  "#FACC15",
  "#06B6D4",
  "#84CC16",
  "#F59E0B",
  "#D946EF",
  "#10B981",
  "#7C3AED",
  "#F43F5E",
  "#0EA5E9",
  "#1F2937",
  "#1E40AF",
  "#166534",
  "#D8B4FE",
  "#1E3A8A",
  "#5B2C86",
  "#7EE787",
  "#FF9E66",
  "#A18072",
  "#C084FC",
  "#BDB2FF",
  "#4F46E5",
  "#06D6A0",
  "#A3B34D",
  "#7F2B2B",
  "#FFC4A3",
  "#B45309",
  "#D45D5D",
  "#FF8C42",
  "#FFDB58",
  "#B8860B",
  "#E5E4E2",
  "#C0C0C0",
  "#2C3539",
  "#7D8475",
  "#B5BAB6",
  "#C4D0D0",
  "#92B3B5",
  "#897F98",
  "#4E5180",
  "#191970",
];

// Helper to check if a string is a valid hex color
const isHexColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);

const DoughnutChart = ({
  insideText = "0 €",
}: {
  insideText?: string;
}) => {
  const chartRef = useRef(null);
  const { campaignFormData } = useCampaigns();

  // Get funnel stages and custom funnels from campaignFormData
  const funnelStages = campaignFormData?.funnel_stages || [];
  const customFunnels = campaignFormData?.custom_funnels || [];

  // Map selected funnel stages to their funnel objects, maintaining order
  const selectedFunnels = funnelStages
    .map((stage: string) => customFunnels.find((funnel: any) => funnel.name === stage))
    .filter((funnel): funnel is { id: string; name: string; color: string } => funnel !== undefined);

  // Map labels for the chart
  const labels = selectedFunnels.map((funnel) => funnel.name);

  // Assign colors from custom_funnels, ensuring uniqueness
  function getUniqueColors(funnels: { id: string; name: string; color: string }[]) {
    const usedColors = new Set<string>();
    const assignedColors: string[] = [];
    let paletteIndex = 0;

    for (const funnel of funnels) {
      let color = funnel.color || "#6B7280"; // Fallback to gray

      // Convert Tailwind class to hex if necessary, or use hex directly
      const colorHex = isHexColor(color) ? color : tailwindToHex[color] || "#6B7280";

      // Ensure uniqueness by checking against used colors
      if (usedColors.has(colorHex)) {
        while (paletteIndex < distinctColorPalette.length && usedColors.has(distinctColorPalette[paletteIndex])) {
          paletteIndex++;
        }
        color = distinctColorPalette[paletteIndex] || "#6B7280";
        paletteIndex++;
      } else {
        color = colorHex;
      }

      assignedColors.push(color);
      usedColors.add(color);
    }
    return assignedColors;
  }

  const colors = getUniqueColors(selectedFunnels);

  console.log('insideText-insideText', insideText)


  // Generate data values for the chart
  const dataValues = funnelStages.length > 0
    ? campaignFormData?.channel_mix?.map((st: any) => st?.stage_budget?.percentage_value || 0)
    : [100];

  // Custom plugin to add text in the center of the doughnut chart
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart: any) => {
      const { width, height, ctx } = chart;
      ctx.restore();

      const textTop = "Total spending";
      const textBottom = insideText;

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = "rgba(6, 18, 55, 0.8)";
      ctx.font = `500 ${height / 20}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(textTop, centerX, centerY - 15);

      ctx.fillStyle = "#061237";
      ctx.font = `bold ${height / 20}px Arial`;
      ctx.fillText(textBottom, centerX, centerY + 15);

      ctx.save();
    },
  };

  const doughnutData = {
    labels: labels.length > 0 ? labels : ["No Stages Selected"],
    datasets: [
      {
        label: "Phase",
        data: dataValues,
        backgroundColor: colors.length > 0 ? colors : ["#6B7280"],
        cutout: "70%",
        borderRadius: 7,
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
            size: 0.8, // Adjusted to a reasonable size for visibility
          },
          padding: 0.8,
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
        width: "300px",
        height: "300px",
        maxWidth: "100%",
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