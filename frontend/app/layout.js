import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/contexts/UserContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InfoProvider } from "@/contexts/InfoContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SheShield - Your Personal Safety Companion",
  description:
    "Your Personal Safety Companion. Real-time location tracking, instant SOS alerts, and trusted contact management for your safety.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <UserProvider>
        <InfoProvider>
          <body className="min-h-full flex flex-col">
            <Navbar />
            <div className="mt-12">{children}</div>
            <Toaster position="top-right" />
            <Footer />
          </body>
        </InfoProvider>
      </UserProvider>
    </html>
  );
}
