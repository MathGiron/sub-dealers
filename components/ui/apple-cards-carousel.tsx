"use client"

import React, { useEffect, useState, createContext } from "react"
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import Image, { ImageProps } from "next/image"

interface CarouselProps {
  items: React.ReactNode[]
  initialScroll?: number
}

type Card = {
  src: string
  title: string
  category: string
}

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void
  currentIndex: number
}>({
  onCardClose: () => {},
  currentIndex: 0,
})

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll
      checkScrollability()
    }
  }, [initialScroll])

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384
      const gap = isMobile() ? 16 : 24
      const scrollAmount = Math.max(cardWidth + gap, 400)
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384
      const gap = isMobile() ? 16 : 24
      const scrollAmount = Math.max(cardWidth + gap, 400)
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384
      const gap = isMobile() ? 16 : 24
      const scrollPosition = (cardWidth + gap) * (index + 1)
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
      setCurrentIndex(index)
    }
  }

  const isMobile = () => {
    return window && window.innerWidth < 768
  }

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="relative w-full group">
        {/* Container principal do carrossel */}
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          {/* Gradiente esquerdo para indicar mais conteúdo */}
          <div
            className={cn(
              "absolute left-0 top-0 z-10 h-full w-16 md:w-24 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/80 to-transparent pointer-events-none",
              canScrollLeft ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Gradiente direito para indicar mais conteúdo */}
          <div
            className={cn(
              "absolute right-0 top-0 z-10 h-full w-16 md:w-24 bg-gradient-to-l from-[var(--background)] via-[var(--background)]/80 to-transparent pointer-events-none",
              canScrollRight ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Conteúdo dos cards */}
          <div
            className={cn(
              "flex flex-row justify-start gap-6 pl-4",
              "mx-auto max-w-7xl w-full"
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                    once: true,
                  },
                }}
                key={"card" + index}
                className="rounded-3xl last:pr-4 md:last:pr-8"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Botões de navegação - posicionados de forma funcional e responsiva */}
        <div className="absolute inset-y-0 left-4 md:left-8 z-20 flex items-center">
          <button
            className={cn(
              "flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full",
              "bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--border)]",
              "text-[var(--foreground)] shadow-lg transition-all duration-200",
              "hover:bg-[var(--card)] hover:scale-105 hover:shadow-xl",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
              "group-hover:opacity-100 opacity-0 md:opacity-100"
            )}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Rolar para esquerda"
          >
            <IconArrowNarrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-4 md:right-8 z-20 flex items-center">
          <button
            className={cn(
              "flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full",
              "bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--border)]",
              "text-[var(--foreground)] shadow-lg transition-all duration-200",
              "hover:bg-[var(--card)] hover:scale-105 hover:shadow-xl",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
              "group-hover:opacity-100 opacity-0 md:opacity-100"
            )}
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Rolar para direita"
          >
            <IconArrowNarrowRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Indicadores de scroll - opcional para melhor UX */}
        {items.length > 3 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {Array.from({ length: Math.ceil(items.length / 3) }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-200",
                  currentIndex === index 
                    ? "bg-[var(--primary)] w-6" 
                    : "bg-[var(--muted)] hover:bg-[var(--muted-foreground)]"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </CarouselContext.Provider>
  )
}

export const Card = ({ card }: { card: Card }) => {
  return (
    <div className="relative z-10 flex h-56 w-44 flex-col items-center justify-start overflow-hidden rounded-3xl md:h-[28rem] md:w-72 bg-[var(--card)] border border-[var(--border)] shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />
      <div className="relative z-40 p-4 text-center">
        <p className="text-left font-sans text-sm font-medium text-white md:text-base">
          {card.category}
        </p>
        <p className="mt-2 max-w-xs text-center font-sans text-xl font-semibold [text-wrap:balance] text-white md:text-3xl">
          {card.title}
        </p>
      </div>
      <div className="flex-1 w-full flex items-center justify-center pb-2">
        <Image
          src={card.src}
          alt={card.title}
          fill
          className="object-contain w-full h-full rounded border border-[var(--border)]"
          sizes="(max-width: 768px) 176px, 288px"
        />
      </div>
    </div>
  )
}

export const BlurImage = ({ height, width, src, className, alt, ...rest }: ImageProps) => {
  const [isLoading, setLoading] = useState(true)
  return (
    <Image
      className={cn(
        "h-full w-full transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src as string}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={typeof src === "string" ? src : undefined}
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  )
}