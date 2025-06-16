import { Inter } from "next/font/google";
import "./globals.css";
import ClerkProviderWrapper from "@/components/ClerkProviderWrapper";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";
import { DotPattern } from "@/components/magicui/dot-pattern";
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
    <html lang="pt-BR">
      <body className={cn(inter.className, "bg-black text-white")}>
        <ClerkProviderWrapper>
          <div className="relative min-h-screen">
            <DotPattern
              className={cn(
                "text-white opacity-20",
                "absolute inset-0 h-full w-full z-[-1]"
              )}
            />
            {children}
            <Toaster />
            <Footer />
          </div>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}