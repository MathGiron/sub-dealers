"use client";

import { motion } from "framer-motion";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { CheckIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import CrossSquareIcon from "./CrossIcon";
import { Product } from "@/services/shopifyService";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.2 }}
      className={`
        relative p-6 rounded-3xl shadow-lg border
        ${product.highlighted
          ? "border-blue-500 bg-gradient-to-b from-blue-50 dark:from-blue-900/50 to-white dark:to-neutral-900"
          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"}
      `}
    >
      {product.highlighted && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Mais Popular
        </span>
      )}
      <div className="relative h-48 w-full mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <h3 className="text-xl font-bold text-neutral-800 dark:text-white">{product.name}</h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{product.description}</p>
      <ul className="mt-6 space-y-4">
        {product.specs.map((spec) => (
          <li key={spec.name} className="flex items-center">
            {spec.included ? (
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <CrossSquareIcon className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className="text-sm text-neutral-600 dark:text-neutral-400">{spec.name}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className={`
                w-full py-2 px-4 rounded-lg font-medium text-white transition-all duration-300
                ${product.highlighted
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"}
              `}
            >
              {product.buttonText}
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <a
            href={product.href}
            className={`
              block w-full py-2 px-4 rounded-lg font-medium text-white text-center transition-all duration-300
              ${product.highlighted
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"}
            `}
          >
            {product.buttonText}
          </a>
        </SignedIn>
      </div>
    </motion.div>
  );
};

export default ProductCard;