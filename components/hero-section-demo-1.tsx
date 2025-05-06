"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScroll, useTransform } from "motion/react";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";

export function GoogleGeminiEffectDemo() {
  const ref = React.useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Ajustar o intervalo para que a animação ocorra mais rápido (em menos scroll)
  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.4], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.4], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.4], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.4], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.4], [0, 1.2]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Configura o IntersectionObserver para iniciar o vídeo quando ele entrar na tela
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasPlayed) {
          video.play().catch((error) => {
            console.error("Erro ao tentar reproduzir o vídeo:", error);
          });
        }
      },
      { threshold: 0.5 } // Inicia quando 50% do vídeo estiver visível
    );

    observer.observe(video);

    // Quando o vídeo terminar, define hasPlayed como true para evitar que ele reinicie
    const handleEnded = () => {
      setHasPlayed(true);
      video.pause();
    };

    video.addEventListener("ended", handleEnded);

    return () => {
      observer.disconnect();
      video.removeEventListener("ended", handleEnded);
    };
  }, [hasPlayed]);

  return (
    <div
      className="h-[200vh] bg-black w-full dark:border dark:border-white/[0.1] relative pt-40 overflow-clip"
      ref={ref}
    >
      <video
        muted
        playsInline
        ref={videoRef}
        className="w-full h-auto absolute top-150 left-0 object-cover z-0"
      >
        <source src="/river_video.webm" type="video/webm" />
        Seu navegador não suporta o elemento de vídeo.
      </video>
      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
      />
    </div>
  );
}