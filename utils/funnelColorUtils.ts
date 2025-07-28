// Utility functions for handling funnel colors consistently across components

// Tailwind to hex color mapping
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
};

// Helper to check if a string is a valid hex color
export const isHexColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);

// Convert Tailwind class to hex color
export const tailwindClassToHex = (tailwindClass: string): string => {
  return tailwindToHex[tailwindClass] || "#6B7280";
};

// Get funnel color with fallback logic
export const getFunnelColor = (
  stageName: string, 
  customFunnels?: Array<{ name: string; color: string }>,
  fallbackToHardcoded: boolean = true
): string => {
  // First try to get color from custom_funnels
  if (customFunnels) {
    const customFunnel = customFunnels.find(f => f.name === stageName);
    if (customFunnel?.color) {
      // Convert Tailwind class to hex if needed
      if (isHexColor(customFunnel.color)) {
        return customFunnel.color;
      } else {
        return tailwindClassToHex(customFunnel.color);
      }
    }
  }
  
  // Fallback to hardcoded colors for backward compatibility
  if (fallbackToHardcoded) {
    if (stageName === "Awareness") return "#3175FF";
    if (stageName === "Consideration") return "#00A36C";
    if (stageName === "Conversion") return "#FF9037";
    if (stageName === "Action") return "#F05406";
  }
  
  return "#6B7280"; // Default gray
};

// Get funnel color from campaign data
export const getFunnelColorFromCampaign = (
  stageName: string, 
  campaign: any
): string => {
  const customFunnels = campaign?.custom_funnels || [];
  return getFunnelColor(stageName, customFunnels, true);
}; 