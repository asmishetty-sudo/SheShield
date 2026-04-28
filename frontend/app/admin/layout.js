import { AdminProvider } from "@/contexts/AdminContext";

export const metadata = {
  title: "Admin Dashboard - SheShield",
  description: "Your Personal Safety Companion. Real-time location tracking, instant SOS alerts, and trusted contact management for your safety.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <AdminProvider>
      <div >
      {children}
      </div>
      </AdminProvider>
    </>
  );
}
