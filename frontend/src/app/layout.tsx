import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "RescueLink",
  description: "Demostración académica de gRPC: registro de emergencias y ambulancias ficticias.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="flex-1 p-4 sm:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
