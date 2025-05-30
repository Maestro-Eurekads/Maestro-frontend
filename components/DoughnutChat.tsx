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
  { id: "Awareness", name: "Awareness", color: "bg-blue-500" },
  { id: "Consideration", name: "Consideration", color: "bg-green-500" },
  { id: "Conversion", name: "Conversion", color: "bg-orange-500 border border-orange-500" },
  { id: "Loyalty", name: "Loyalty", color: "bg-red-500 border border-red-500" },
];

// Targeting/Retargeting funnels with colors from MapFunnelStages
const targetingRetargetingFunnels = [
  { id: "Targeting", name: "Targeting", color: "bg-blue-500" },
  { id: "Retargeting", name: "Retargeting", color: "bg-green-500" },
];

// Enhanced color mapping with distinct dark variants
const tailwindToHex: { [key: string]: string } = {
  // Standard colors
  "bg-blue-500": "#3B82F6",
  "bg-green-500": "#22C55E",
  "bg-orange-500 border border-orange-500": "#F97316",
  "bg-red-500 border border-red-500": "#EF4444",
  "bg-purple-300": "#D8B4FE",
  "bg-teal-500": "#14B8A6",
  "bg-pink-500 border border-pink-500": "#EC4899",
  "bg-indigo-500": "#6366F1",
  "bg-yellow-500 border border-yellow-500": "#EAB308",
  "bg-cyan-500": "#06B6D4",
  "bg-lime-500": "#84CC16",
  "bg-amber-500 border border-amber-500": "#F59E0B",
  "bg-fuchsia-500 border border-fuchsia-500": "#D946EF",
  "bg-emerald-500": "#10B981",
  "bg-violet-400": "#A78BFA",

  // Distinct dark variants (different from standard colors)
  "bg-stone-800": "#3A3632",  // Darker and distinct from gray
  "bg-darkBlue-700": "#1E3A8A", // Deep blue
  "bg-deepPurple-600": "#5B2C86", // Rich purple
  "bg-lightGreen-400 border border-lightGreen-400": "#7EE787", // Light green
  "bg-deepOrange-300": "#FF9E66", // Deep orange
  "bg-brown-500": "#A18072", // Brown
  "bg-heliotrope-500 border border-heliotrope-500": "#A855F7", // Purple
  "bg-mauve-400": "#C084FC", // Light purple
  "bg-lavender-300 border border-lavender-300": "#BDB2FF", // Lavender
  "bg-periwinkle-600": "#4F46E5", // Periwinkle
  "bg-mint-500": "#06D6A0", // Mint green
  "bg-olive-400 border border-olive-400": "#A3B34D", // Olive green
  "bg-maroon-700": "#7F2B2B", // Maroon
  "bg-peach-300": "#FFC4A3", // Peach
  "bg-rust-500 border border-rust-500": "#B45309", // Rust
  "bg-salmon-600": "#D45D5D", // Salmon
  "bg-tangerine-500 border border-tangerine-500": "#FF8C42", // Tangerine
  "bg-mustard-300": "#FFDB58", // Mustard
  "bg-gold-700": "#B8860B", // Gold
  "bg-platinum-400 border border-platinum-400": "#E5E4E2", // Platinum
  "bg-silver-300": "#C0C0C0", // Silver
  "bg-gunmetal-800": "#2C3539", // Gunmetal
  "bg-cement-700": "#7D8475", // Cement
  "bg-storm-300 border border-storm-300": "#B5BAB6", // Storm
  "bg-mist-500": "#C4D0D0", // Mist
  "bg-frost-600": "#92B3B5", // Frost
  "bg-dusk-400 border border-dusk-400": "#897F98", // Dusk
  "bg-twilight-700": "#4E5180", // Twilight
  "bg-midnight-900": "#191970", // Midnight blue
};

// A palette of distinct colors to assign to stages if their default color would be duplicated
const distinctColorPalette = [
  "#3B82F6", // blue
  "#22C55E", // green
  "#F97316", // orange
  "#EF4444", // red
  "#D8B4FE", // purple
  "#14B8A6", // teal
  "#EC4899", // pink
  "#6366F1", // indigo
  "#EAB308", // yellow
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F59E0B", // amber
  "#D946EF", // fuchsia
  "#10B981", // emerald
  "#A78BFA", // violet
  "#90C4F5", // light blue
  "#5B2C86", // deep purple
  "#7EE787", // light green
  "#FF9E66", // deep orange
  "#A18072", // brown
  "#A855F7", // heliotrope
  "#C084FC", // mauve
  "#BDB2FF", // lavender
  "#4F46E5", // periwinkle
  "#06D6A0", // mint
  "#A3B34D", // olive
  "#7F2B2B", // maroon
  "#FFC4A3", // peach
  "#B45309", // rust
  "#D45D5D", // salmon
  "#FF8C42", // tangerine
  "#FFDB58", // mustard
  "#B8860B", // gold
  "#E5E4E2", // platinum
  "#C0C0C0", // silver
  "#2C3539", // gunmetal
  "#7D8475", // cement
  "#B5BAB6", // storm
  "#C4D0D0", // mist
  "#92B3B5", // frost
  "#897F98", // dusk
  "#4E5180", // twilight
  "#191970", // midnight
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

  // Map selected funnel stages to their funnel objects and maintain order
  const selectedFunnels = funnelStages
    .map((stage: string) => activeFunnels.find((funnel: any) => funnel.name === stage))
    .filter((funnel): funnel is { id: string; name: string; color?: string } => funnel !== undefined);

  // Map labels
  const labels = selectedFunnels.map((funnel) => funnel.name);

  // Assign unique colors to each stage, even if their default color would be the same
  function getUniqueColors(selectedFunnels: { id: string; name: string; color?: string }[]) {
    const usedColors = new Set<string>();
    const assignedColors: string[] = [];
    let paletteIndex = 0;

    for (let i = 0; i < selectedFunnels.length; i++) {
      const funnel = selectedFunnels[i];
      let colorHex: string | undefined;

      // Try to get the color from the funnel object or defaultFunnels
      if (funnelType === "custom" && defaultFunnels.some((df) => df.name === funnel.name)) {
        const defaultFunnel = defaultFunnels.find((df) => df.name === funnel.name);
        colorHex = tailwindToHex[defaultFunnel?.color || "bg-gray-500"];
      } else {
        colorHex = tailwindToHex[funnel.color || "bg-gray-500"];
      }

      // If this color is already used, pick the next unused color from the palette
      if (!colorHex || usedColors.has(colorHex)) {
        // Find the next color in the palette that is not used
        while (paletteIndex < distinctColorPalette.length && usedColors.has(distinctColorPalette[paletteIndex])) {
          paletteIndex++;
        }
        colorHex = distinctColorPalette[paletteIndex] || "#6B7280";
        paletteIndex++;
      }

      assignedColors.push(colorHex);
      usedColors.add(colorHex);
    }
    return assignedColors;
  }

  const colors = getUniqueColors(selectedFunnels);

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
      ctx.fillStyle = "rgba(6, 18, 55, 0.8)";
      ctx.font = `500 ${height / 20}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(textTop, centerX, centerY - 15);

      // Styling for dynamic value
      ctx.fillStyle = "#061237";
      ctx.font = `bold ${height / 12}px Arial`;
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
            size: 0.2,
          },
          padding: 9,
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