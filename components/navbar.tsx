"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import React from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const Navbar: React.FC = () => {
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
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;