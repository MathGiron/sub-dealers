"use client";

import { motion } from "framer-motion";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function PricingTable() {
  const plans = [
    {
      name: "Basic",
      price: "$199",
      description: "Perfeito para indivíduos e entusiastas de atividades ao ar livre.",
      features: [
        { name: "Estação de Energia River 2 (256Wh)", included: true },
        { name: "Painel Solar 60W", included: true },
        { name: "Controle por App Inteligente", included: true },
        { name: "Suporte ao Cliente 24/7", included: true },
        { name: "Expansão de Bateria Escalonável", included: false },
        { name: "Suporte Técnico Prioritário", included: false },
      ],
      buttonText: "Comprar Agora",
      href: "/checkout/basic",
    },
    {
      name: "Pro",
      price: "$599",
      description: "Ideal para famílias e pequenas empresas.",
      features: [
        { name: "Estação de Energia Delta 2 (1024Wh)", included: true },
        { name: "Painel Solar 110W", included: true },
        { name: "Controle por App Inteligente", included: true },
        { name: "Suporte ao Cliente 24/7", included: true },
        { name: "Expansão de Bateria Escalonável", included: true },
        { name: "Suporte Técnico Prioritário", included: false },
      ],
      buttonText: "Comprar Agora",
      href: "/checkout/pro",
      highlighted: true, // Destaque para o plano mais popular
    },
    {
      name: "Enterprise",
      price: "Entre em Contato",
      description: "Soluções personalizadas para necessidades de grande escala.",
      features: [
        { name: "Estação de Energia Delta Pro (3600Wh)", included: true },
        { name: "Painel Solar 200W", included: true },
        { name: "Controle por App Inteligente", included: true },
        { name: "Suporte ao Cliente 24/7", included: true },
        { name: "Expansão de Bateria Escalonável", included: true },
        { name: "Suporte Técnico Prioritário", included: true },
      ],
      buttonText: "Fale com Vendas",
      href: "/contact",
    },
  ];

  // Componente SVG inline para o Cross Square
  const CrossSquareIcon = ({ className }: { className?: string }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9 9L15 15M15 9L9 15M4 4H20V20H4V4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="py-20 lg:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-neutral-800 dark:text-white tracking-tight">
          Escolha Seu Plano EcoFlow
        </h2>
        <p className="mt-4 text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Encontre a solução de energia perfeita para suas necessidades, desde aventuras ao ar livre até sistemas de energia de nível empresarial.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.2 }}
            className={`
              relative p-6 rounded-3xl shadow-lg border
              ${plan.highlighted
                ? "border-blue-500 bg-gradient-to-b from-blue-50 dark:from-blue-900/50 to-white dark:to-neutral-900"
                : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"}
            `}
          >
            {plan.highlighted && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Mais Popular
              </span>
            )}
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
              {plan.name}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {plan.description}
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-neutral-800 dark:text-white">
                {plan.price}
              </span>
              {plan.price !== "Entre em Contato" && (
                <span className="text-sm text-neutral-600 dark:text-neutral-400"> / pagamento único</span>
              )}
            </div>
            <ul className="mt-6 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature.name} className="flex items-center">
                  {feature.included ? (
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <CrossSquareIcon className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    className={`
                      w-full py-2 px-4 rounded-lg font-medium text-white transition-all duration-300
                      ${plan.highlighted
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"}
                    `}
                  >
                    {plan.buttonText}
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <a
                  href={plan.href}
                  className={`
                    block w-full py-2 px-4 rounded-lg font-medium text-white text-center transition-all duration-300
                    ${plan.highlighted
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"}
                  `}
                >
                  {plan.buttonText}
                </a>
              </SignedIn>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}