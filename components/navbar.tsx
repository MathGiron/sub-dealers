"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { HoverBorderGradient } from "@/components/acertenity/hover-border-gradient";
import { useRouter } from "next/navigation";
import { isValidCNPJ } from "@/lib/cnpj";

const Navbar: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hasValidCNPJ = isLoaded && user && user.unsafeMetadata?.cnpj && isValidCNPJ(user.unsafeMetadata.cnpj as string);

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-2 sm:px-4 py-2 sm:py-4 bg-transparent backdrop-blur-md z-60">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/">
          <Image
            src="/WT.png"
            alt="Timber EcoFlow Logo"
            width={150}
            height={40}
            className="w-[100px] h-[26px] sm:w-[120px] sm:h-[32px] md:w-[150px] md:h-[40px] object-contain"
          />
        </Link>
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          <Link href="/manuais" className="relative">
            <HoverBorderGradient
              className="px-2 sm:px-4 py-1 sm:py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700 text-sm sm:text-base"
            >
              <span>Manuais</span>
            </HoverBorderGradient>
          </Link>
          <Link href="/apresentacao" className="relative">
            <HoverBorderGradient
              className="px-2 sm:px-4 py-1 sm:py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700 text-sm sm:text-base"
            >
              <span>Catálogo</span>
            </HoverBorderGradient>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <HoverBorderGradient
              className="px-2 sm:px-4 py-1 sm:py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700 text-sm sm:text-base"
            >
              <span>Login</span>
            </HoverBorderGradient>
          </SignInButton>
          <SignUpButton mode="modal">
            <HoverBorderGradient
              className="px-2 sm:px-4 py-1 sm:py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700 text-sm sm:text-base"
            >
              <span>Sign Up</span>
            </HoverBorderGradient>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 sm:w-10 h-8 sm:h-10",
              },
            }}
          />
          <Link href="/profile" className="relative">
            <HoverBorderGradient
              className="px-2 sm:px-4 py-1 sm:py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700 text-sm sm:text-base"
            >
              <span className="hidden md:inline">Meus Pedidos</span>
              <Image
                src="navbar/meus_pedidos.svg"
                alt="Meus Pedidos"
                width={16}
                height={16}
                className="md:hidden block mx-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </HoverBorderGradient>
          </Link>
          <Link href="/catalogo" className="relative">
            <HoverBorderGradient
              className="px-2 sm:px-4 py-1 sm:py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700 text-sm sm:text-base"
            >
              <span className="hidden md:inline">
                {hasValidCNPJ ? "Fazer Pedido" : "Seja um Revendedor"}
              </span>
              <Image
                src="navbar/fazer_pedido.svg"
                alt={hasValidCNPJ ? "Fazer Pedido" : "Seja um Revendedor"}
                width={16}
                height={16}
                className="md:hidden block mx-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </HoverBorderGradient>
          </Link>
        </SignedIn>
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          {isMobileMenuOpen && (
            <div className="absolute top-full right-2 mt-2 bg-gray-900 bg-opacity-80 rounded-lg p-2 shadow-lg">
              <SignedIn>
                <Link
                  href="/profile"
                  className="block text-white py-1 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Meus Pedidos
                </Link>
                <Link
                  href="/catalogo"
                  className="block text-white py-1 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {hasValidCNPJ ? "Fazer Pedido" : "Seja um Revendedor"}
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <span className="block text-white py-1 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </span>
                </SignInButton>
                <SignUpButton mode="modal">
                  <span className="block text-white py-1 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </span>
                </SignUpButton>
              </SignedOut>
              <Link
                href="/manuais"
                className="block text-white py-1 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Manuais
              </Link>
              <Link
                href="/apresentacao"
                className="block text-white py-1 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catálogo
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;