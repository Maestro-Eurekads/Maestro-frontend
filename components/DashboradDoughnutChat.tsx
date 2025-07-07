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
import { distinctColorPalette, tailwindToHex } from "./Options";

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


// Fallback palette for assigning unique colors when duplicates occur


// Helper to check if a string is a valid hex color
const isHexColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);

const DashboradDoughnutChat = ({
  insideText = "0 €",
  campaign,
  dataValues,
}: {
  insideText?: string;
  campaign: any
  dataValues: number[];
}) => {
  const chartRef = useRef(null);

  const { campaignFormData } = useCampaigns();

  // Handle funnel_stages as either strings or objects
  // const funnelStages = campaignFormData?.funnel_stages || [];
  // const customFunnels = campaignFormData?.custom_funnels || [];
  // Handle funnel_stages as either strings or objects
  const funnelStages = campaign?.funnel_stages || [];
  const customFunnels = campaign?.custom_funnels || [];

  // Map selected funnel stages to their funnel objects, maintaining order
  const selectedFunnels = funnelStages
    .map((stage: any) => {
      const stageName = typeof stage === 'string' ? stage : stage?.name;
      return customFunnels.find((funnel: any) => funnel.name === stageName);
    })
    .filter((funnel): funnel is { id: string; name: string; color: string } => funnel !== undefined);

  // Map labels for the chart
  const labels = selectedFunnels.map((funnel) => funnel.name);

  // Assign colors from funnel_stages or custom_funnels, ensuring uniqueness
  function getUniqueColors(funnels: { id: string; name: string; color: string }[], stages: any[]) {
    const usedColors = new Set<string>();
    const assignedColors: string[] = [];
    let paletteIndex = 0;

    for (let i = 0; i < funnels.length; i++) {
      const funnel = funnels[i];
      const stage = stages[i];
      let color = stage?.color || funnel.color || "#6B7280"; // Prioritize stage color

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

  const colors = getUniqueColors(selectedFunnels, funnelStages);


  // Generate data values for the chart
  // const dataValues = funnelStages.length > 0
  //   ? campaignFormData?.channel_mix?.map((st: any) => st?.stage_budget?.percentage_value || 0)
  //   : [100];

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
            size: 0.8,
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

export default DashboradDoughnutChat;