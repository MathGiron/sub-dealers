"use client";

import Image from "next/image";
import Navbar from "@/components/ui/navbar";

const totalPages = 15; // Quantidade total de imagens

export default function Apresentacao() {
  return (
    <div className="flex flex-col">
      {/* Navbar fixa no topo */}
      <Navbar />

      {/* Imagens em sequência full-width */}
      {Array.from({ length: totalPages }, (_, i) => (
        <div key={i} className="w-full">
          <Image
            src={`/apresentacao/pagina${i + 1}.png`}
            alt={`Página ${i + 1}`}
            width={1920}
            height={1080}
            className="w-full h-auto"
            priority={i === 0} // prioriza a primeira imagem
          />
        </div>
      ))}
    </div>
  );
}
