import type { Metadata } from "next";
import { Open_Sans, Roboto } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--ds-font-family-body",
  subsets: ["latin"],
});

// Peso 700 real (Roboto não tem 800 nativo) — mesmo peso visual do heading do portal ms.gov.br.
const roboto = Roboto({
  weight: "700",
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mapeamento de Bancos — SETDIG",
  description: "Subsídio para a decisão de migração de dados na transição EDS → XVia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${openSans.variable} ${roboto.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
