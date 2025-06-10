"use client";

import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isValidCNPJ } from "@/lib/cnpj";
import { RegisterCompanyFormData } from "@/services/index";
import { toast } from "@/components/ui/sonner";

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

export default function RegisterCompany() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterCompanyFormData>();
  const [cnpjInput, setCnpjInput] = useState("");
  const [cepInput, setCepInput] = useState("");
  const [contactInput, setContactInput] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      const storedCNPJ = user.unsafeMetadata?.cnpj as string | undefined;
      if (storedCNPJ && isValidCNPJ(storedCNPJ)) {
        router.push("/catalogo");
      }
    }
  }, [isLoaded, user, router]);

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

  const formatContact = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 13); // 55 + 2 DDD + 9 número = 13 dígitos

    if (limited.length !== 13) {
      return limited; // Retorna sem formatação se não tiver 13 dígitos
    }

    // Aplica a formatação: 55 41 99999-9999
    let formatted = "";
    formatted = limited.slice(0, 2); // 55
    formatted += " " + limited.slice(2, 4); // DDD
    formatted += " " + limited.slice(4, 9); // Primeiros 5 dígitos
    formatted += "-" + limited.slice(9, 13); // Últimos 4 dígitos

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

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanedValue = rawValue.replace(/\D/g, "").slice(0, 13); // Limpa e limita a 13 dígitos
    const formattedValue = formatContact(cleanedValue);
    setContactInput(formattedValue);
    setValue("contactNumber", formattedValue, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterCompanyFormData) => {
    if (isLoaded && user) {
      await user.update({
        unsafeMetadata: {
          cnpj: data.cnpj,
          cep: data.cep,
          companyName: data.companyName,
          contactNumber: data.contactNumber,
          registerCompany: true,
        },
      });

      // Mostrar o toast de sucesso
      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      toast("Cadastro concluído!", {
        description: formattedDate, // Ex.: "Friday, May 23, 2025 at 02:44 PM"
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });

      // Redirecionar pra /catalogo após 1,5 segundos
      setTimeout(() => {
        router.push("/catalogo");
      }, 1500);
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

            <LabelInputContainer>
              <Label htmlFor="contactNumber">Número de Contato</Label>
              <Input
                id="contactNumber"
                {...register("contactNumber", { 
                  required: "Número de contato é obrigatório", 
                  pattern: {
                    value: /^55\s\d{2}\s\d{5}-\d{4}$/,
                    message: "Formato inválido (ex.: 55 41 99999-9999)"
                  }
                })}
                value={contactInput}
                onChange={handleContactChange}
                maxLength={14} // 55 41 99999-9999 = 14 caracteres (incluindo espaços e hífen)
                placeholder="55 41 99999-9999"
                className="bg-black text-white border-gray-300"
              />
              {errors.contactNumber?.message && (
                <p className="text-red-500 text-sm">{errors.contactNumber.message}</p>
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