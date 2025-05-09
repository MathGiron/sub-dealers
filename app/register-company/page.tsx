"use client";

import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Navbar from "@/components/navbar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RegisterCompanyFormData {
  cnpj: string;
  cep: string;
  name: string;
  companyName: string;
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

const isValidCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/[^\d]/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
};

export default function RegisterCompany() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterCompanyFormData>();
  const [cnpjInput, setCnpjInput] = useState("");
  const [cepInput, setCepInput] = useState("");

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 14);

    let formatted = "";
    for (let i = 0; i < limited.length; i++) {
      if (i === 2 || i === 5) {
        formatted += "." + limited[i];
      } else if (i === 8) {
        formatted += "/" + limited[i];
      } else if (i === 12) {
        formatted += "-" + limited[i];
      } else {
        formatted += limited[i];
      }
    }

    return formatted;
  };

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 8);
    let formatted = limited;
    if (limited.length > 5) formatted = limited.slice(0, 5) + "-" + limited.slice(5);
    return formatted;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatCNPJ(rawValue);
    setCnpjInput(formattedValue);
    setValue("cnpj", formattedValue, { shouldValidate: true });
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatCEP(rawValue);
    setCepInput(formattedValue);
    setValue("cep", formattedValue, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterCompanyFormData) => {
    if (isLoaded && user) {
      await user.update({
        unsafeMetadata: {
          cnpj: data.cnpj,
          cep: data.cep,
          name: data.name,
          companyName: data.companyName,
        },
      });
      router.push("/dashboard");
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto w-full max-w-md p-6 py-40 flex justify-center">
        <div className="shadow-input w-full rounded-none bg-black p-4 md:rounded-2xl md:p-8 dark:bg-black border border-gray-300">
          <h2 className="text-xl font-bold text-neutral-200">
            Cadastro de Revendedora
          </h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-300">
            Preencha os dados para se tornar uma revendedora.
          </p>

          <form className="my-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <LabelInputContainer>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                {...register("cnpj", { 
                  required: "CNPJ é obrigatório", 
                  pattern: {
                    value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                    message: "Formato de CNPJ inválido (ex.: 12.345.678/0001-90)"
                  },
                  validate: (value) => isValidCNPJ(value) || "CNPJ inválido"
                })}
                value={cnpjInput}
                onChange={handleCNPJChange}
                maxLength={18}
                placeholder="12.345.678/0001-90"
                className="bg-black text-white border-gray-300"
              />
              {errors.cnpj?.message && (
                <p className="text-red-500 text-sm">{errors.cnpj.message}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                {...register("cep", { 
                  required: "CEP é obrigatório", 
                  pattern: {
                    value: /^\d{5}-\d{3}$/,
                    message: "Formato de CEP inválido (ex.: 12345-678)"
                  }
                })}
                value={cepInput}
                onChange={handleCEPChange}
                maxLength={9}
                placeholder="12345-678"
                className="bg-black text-white border-gray-300"
              />
              {errors.cep?.message && (
                <p className="text-red-500 text-sm">{errors.cep.message}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="name">Nome do Contato</Label>
              <Input
                id="name"
                {...register("name", { required: "Nome é obrigatório" })}
                placeholder="Seu nome"
                className="bg-black text-white border-gray-300"
              />
              {errors.name?.message && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                {...register("companyName", { required: "Nome da empresa é obrigatório" })}
                placeholder="Nome da empresa"
                className="bg-black text-white border-gray-300"
              />
              {errors.companyName?.message && (
                <p className="text-red-500 text-sm">{errors.companyName.message}</p>
              )}
            </LabelInputContainer>

            <button
              className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
              type="submit"
            >
              Cadastrar →
              <BottomGradient />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}