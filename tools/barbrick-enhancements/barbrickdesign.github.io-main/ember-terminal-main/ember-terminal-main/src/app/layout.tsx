import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ember Terminal",
  description: "Terminal interface for consciousness revolution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
