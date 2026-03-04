import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Paradiso Universo Fragantico | Elegancia en cada gota",
  description: "Descubre nuestra exclusiva colección de perfumes de nicho y diseñador en Paradiso Universo Fragantico.",
};

import { CartProvider } from "@/context/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased text-foreground bg-background">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
