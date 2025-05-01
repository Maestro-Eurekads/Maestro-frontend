import type { Metadata } from "next";
import { Roboto, Inter } from "next/font/google";
import "./globals.css";
import { ActiveProvider } from "./utils/ActiveContext";
import { DateRangeProvider } from "../src/date-range-context";
import { FunnelProvider } from "./utils/FunnelContextType";
import { ObjectivesProvider } from "./utils/useObjectives";
import { CampaignProvider } from "./utils/CampaignsContext";
import { EditingProvider } from "./utils/EditingContext";
import { Suspense } from "react";
import { SelectedDatesProvider } from "./utils/SelectedDatesContext";
import { CampaignSelectionProvider } from "./utils/CampaignSelectionContext";
import NewProvider from "./provider";
import { ToastContainer } from "react-toastify";
import { VerificationProvider } from "./utils/VerificationContext";
import { CommentProvider } from "./utils/CommentProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "utils/auth";
import Login from "features/Login";
import { ClientCampaignProvider } from "./client/ClientCampaignContext";
import { KpiProvider } from "./utils/KpiProvider";
import { DashboardDateRangeProvider } from "src/date-context";

// Load fonts
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Julien",
  description: "Julien web",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <html data-theme="light" lang="en" suppressHydrationWarning>
        <head>
          <meta
            name="viewport"
            content="width=device-width, maximum-scale=1.0, user-scalable=no, initial-scale=1, shrink-to-fit=no"
          />
        </head>
        <body>
          <Login />
        </body>
      </html>
    );
  }

  return (
    <html data-theme="light" lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, maximum-scale=1.0, user-scalable=no, initial-scale=1, shrink-to-fit=no"
        />
      </head>
      <body className={`${roboto.variable} ${inter.variable} antialiased`}>
        <NewProvider session={session}>
          <Suspense>
            <ClientCampaignProvider>
              <CommentProvider>
                <KpiProvider>
                  <VerificationProvider>
                    <CampaignSelectionProvider>
                      <CampaignProvider>
                        <DashboardDateRangeProvider>
                          <DateRangeProvider>
                            <SelectedDatesProvider>
                              <ActiveProvider>
                                <EditingProvider>
                                  <ObjectivesProvider>
                                    <FunnelProvider>
                                      <ToastContainer />
                                      {children}
                                    </FunnelProvider>
                                  </ObjectivesProvider>
                                </EditingProvider>
                              </ActiveProvider>
                            </SelectedDatesProvider>
                          </DateRangeProvider>
                        </DashboardDateRangeProvider>
                      </CampaignProvider>
                    </CampaignSelectionProvider>
                  </VerificationProvider>
                </KpiProvider>
              </CommentProvider>
            </ClientCampaignProvider>
          </Suspense>
        </NewProvider>
      </body>
    </html>
  );
}
