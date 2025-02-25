import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ActiveProvider } from "./utils/ActiveContext";
import { DateRangeProvider } from "../src/date-range-context";
import { FunnelProvider } from "./utils/FunnelContextType";

// Load Roboto font
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: "400",
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
      <body className={`${roboto.variable} antialiased`}>
        <ActiveProvider>
          <FunnelProvider>
            <DateRangeProvider>
              {children}
            </DateRangeProvider>
          </FunnelProvider>
        </ActiveProvider>
      </body>
    </html>
  );
}
