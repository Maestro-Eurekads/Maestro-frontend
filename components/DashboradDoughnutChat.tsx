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
import { distinctColorPalette, isHexColor, tailwindToHex } from "./Options";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);




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


  // Handle funnel_stages as either strings or objects
  const funnelStages = campaign?.funnel_stages || [];
  const customFunnels = campaign?.custom_funnels || [];

  // Map selected funnel stages to their funnel objects, maintaining order
  const selectedFunnels = funnelStages
    .map((stage: any) => {
      const stageName = typeof stage === "string" ? stage : stage?.name;
      return {
        name: stageName,
        color: customFunnels.find((f) => f.name === stageName)?.color || "#6B7280", // fallback to gray
      };
    });

  // Assign unique colors, converting Tailwind to HEX when needed
  function getUniqueColors(funnels: { name: string; color: string }[]) {
    const usedColors = new Set<string>();
    const assignedColors: string[] = [];
    let paletteIndex = 0;

    for (let i = 0; i < funnels.length; i++) {
      const funnel = funnels[i];
      let color = funnel.color;

      // Convert Tailwind class (e.g. bg-blue-500) to hex
      const colorHex = isHexColor(color) ? color : tailwindToHex[color] || "#6B7280";

      // Ensure color uniqueness
      if (usedColors.has(colorHex)) {
        while (
          paletteIndex < distinctColorPalette.length &&
          usedColors.has(distinctColorPalette[paletteIndex])
        ) {
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

  const labels = selectedFunnels.map((f) => f.name);
  const colors = getUniqueColors(selectedFunnels);

  // Handle funnel_stages as either strings or objects


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