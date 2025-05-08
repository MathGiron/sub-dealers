"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import React from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  const handleBecomeReseller = () => {
    if (isLoaded) {
      if (userId) {
        router.push("/register-company"); // Redireciona para o registro se logado
      } else {
        // Se não logado, ativa o modal de login
        SignInButton();
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-4 bg-transparent backdrop-blur-md z-50">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image
            src="/WT.png"
            alt="Timber EcoFlow Logo"
            width={150}
            height={40}
            className="object-contain"
          />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <HoverBorderGradient>
              <span>Login</span>
            </HoverBorderGradient>
          </SignInButton>
          <SignUpButton mode="modal">
            <HoverBorderGradient>
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
          <HoverBorderGradient onClick={handleBecomeReseller}>
            <span>Seja um Revendedor</span>
          </HoverBorderGradient>
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;