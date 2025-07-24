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
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth)
    }
  }

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: "smooth" })
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
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l from-black to-transparent"
            )}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-6 pl-4",
              "mx-auto max-w-7xl"
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
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>

          {/* Botões de navegação ajustados para ficarem logo acima dos cards */}
          <div className="absolute top-10 right-10 z-50 flex gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            >
              <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
              onClick={scrollRight}
              disabled={!canScrollRight}
            >
              <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </CarouselContext.Provider>
  )
}

export const Card = ({ card }: { card: Card }) => {
  return (
    <div className="relative z-10 flex h-56 w-44 flex-col items-center justify-start overflow-hidden rounded-3xl md:h-[28rem] md:w-72 bg-[var(--card)]">
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