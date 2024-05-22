import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { TrpcProvider } from "@/utils/trpc-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shorter",
  description: "Short links with zero effort",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrpcProvider>
          <Header />
          <Providers>{children}</Providers>
          <Toaster richColors />
        </TrpcProvider>
      </body>
    </html>
  );
}
