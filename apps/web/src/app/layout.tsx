import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@lro-ui/sonner";
import { Header } from "../@components/layout/header";
import { ComfyUiContextProvider } from "../modules/comfy-ui/comfy-ui-context";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-dvh text-foreground`}>
        <Providers>
          <ComfyUiContextProvider>
            <Toaster />
            <div className="flex flex-col min-h-dvh h-dvh">
              <header className="w-full sticky top-0 z-10 bg-background h-[var(--header-height)] ">
                <Header />
              </header>
              <main className="grow">{children}</main>
            </div>
          </ComfyUiContextProvider>
        </Providers>
      </body>
    </html>
  );
}
