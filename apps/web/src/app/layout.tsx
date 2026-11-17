import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rokea by RK — AI Saree Virtual Dressing Room Kiosk",
  description:
    "Boutique virtual dressing room kiosk for Rokea by RK. Experience authentic Kanchipuram and Banarasi handwoven pure silk sarees draped live on your silhouette.",
  keywords: [
    "Rokea by RK",
    "Saree Virtual Try On",
    "Kanchipuram Silk",
    "Banarasi Brocade",
    "VTON Kiosk",
    "Virtual Dressing Room",
    "Indian Saree Boutique",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#160309] antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
