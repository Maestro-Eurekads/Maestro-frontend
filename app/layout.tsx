import type { Metadata } from "next";
import { Roboto, Inter } from "next/font/google"; // Import Inter font
import "./globals.css";
import { ActiveProvider } from "./utils/ActiveContext";
import { DateRangeProvider } from "../src/date-range-context";
import { FunnelProvider } from "./utils/FunnelContextType";
import { ObjectivesProvider } from "./utils/useObjectives";
import ReduxProvider from "./provider";
import { CampaignProvider } from "./utils/CampaignsContext";
import { Suspense } from "react";

// Load Roboto font
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: "400",
});

// Load Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Adjust weights as needed
});

export const metadata: Metadata = {
  title: "Julien",
  description: "Julien web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="light" lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, maximum-scale=1.0, user-scalable=no, initial-scale=1, shrink-to-fit=no"
        />
      </head>
      <body className={`${roboto.variable} ${inter.variable} antialiased`}>
        <ReduxProvider>
          <Suspense>
            <CampaignProvider>
              <ActiveProvider>
                <ObjectivesProvider>
                  <FunnelProvider>
                    <DateRangeProvider>{children}</DateRangeProvider>
                  </FunnelProvider>
                </ObjectivesProvider>
              </ActiveProvider>
            </CampaignProvider>
          </Suspense>
        </ReduxProvider>
      </body>
    </html>
  );
}
