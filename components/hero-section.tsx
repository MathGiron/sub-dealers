"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useScroll, useTransform } from "framer-motion";
import { motion, easeInOut } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";

const HoverBorderGradientDemo = () => {
  return (
    <div className="flex justify-center text-center">
      <div
        className="relative inline-flex items-center justify-center rounded-full overflow-hidden p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
      >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FFDDB7_0%,#FFB7C5_50%,#B1C5FF_100%)]" />
        <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-medium text-white backdrop-blur-3xl">
          <span className="ml-2">QUERO SER UM REVENDEDOR</span>
        </span>
      </div>
    </div>
  );
};

export function HeroSection() {
  const { user, isLoaded } = useUser();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5], [0, -200], { ease: easeInOut });

  const hasRegisteredCompany = isLoaded && user?.unsafeMetadata?.registerCompany === true;

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      ref={ref}
      style={{
        backgroundImage: "url('/banner_homepage.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50" />
      <motion.div
        className="absolute inset-0"
        style={{ y }}
      />
      <div className="relative min-h-screen flex flex-col items-start justify-center text-left px-40 z-10">
        <div className="flex flex-col items-start max-w-[50vw]">
          <motion.h1
            className="text-2xl md:text-4xl font-normal pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              color: "white",
              textTransform: "uppercase",
              fontFamily: "Helvetica Now Display, sans-serif",
              fontSize: "5vw",
              fontWeight: 700,
              lineHeight: "5vw",
            }}
          >
            Bem vindo ao Ecoflow Sub-Dealers
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl font-normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              color: "white",
              letterSpacing: "0.1em",
              textTransform: "none",
              marginTop: 0,
              marginBottom: 0,
              fontFamily: "Helvetica Now Display, sans-serif",
              fontSize: "1.6em",
              fontWeight: 400,
              lineHeight: "1.5em",
            }}
          >
            Energizar um novo mundo, um chamado para o futuro aspiracional, orientado pela tecnologia e ecológico, compartilhado por todos.
          </motion.p>
          <motion.p
            className="text-lg md:text-base font-normal mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              color: "white",
              letterSpacing: "-.01em",
              textTransform: "none",
              marginTop: 0,
              marginBottom: 0,
              fontFamily: "Helvetica Now Display, sans-serif",
              fontSize: "2em",
              fontWeight: 600,
              lineHeight: "2em",
            }}
          >
            Junte-se a nós na revolução verde e tecnológica.
          </motion.p>
        </div>
        <div className="mt-8">
          <SignedOut>
            <SignInButton mode="modal">
              <HoverBorderGradientDemo />
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href={hasRegisteredCompany ? "/catalogo" : "/register-company"}>
              <HoverBorderGradientDemo />
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}