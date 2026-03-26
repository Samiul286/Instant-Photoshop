import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Passport Photo Pro",
  description: "Create perfect passport photos in seconds. Upload your photo, we'll remove the background, enhance it, and generate a print-ready sheet.",
  keywords: ["passport photo", "photo generator", "ID photo", "visa photo"],
  icons: {
    icon: "https://res.cloudinary.com/dcajb02df/image/upload/v1753960691/logo_pyncju.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
