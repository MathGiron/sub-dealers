"use client"

import React, { useEffect, useState } from "react"
import { Carousel, Card } from "@/components/ui/apple-cards-carousel"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { getItem, setItem } from "@/lib/indexedDb"
import { NumberTicker } from "@/components/magicui/number-ticker"
import type { FAQProduct } from "@/types/business"

const data: FAQProduct[] = [
  // Estações de Energia - Delta
  {
    category: "FAQ",
    title: "Delta Pro",
    src: "/faq/Estações de Energia/Delta/delta pro/EF Delta Pro - Capa.png",
    group: "Delta",
    pdfs: [
      {
        name: "127V (US)",
        path: "/faq/Estações de Energia/Delta/delta pro/FAQ - DPRO - 127V (US).REV00.pdf"
      },
      {
        name: "220V (EU)",
        path: "/faq/Estações de Energia/Delta/delta pro/FAQ - DPRO - 220V (EU).REV00.pdf"
      }
    ]
  },
  {
    category: "FAQ",
    title: "Delta Pro ULTRA",
    src: "/faq/Estações de Energia/Delta/delta pro ultra/Ecoflow Delta PRO ULTRA Bateria - Capa.png",
    group: "Delta",
    pdfs: [
      {
        name: "127V (US)",
        path: "/faq/Estações de Energia/Delta/delta pro/FAQ - DPRO ULTRA INV. - 127V (US).REV00.pdf"
      }
    ]
  },
  {
    category: "FAQ",
    title: "Delta Pro 3",
    src: "/faq/Estações de Energia/Delta/delta pro 3/Delta Pro 3 - Capa.png",
    group: "Delta",
    pdfs: [
      {
        name: "127V (US)",
        path: "/faq/Estações de Energia/Delta/delta pro/FAQ - DPRO 3 - 127V (US).REV00.pdf"
      }
    ]
  },
  // Delta 2
  {
    category: "FAQ",
    title: "Delta 2",
    src: "/faq/Estações de Energia/Delta/delta 2/EF Delta 2 - Capa.png",
    group: "Delta",
    pdfs: [
      {
        name: "127V (US)",
        path: "/faq/Estações de Energia/Delta/delta 2/FAQ - D2 - 127V (US).REV00.pdf"
      },
      {
        name: "220V (BR)",
        path: "/faq/Estações de Energia/Delta/delta 2/FAQ - D2 - 220V (BR).REV00.pdf"
      }
    ]
  },
  // Delta 2 Max
  {
    category: "FAQ",
    title: "Delta 2 Max",
    src: "/faq/Estações de Energia/Delta/delta 2 max/EF Delta 2 Max - Capa.png",
    group: "Delta",
    pdfs: [
      {
        name: "127V (US)",
        path: "/faq/Estações de Energia/Delta/delta 2 max/FAQ - D2 MAX - 127V (US).REV00.pdf"
      },
      {
        name: "220V (EU)",
        path: "/faq/Estações de Energia/Delta/delta 2 max/FAQ - D2 MAX - 220V (EU).REV00.pdf"
      }
    ]
  },
  // Delta 3
  {
    category: "FAQ",
    title: "Delta 3",
    src: "/faq/Estações de Energia/Delta/delta 3/Delta Pro 3 - Capa.png",
    group: "Delta",
    pdfs: [
      {
        name: "127V (BR)",
        path: "/faq/Estações de Energia/Delta/delta 3/FAQ - D3 - 127V (BR).REV00.pdf"
      }
    ]
  },
  // E-Series
  {
    category: "FAQ",
    title: "E980",
    src: "/faq/Estações de Energia/E-Series/e980.png",
    group: "E-Series",
    pdfs: [
      {
        name: "127V (BR)",
        path: "/faq/Estações de Energia/E-Series/FAQ - E980 - 127V (BR).REV00.pdf"
      }
    ]
  },
  // River
  {
    category: "FAQ",
    title: "River 2",
    src: "/faq/Estações de Energia/River/river 2/EF River 2 - Capa.png",
    group: "River",
    pdfs: [
      {
        name: "127V (US)",
        path: "/faq/Estações de Energia/River/river 2/FAQ - R2 - 127V (US).REV00.pdf"
      },
      {
        name: "220V (EU)",
        path: "/faq/Estações de Energia/River/river 2/FAQ - R2 - 220V (EU).REV00.pdf"
      }
    ]
  },
  {
    category: "FAQ",
    title: "River 2 Max",
    src: "/faq/Estações de Energia/River/river 2 max/EF River 2 Max - Capa.png",
    group: "River",
    pdfs: [
      {
        name: "127V (US)",
        path: "/faq/Estações de Energia/River/river 2 max/FAQ - R2 MAX - 127V (US).REV00.pdf"
      },
      {
        name: "220V (EU)",
        path: "/faq/Estações de Energia/River/river 2 max/FAQ - R2 MAX - 220V (EU).REV00.pdf"
      }
    ]
  },
  {
    category: "FAQ",
    title: "River 2 Pro",
    src: "/faq/Estações de Energia/River/river 2 pro/EF River 2 Pro - Capa.png",
    group: "River",
    pdfs: [
      {
        name: "127V (US)",
        path: "/faq/Estações de Energia/River/river 2 pro/FAQ - R2 PRO - 127V (US).REV00.pdf"
      },
      {
        name: "220V (EU)",
        path: "/faq/Estações de Energia/River/river 2 pro/FAQ - R2 PRO - 220V (EU).REV00.pdf"
      }
    ]
  },
  {
    category: "FAQ",
    title: "River 3 Plus",
    src: "/faq/Estações de Energia/River/river 3 plus/EF River 3 Plus Bateria Extra - Capa.png",
    group: "River",
    pdfs: [
      {
        name: "127V (US)",
        path: "/faq/Estações de Energia/River/river 3 plus/FAQ - R3 PLUS - 127V (US).REV00.pdf"
      }
    ]
  },
  // Baterias Extras - Delta
  {
    category: "FAQ",
    title: "Delta 2 Max - Bateria Extra",
    src: "/faq/Baterias Extras/Delta/delta 2 max/EF Delta 2 Max Bateria Extra - Capa.png",
    group: "Baterias Extras",
    pdfs: [
      {
        name: "FAQ",
        path: "/faq/Baterias Extras/Delta/delta 2 max/FAQ - D2 MAX - EB.REV00.pdf"
      }
    ]
  },
  {
    category: "FAQ",
    title: "Delta 3 - Bateria Extra",
    src: "/faq/Baterias Extras/Delta/delta 3/Delta Pro 3 Extra Battery - Capa.png",
    group: "Baterias Extras",
    pdfs: [
      {
        name: "FAQ",
        path: "/faq/Baterias Extras/Delta/delta 3/FAQ - D3 - EB.REV00.pdf"
      }
    ]
  },
  {
    category: "FAQ",
    title: "Delta Pro - Bateria Extra",
    src: "/faq/Baterias Extras/Delta/delta pro/EF Delta Pro - Capa.png",
    group: "Baterias Extras",
    pdfs: [
      {
        name: "FAQ",
        path: "/faq/Baterias Extras/Delta/delta pro/FAQ - DPRO - EB.REV00.pdf"
      }
    ]
  },
  {
    category: "FAQ",
    title: "Delta Pro Ultra - Bateria Extra",
    src: "/faq/Baterias Extras/Delta/delta pro ultra/Ecoflow Delta PRO ULTRA Bateria - Capa.png",
    group: "Baterias Extras",
    pdfs: [
      {
        name: "FAQ",
        path: "/faq/Baterias Extras/Delta/delta pro ultra/FAQ - DPRO ULTRA - EB.REV00.pdf"
      }
    ]
  },
  // Baterias Extras - River
  {
    category: "FAQ",
    title: "River 3 Plus - Bateria Extra",
    src: "/faq/Baterias Extras/River/river 3 plus/EF River 3 Plus Bateria Extra - Capa.png",
    group: "Baterias Extras",
    pdfs: [
      {
        name: "EB300",
        path: "/faq/Baterias Extras/River/river 3 plus/FAQ - R3 PLUS (EB300).REV00.pdf"
      },
      {
        name: "EB600",
        path: "/faq/Baterias Extras/River/river 3 plus/FAQ - R3 PLUS (EB600).REV00.pdf"
      }
    ]
  },
  // Geradores
  {
    category: "FAQ",
    title: "Smart Generator 3000",
    src: "/faq/Geradores/gen 3000/SMART GEN 3000.png",
    group: "Geradores",
    pdfs: [
      {
        name: "FAQ",
        path: "/faq/Geradores/gen 3000/FAQ - SMART GEN 3000.REV00.pdf"
      }
    ]
  },
  {
    category: "FAQ",
    title: "Smart Generator 4000",
    src: "/faq/Geradores/gen 4000/SMART GEN 4000.png",
    group: "Geradores",
    pdfs: [
      {
        name: "FAQ",
        path: "/faq/Geradores/gen 4000/FAQ - SMART GEN 4000.REV00.pdf"
      }
    ]
  },
  // Painéis Solares
  {
    category: "FAQ",
    title: "Painel Solar 160W (Mono)",
    src: "/faq/Painéis Solares/EF 160W Painel Solar Next Generation - Capa.png",
    group: "Painéis Solares",
    pdfs: [
      {
        name: "FAQ",
        path: "/faq/Painéis Solares/FAQ - PS 160W (Mono).REV00.pdf"
      }
    ]
  },
  // Diversos
  {
    category: "FAQ",
    title: "Alternador Carregador 800W",
    src: "/faq/Diversos/alternador/EF Alternador Carregador 800W - Capa.png",
    group: "Diversos",
    pdfs: [
      {
        name: "FAQ",
        path: "/faq/Diversos/alternador/FAQ - ALT CHARGER.REV00.pdf"
      }
    ]
  },
]

export function FAQsCarousel() {
  const [faqs, setFaqs] = useState<FAQProduct[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      // Tenta buscar do cache
      const cached = await getItem("faqs-list") as FAQProduct[] | null
      if (cached && isMounted) {
        setFaqs(cached)
        setLoading(false)
      }
      // Usa o array data (mock/local)
      if (isMounted) {
        setFaqs(data)
        setItem("faqs-list", data)
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (loading || !faqs) {
    return (
      <div className="flex justify-center items-center h-96 w-full bg-[var(--background)]">
        <NumberTicker value={100} startValue={0} className="text-5xl font-bold text-[var(--primary)]" />
      </div>
    )
  }

  // Agrupar FAQs por categoria (group)
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const group = faq.group
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(faq)
    return acc
  }, {} as Record<string, FAQProduct[]>)

  // Ordenar os grupos (opcional, para exibir em uma ordem específica)
  const orderedGroups = ["Delta", "E-Series", "River", "Baterias Extras", "Geradores", "Painéis Solares", "Diversos"]

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-12 sm:py-16 lg:py-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--card-foreground)] font-sans text-center">
            FAQs Disponíveis
          </h2>
        </div>
        
        {/* Menu de Navegação */}
        <div className="mb-12 lg:mb-16">
          <div className="bg-[var(--card)] rounded-xl p-6 lg:p-8 shadow-lg border border-[var(--border)]">
            <h3 className="text-lg lg:text-xl font-semibold text-[var(--card-foreground)] mb-6 text-center">
              Navegação Rápida
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {orderedGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => scrollToSection(`section-${group.replace(/\s+/g, '-')}`)}
                  className="px-4 py-2 bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] rounded-full text-sm transition-colors duration-200 font-medium"
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Seções de Conteúdo */}
        {orderedGroups.map((group) => (
          <section 
            key={group} 
            id={`section-${group.replace(/\s+/g, '-')}`}
            className="mb-16 lg:mb-20 scroll-mt-24"
          >
            <div className="mb-8 lg:mb-12">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[var(--card-foreground)] text-center">
                {group}
              </h3>
            </div>
            
            <div className="w-full">
              <Carousel
                items={groupedFaqs[group]?.map((product) => (
                  <div key={product.src} className="flex flex-col items-center w-full">
                    <Card card={product} />
                    <div className="flex flex-wrap gap-2 mt-4 justify-center w-full max-w-xs">
                      {product.pdfs.map((pdf, index) => (
                        <Button
                          key={index}
                          onClick={() => handleDownload(pdf.path, `${product.title} - ${pdf.name}.pdf`)}
                          className="bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] rounded-full text-xs px-3 py-1 h-8"
                        >
                          <Download className="mr-1 h-3 w-3" /> {pdf.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
