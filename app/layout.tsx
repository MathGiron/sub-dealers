import { Inter } from "next/font/google";
import "./globals.css";
import ClerkProviderWrapper from "@/components/ClerkProviderWrapper";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EcoFlow Shop",
  description: "Loja de soluções de energia sustentável",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClerkProviderWrapper>
          {children}
          <Toaster />
          <Footer />
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}