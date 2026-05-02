import { Lato } from "next/font/google";
import "./globals.css";
import ContextProvider from "@/app/lib/ContextProvider";
import Popup from "@/app/UI/Popup";
import Overlays from "@/app/UI/Overlays";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const lato = Lato({ 
  subsets: ["latin"], 
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"] 
});

export const metadata = {
  title: "ngwindsongk-admin",
  description: "Admin dashboard for ngwindsongk", 
};

import AuthProvider from "@/app/context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${lato.className} bg-gray-100/70`}>
        <>
          <Analytics />
          <SpeedInsights />
          <AuthProvider>
            <ContextProvider>
              {children}
            </ContextProvider>
          </AuthProvider>
          <Popup />
          <Overlays />
        </>
      </body>
    </html>
  );
}

