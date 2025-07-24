"use client"

import React, { useEffect, useState } from "react"
import { Carousel, Card } from "@/components/ui/apple-cards-carousel"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { getItem, setItem } from "@/lib/indexedDb"
import { NumberTicker } from "@/components/magicui/number-ticker"

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
    pdfPath: "/manuais/river/EF River 3 Plus - Manual.pdf",
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
    src: "/manuais/delta/EcoFlow DELTA PRO ULTRA - Capa.png",
    pdfPath: "/manuais/delta/EcoFlow DELTA PRO ULTRA - Manual.pdf",
    group: "Delta",
  },
  {
    category: "Manual",
    title: "Delta Pro ULTRA Bateria",
    src: "/manuais/delta/Ecoflow Delta PRO ULTRA Bateria - Capa.png",
    pdfPath: "/manuais/delta/EcoFlow DELTA PRO ULTRA Bateria - Manual.pdf",
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
    title: "Glacier",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Glacier - Capa.png",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Glacier - Manual.pdf",
    group: "Wave e Glacier",
  },
  {
    category: "Manual",
    title: "Glacier Bateria Plug-In",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Glacier Bateria plug-in - Capa.png",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Glacier Bateria plug-in - Manual.pdf",
    group: "Wave e Glacier",
  },
  {
    category: "Manual",
    title: "WAVE 2",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Wave 2 - Capa.png",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Wave 2 - Manual.pdf",
    group: "Wave e Glacier",
  },
  {
    category: "Manual",
    title: "WAVE 2 Add-On Bateria (EN-US)",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Wave 2 Add-on Battery - Capa.png",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Wave 2 Add-on Battery - Manual V1 (EN).pdf",
    group: "Wave e Glacier",
  },
  {
    category: "Manual",
    title: "Painel Solar Portatíl 45W",
    src: "/manuais/Painel Solar/EF 45W Painel Solar Portátil - Capa.png",
    pdfPath: "/manuais/Painel Solar/EF 45W Painel Solar Portátil - Manual.pdf",
    group: "Painéis Solares",
  },
  {
    category: "Manual",
    title: "Painel Solar Portatíl 60W",
    src: "/manuais/Painel Solar/EF 60W Portable Solar Panel - Capa.png",
    pdfPath: "/manuais/Painel Solar/EF 60W Portable Solar Panel - Manual.pdf",
    group: "Painéis Solares",
  },
  {
    category: "Manual",
    title: "Painel Solar Portatíl 110W",
    src: "/manuais/Painel Solar/EF 110W Portable Solar Panel - Capa.png",
    pdfPath: "/manuais/Painel Solar/EF 110W Portable Solar Panel - Manual.pdf",
    group: "Painéis Solares",
  },
  {
    category: "Manual",
    title: "Painel Solar Portatíl 160W",
    src: "/manuais/Painel Solar/EF 160W Painel Solar Next Generation - Capa.png",
    pdfPath: "/manuais/Painel Solar/EF 160W Painel Solar Next Generation - Manual.pdf",
    group: "Painéis Solares",
  },
  {
    category: "Manual",
    title: "Painel Solar Portatíl 220W",
    src: "/manuais/Painel Solar/EF 220W Painel Solar Portátil - Capa.png",
    pdfPath: "/manuais/Painel Solar/EF 220W Painel Solar Portátil - Manual.pdf",
    group: "Painéis Solares",
  },
  {
    category: "Manual",
    title: "Painel Solar Portatíl 400W",
    src: "/manuais/Painel Solar/EF 400W Solar Panel - Capa.png",
    pdfPath: "/manuais/Painel Solar/EF 400 Solar Panel - Manual.pdf",
    group: "Painéis Solares",
  },
  {
    category: "Manual",
    title: "Gerador Inteligente",
    src: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Gerador Inteligente - Capa.png",
    pdfPath: "/manuais/EF Wave 2 - Glacier - Gerador Bi-Combustivel/EF Gerador Inteligente - Manual.pdf",
    group: "Outros",
  },
  {
    category: "Manual",
    title: "Altenador Carregador 800W",
    src: "/manuais/EF Alternador Carregador 800W - Capa.png",
    pdfPath: "/manuais/EF Alternador Carregador 800W - Manual.pdf",
    group: "Outros",
  },
]

export function ManualsCarousel() {
  const [manuals, setManuals] = useState<Manual[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      // Tenta buscar do cache
      const cached = await getItem("manuals-list") as Manual[] | null
      if (cached && isMounted) {
        setManuals(cached)
        setLoading(false)
      }
      // Usa o array data (mock/local)
      if (isMounted) {
        setManuals(data)
        setItem("manuals-list", data)
        setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  const handleDownload = (pdfPath: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = pdfPath
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading || !manuals) {
    return (
      <div className="flex justify-center items-center h-96 w-full bg-[var(--background)]">
        <NumberTicker value={100} startValue={0} className="text-5xl font-bold text-[var(--primary)]" />
      </div>
    )
  }

  // Agrupar manuais por categoria (group)
  const groupedManuals = manuals.reduce((acc, manual) => {
    const group = manual.group
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(manual)
    return acc
  }, {} as Record<string, Manual[]>)

  // Ordenar os grupos (opcional, para exibir em uma ordem específica)
  const orderedGroups = ["River", "Delta", "Wave e Glacier", "Painéis Solares", "Outros"]

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-[var(--card-foreground)] font-sans mb-10">
        Manuais Disponíveis
      </h2>
      {orderedGroups.map((group) => (
        <section key={group} className="mb-12">
          <h3 className="text-2xl md:text-3xl font-semibold text-[var(--card-foreground)] pl-4 mb-6">
            {group}
          </h3>
          <Carousel
            items={groupedManuals[group]?.map((card) => (
              <div key={card.src} className="flex flex-col items-center">
                <Card card={card} />
                <Button
                  onClick={() => handleDownload(card.pdfPath, card.title + ".pdf")}
                  className="mt-1 bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] rounded-full"
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