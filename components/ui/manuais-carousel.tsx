"use client"

import React from "react"
import { Carousel, Card } from "@/components/ui/apple-cards-carousel"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type Manual = {
  category: string
  title: string
  src: string
  pdfPath: string
}

const data: Manual[] = [
    {
        category: "Manual",
        title: "River 2",
        src: "/manuais/river/EF River 2 - Capa.jpg", // Imagem de capa
        pdfPath: "/manuais/river/EF River 2 - manual.pdf", // Caminho do PDF
    },
    {
        category: "Manual",
        title: "River 2 Pro",
        src: "/manuais/river/EF River 2 Pro - Capa.jpg", // Caminho atualizado
        pdfPath: "/manuais/river/EF River 2 Pro - manual.pdf",
    },
    {
        category: "Manual",
        title: "River 2 Max",
        src: "/manuais/river/EF River 2 Max - Capa.jpg", // Caminho atualizado
        pdfPath: "/manuais/river/EF River 2 Max - manual.pdf",
    },
    {
        category: "Manual",
        title: "River 3",
        src: "/manuais/river/EF River 3 - Capa.png", // Caminho atualizado
        pdfPath: "/manuais/river/EF River 3 - manual.pdf",
    },
    {
        category: "Manual",
        title: "River 3 Plus",
        src: "/manuais/river/EF River 3 Plus - Capa.png", // Caminho atualizado
        pdfPath: "/manuais/river/EF River 3 Plus - manual.pdf",
    },
    {
        category: "Manual",
        title: "River 3 Plus Bateria Extra",
        src: "/manuais/river/EF River 3 Plus Bateria Extra - Capa.webp", // Caminho atualizado
        pdfPath: "/manuais/river/EF River 3 Plus Bateria Extra - manual.pdf",
    },
    {
        category: "Manual",
        title: "Delta Pro",
        src: "/manuais/delta/EF Delta Pro - Capa.webp", // Caminho atualizado
        pdfPath: "/manuais/delta/Delta Pro - manual.pdf",
    },
    {
      category: "Manual",
      title: "Delta Pro ULTRA",
      src: "/manuais/delta/EcoFlow Delta Pro ULTRA - Capa.png", // Caminho atualizado
      pdfPath: "/manuais/delta/EcoFlow Delta Pro ULTRA - manual.pdf",
  },
  {
    category: "Manual",
    title: "Delta Pro ULTRA Bateria",
    src: "/manuais/delta/EcoFlow Delta Pro ULTRA Bateria - Capa.jpg", // Caminho atualizado
    pdfPath: "/manuais/delta/EcoFlow Delta Pro ULTRA Bateria - manual.pdf",
  },
    {
      category: "Manual",
      title: "Delta 2",
      src: "/manuais/delta/EF Delta 2 - Capa.png", // Caminho atualizado
      pdfPath: "/manuais/delta/Delta 2 - manual.pdf",
  },
  {
    category: "Manual",
    title: "Delta 2 Max",
    src: "/manuais/delta/EF Delta 2 Max - Capa.jpg", // Caminho atualizado
    pdfPath: "/manuais/delta/Delta Pro - manual.pdf",
},
{
  category: "Manual",
  title: "Delta 2 Max Bateria Extra",
  src: "/manuais/delta/EF Delta 2 Max Bateria Extra - Capa.webp", // Caminho atualizado
  pdfPath: "/manuais/delta/Delta Pro - manual.pdf",
},
{
  category: "Manual",
  title: "Delta 2 Max Aplicativo",
  src: "/manuais/delta/EF Delta 2 Max - Capa.jpg", // Caminho atualizado
  pdfPath: "/manuais/delta/EF Delta 2 Max  APP - manual.pdf",
},
{
  category: "Manual",
  title: "Delta Pro 3 (EN-US)",
  src: "/manuais/delta/Delta Pro 3 - Capa.jpg", // Caminho atualizado
  pdfPath: "/manuais/delta/Delta Pro 3 - manual EN-US.pdf",
},
{
  category: "Manual",
  title: "Delta Pro 3 Extra Battery (EN-US)",
  src: "/manuais/delta/Delta Pro 3 Extra Battery - Capa.webp", // Caminho atualizado
  pdfPath: "/manuais/delta/Delta Pro 3 Extra Battery - Manual  EN-US.pdf",
},
    // Adicione mais manuais conforme necessário
]

export function ManualsCarousel() {
  const handleDownload = (pdfPath: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = pdfPath
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const cards = data.map((card, index) => (
    <div key={card.src} className="flex flex-col items-center">
      <Card card={card} index={index} layout={false} />
      <Button
        onClick={() => handleDownload(card.pdfPath, card.title + ".pdf")}
        className="mt-4"
      >
        <Download className="mr-2 h-4 w-4" /> Baixar PDF
      </Button>
    </div>
  ))

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-200 font-sans">
        Manuais Disponíveis
      </h2>
      <Carousel items={cards} />
    </div>
  )
}