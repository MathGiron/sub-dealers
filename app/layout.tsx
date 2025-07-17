import { Inter } from "next/font/google";
import "./globals.css";
import ClerkProviderWrapper from "@/components/ClerkProviderWrapper";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/ui/footer";
import { cn } from "@/lib/utils";

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
    <html lang="pt-BR" className="dark">
      <body className={cn(inter.className)}>
        <ClerkProviderWrapper>
          <div className="relative min-h-screen">
            {children}
            <Toaster />
            <Footer />
          </div>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}