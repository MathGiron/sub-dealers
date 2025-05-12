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
  group: string
}

const data: Manual[] = [
  {
    category: "Manual",
    title: "River 2",
    src: "/manuais/river/EF River 2 - Capa.png",
    pdfPath: "/manuais/river/EF River 2 - manual.pdf",
    group: "River",
  },
  {
    category: "Manual",
    title: "River 2 Pro",
    src: "/manuais/river/EF River 2 Pro - Capa.png",
    pdfPath: "/manuais/river/EF River 2 Pro - manual.pdf",
    group: "River",
  },
  {
    category: "Manual",
    title: "River 2 Max",
    src: "/manuais/river/EF River 2 Max - Capa.png",
    pdfPath: "/manuais/river/EF River 2 Max - manual.pdf",
    group: "River",
  },
  {
    category: "Manual",
    title: "River 3",
    src: "/manuais/river/EF River 3 - Capa.png",
    pdfPath: "/manuais/river/EF River 3 - manual.pdf",
    group: "River",
  },
  {
    category: "Manual",
    title: "River 3 Plus",
    src: "/manuais/river/EF River 3 Plus - Capa.png",
    pdfPath: "/manuais/river/EF River 3 Plus - manual.pdf",
    group: "River",
  },
  {
    category: "Manual",
    title: "River 3 Plus Bateria Extra",
    src: "/manuais/river/EF River 3 Plus Bateria Extra - Capa.png",
    pdfPath: "/manuais/river/EF River 3 Plus Bateria Extra - manual.pdf",
    group: "River",
  },
  {
    category: "Manual",
    title: "Delta Pro",
    src: "/manuais/delta/EF Delta Pro - Capa.png",
    pdfPath: "/manuais/delta/Delta Pro - manual.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Delta Pro ULTRA",
    src: "/manuais/delta/EcoFlow Delta Pro ULTRA - Capa.png",
    pdfPath: "/manuais/delta/EcoFlow Delta Pro ULTRA - manual.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Delta Pro ULTRA Bateria",
    src: "/manuais/delta/EcoFlow Delta Pro ULTRA Bateria - Capa.png",
    pdfPath: "/manuais/delta/EcoFlow Delta Pro ULTRA Bateria - manual.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Delta 2",
    src: "/manuais/delta/EF Delta 2 - Capa.png",
    pdfPath: "/manuais/delta/Delta 2 - manual.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Delta 2 Max",
    src: "/manuais/delta/EF Delta 2 Max - Capa.png",
    pdfPath: "/manuais/delta/Delta Pro - manual.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Delta 2 Max Bateria Extra",
    src: "/manuais/delta/EF Delta 2 Max Bateria Extra - Capa.png",
    pdfPath: "/manuais/delta/Delta Pro - manual.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Delta 2 Max Aplicativo",
    src: "/manuais/delta/EF Delta 2 Max - Capa.png",
    pdfPath: "/manuais/delta/EF Delta 2 Max  APP - manual.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Delta Pro 3 (EN-US)",
    src: "/manuais/delta/Delta Pro 3 - Capa.png",
    pdfPath: "/manuais/delta/Delta Pro 3 - manual EN-US.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Delta Pro 3 Extra Battery (EN-US)",
    src: "/manuais/delta/Delta Pro 3 Extra Battery - Capa.png",
    pdfPath: "/manuais/delta/Delta Pro 3 Extra Battery - Manual  EN-US.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Gerador Inteligente",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Gerador Inteligente - Capa.webp",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Gerador Inteligente - Manual.pdf",
    group: "Outros",
  },
  {
    category: "Manual",
    title: "Glacier",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Glacier - Capa.jpg",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Glacier - Manual.pdf",
    group: "Wave e Glacier",
  },
  {
    category: "Manual",
    title: "Glacier Bateria Plug-In",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Glacier Bateria plug-in - Capa.jpg",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Glacier Bateria plug-in - Manual.pdf",
    group: "Wave e Glacier",
  },
  {
    category: "Manual",
    title: "WAVE 2",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Wave 2 - Capa.jpg",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Wave 2 - Manual.pdf",
    group: "Wave e Glacier",
  },
  {
    category: "Manual",
    title: "WAVE 2 Add-On Bateria (EN-US)",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Wave 2 Add-on Battery - Capa.webp",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Wave 2 Add-on Battery - Manual V1 (EN).pdf",
    group: "Wave e Glacier",
  },
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

  // Agrupar manuais por categoria (group)
  const groupedManuals = data.reduce((acc, manual) => {
    const group = manual.group
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(manual)
    return acc
  }, {} as Record<string, Manual[]>)

  // Ordenar os grupos (opcional, para exibir em uma ordem específica)
  const orderedGroups = ["River", "Delta", "Wave e Glacier", "Outros"]

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-200 font-sans mb-10">
        Manuais Disponíveis
      </h2>
      {orderedGroups.map((group) => (
        <section key={group} className="mb-12">
          <h3 className="text-2xl md:text-3xl font-semibold text-white pl-4 mb-6">
            {group}
          </h3>
          <Carousel
            items={groupedManuals[group].map((card, index) => (
              <div key={card.src} className="flex flex-col items-center">
                <Card card={card} index={index} />
                <Button
                  onClick={() => handleDownload(card.pdfPath, card.title + ".pdf")}
                  className=" bg-gray-800 text-white hover:bg-gray-700 rounded-full" // Aumentado mt-6 e rounded-full
                >
                  <Download className="mr-2 h-4 w-4" /> Baixar PDF
                </Button>
              </div>
            ))}
          />
        </section>
      ))}
    </div>
  )
}