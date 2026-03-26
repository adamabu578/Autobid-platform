import type { Metadata } from "next";
import { Toaster } from "sonner";
import RootClientWrapper from "./components/Root";
import { ThemeProvider } from "./components/ThemeProvider";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "AutoBids - Premium Car Auctions",
  description: "The premier destination for buying and selling premium automobiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 min-h-screen selection:bg-orange-500/30">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RootClientWrapper>{children}</RootClientWrapper>
          <Toaster theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
