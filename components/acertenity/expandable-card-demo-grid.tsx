"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Product } from "@/services";
import Image from "next/image";

interface ExpandableCardDemoProps {
  products: Product[];
}

export function ExpandableCardDemo({ products }: ExpandableCardDemoProps) {
  const [active, setActive] = useState<Product | boolean | null>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.name}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.05 },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-neutral-800 dark:bg-neutral-700 rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.name}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-neutral-900 dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.name}-${id}`}>
                <Image
                  width={500}
                  height={320}
                  src={active.image}
                  alt={active.name}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-contain bg-neutral-800 dark:bg-neutral-800"
                />
              </motion.div>

              <div className="flex flex-col h-full">
                <div className="p-4">
                  <motion.h3
                    layoutId={`title-${active.name}-${id}`}
                    className="font-medium text-neutral-200 dark:text-neutral-200 text-base"
                  >
                    {active.name}
                  </motion.h3>
                  <div className="mt-2 max-h-32 overflow-y-auto text-neutral-400 dark:text-neutral-400 text-base [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]">
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                    >
                      {active.description}
                    </motion.p>
                  </div>
                </div>
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-y-auto px-4 pb-10 text-neutral-400 dark:text-neutral-400 text-xs md:text-sm lg:text-base [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                >
                  <h4 className="font-medium text-neutral-300 dark:text-neutral-300">Variantes:</h4>
                  {active.specs.length > 0 ? (
                    <ul className="list-disc pl-5 mt-2">
                      {active.specs.map((spec, index) => (
                        <li key={index}>
                          {spec.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2">Nenhuma variante disponível.</p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto px-4 py-10 bg-black dark:bg-neutral-900">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-left text-neutral-200 dark:text-neutral-200 mb-8">
          {"Conheça Nossos Produtos"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="inline-block mr-2 "
              >
                {word}
              </motion.span>
            ))}
        </h2>
        <ul className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-start gap-4">
          {products.map((product) => (
            <motion.div
              layoutId={`card-${product.name}-${id}`}
              key={product.id}
              onClick={() => setActive(product)}
              className="p-4 flex flex-col hover:border-1 hover:border-white rounded-xl cursor-pointer"
            >
              <div className="flex gap-4 flex-col w-full">
                <motion.div layoutId={`image-${product.name}-${id}`}>
                  <Image
                    width={300}
                    height={240}
                    src={product.image}
                    alt={product.name}
                    className="h-60 w-full  rounded-lg object-contain bg-neutral-800 dark:bg-neutral-800"
                  />
                </motion.div>
                <div className="flex justify-center items-center flex-col">
                  <motion.h3
                    layoutId={`title-${product.name}-${id}`}
                    className="font-medium text-neutral-200 dark:text-neutral-200 text-center md:text-left text-base"
                  >
                    {product.name}
                  </motion.h3>
                </div>
              </div>
            </motion.div>
          ))}
        </ul>
      </div>
    </>
  );
}

export function CloseIcon() {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.05 },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-white dark:text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
}