"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useScroll, useTransform } from "framer-motion";
import { motion, easeInOut } from "framer-motion";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { HoverBorderGradient } from "@/components/acertenity/hover-border-gradient";

type HoverBorderGradientDemoProps = React.ComponentProps<typeof HoverBorderGradient> & {
  as?: React.ElementType;
  href?: string;
};

const HoverBorderGradientDemo = ({ as = "button", href, ...props }: HoverBorderGradientDemoProps) => {
  const extraProps = as === "a" && href ? { href } : {};
  return (
    <HoverBorderGradient
      as={as}
      className="cursor-pointer select-none px-6 py-4 text-sm font-medium text-white"
      style={{ minWidth: 220 }}
      {...extraProps}
      {...props}
    >
          <span className="ml-2">QUERO SER UM REVENDEDOR</span>
    </HoverBorderGradient>
  );
};

export function HeroSection() {
  const { user, isLoaded } = useUser();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.3], [0, -150], { ease: easeInOut });

  const hasRegisteredCompany = isLoaded && user?.unsafeMetadata?.registerCompany === true;

  return (
    <div
      className="relative min-h-[50vh] sm:min-h-[50vh] md:min-h-[60vh] lg:min-h-screen w-full overflow-hidden"
      ref={ref}
      style={{
        backgroundImage: "url('/banner_homepage.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70" />
      <motion.div
        className="absolute inset-0"
        style={{ y }}
      />
      <div className="relative min-h-[60vh] sm:min-h-[50vh] md:min-h-[60vh] lg:min-h-screen flex flex-col items-start justify-center text-left px-4 sm:px-8 md:px-16 lg:px-20 z-10">
        <div className="flex flex-col items-start max-w-full sm:max-w-[50vw] md:max-w-[60vw]">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal pb-2 sm:pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              color: "white",
              textTransform: "uppercase",
              fontFamily: "Helvetica Now Display, sans-serif",
              fontWeight: 700,
              lineHeight: "1.2",
            }}
          >
            Bem vindo ao Ecoflow Sub-Dealers
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal mt-2 sm:mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              color: "white",
              textTransform: "none",
              marginTop: 0,
              marginBottom: 0,
              fontFamily: "Helvetica Now Display, sans-serif",
              fontWeight: 400,
              lineHeight: "1.4",
            }}
          >
            Energizar um novo mundo, um chamado para o futuro aspiracional, orientado pela tecnologia e ecológico, compartilhado por todos.
          </motion.p>
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal mt-2 sm:mt-4"
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
              fontWeight: 600,
              lineHeight: "1.4",
            }}
          >
            Junte-se a nós na revolução verde e tecnológica.
          </motion.p>
        </div>
        {/* Botão de revendedor removido conforme solicitado */}
      </div>
    </div>
  );
}