import { Outfit } from "next/font/google";
import "./globals.css";
import ContextProvider from "@/app/lib/ContextProvider";
import Popup from "@/app/UI/Popup";
import Overlays from "@/app/UI/Overlays";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const outfit = Outfit({ 
  subsets: ["latin"], 
  weight: ['300', '400', '500', '600', '700'], 
  style: 'normal',
  display: 'swap' 
});

export const metadata = {
  title: "ngwindsongk-admin",
  description: "Admin dashboard for ngwindsongk", 
};

import AuthProvider from "@/app/context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${outfit.className} bg-gray-100/70`}>
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

