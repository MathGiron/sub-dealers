"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/nextjs";
import React from "react";
import { HoverBorderGradient } from "@/components/acertenity/hover-border-gradient";
import { useRouter } from "next/navigation";
import { isValidCNPJ } from "@/lib/cnpj";

const Navbar: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const hasValidCNPJ = isLoaded && user && user.unsafeMetadata?.cnpj && isValidCNPJ(user.unsafeMetadata.cnpj as string);

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-4 bg-transparent backdrop-blur-md z-60">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Image
            src="/WT.png"
            alt="Timber EcoFlow Logo"
            width={150}
            height={40}
            className="object-contain"
          />
        </Link>
        <Link href="/manuais" className="relative">
          <HoverBorderGradient
            className="px-4 py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700"
          >
            <span className="hidden md:inline">Manuais</span>
            <Image
              src="/manuais.svg"
              alt="Manuais"
              width={28}
              height={28}
              className="md:hidden block mx-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </HoverBorderGradient>
        </Link>
        <Link href="/apresentacao" className="relative">
          <HoverBorderGradient
            className="px-4 py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700"
          >
            <span className="hidden md:inline">Catálogo</span>
            <Image
              src="/catalogo.svg" // Substitua por um ícone de catálogo, se disponível
              alt="Catálogo" // Atualizado para refletir o texto visível
              width={28}
              height={28}
              className="md:hidden block mx-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </HoverBorderGradient>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <HoverBorderGradient
              className="px-4 py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700"
            >
              <span>Login</span>
            </HoverBorderGradient>
          </SignInButton>
          <SignUpButton mode="modal">
            <HoverBorderGradient
              className="px-4 py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700"
            >
              <span>Sign Up</span>
            </HoverBorderGradient>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10",
              },
            }}
          />
          <Link href="/profile" className="relative">
            <HoverBorderGradient
              className="px-4 py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700"
            >
              <span className="hidden md:inline">Meus Pedidos</span>
              <Image
                src="/meus_pedidos.svg"
                alt="Meus Pedidos"
                width={28}
                height={28}
                className="md:hidden block mx-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </HoverBorderGradient>
          </Link>
          <Link href="/catalogo" className="relative">
            <HoverBorderGradient
              className="px-4 py-2 rounded-full transition duration-200 hover:bg-gray-700 active:bg-gray-700"
            >
              <span className="hidden md:inline">
                {hasValidCNPJ ? "Fazer Pedido" : "Seja um Revendedor"}
              </span>
              <Image
                src="/fazer_pedido.svg"
                alt={hasValidCNPJ ? "Fazer Pedido" : "Seja um Revendedor"}
                width={28}
                height={28}
                className="md:hidden block mx-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </HoverBorderGradient>
          </Link>
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;