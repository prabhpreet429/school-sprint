import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardWrapper from "@/app/dashboardWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SchoolSprint",
  description: "School Management System",
  icons: {
    icon: "/schoolsprint-logo.png",
    shortcut: "/schoolsprint-logo.png",
    apple: "/schoolsprint-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className}
      >
        <AuthProvider>
          <DashboardWrapper>
            {children}
          </DashboardWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
