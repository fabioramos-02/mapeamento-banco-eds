import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--ds-font-family-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mapeamento do Banco EDS — SETDIG",
  description: "Subsídio para a decisão de migração de dados na transição EDS → XVia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${openSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
