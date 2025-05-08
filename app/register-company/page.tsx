"use client";

import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import Navbar from "@/components/navbar";

interface RegisterCompanyFormData {
  cnpj: string;
  cep: string;
  name: string;
  companyName: string;
}

export default function RegisterCompany() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterCompanyFormData>();
  const [cnpjInput, setCnpjInput] = useState("");
  const [cepInput, setCepInput] = useState("");

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 14);
    let formatted = limited;
    if (limited.length > 2) formatted = limited.slice(0, 2) + "." + limited.slice(2);
    if (limited.length > 5) formatted = formatted.slice(0, 6) + "." + formatted.slice(6);
    if (limited.length > 8) formatted = formatted.slice(0, 10) + "/" + limited.slice(10);
    if (limited.length > 12) formatted = formatted.slice(0, 15) + "-" + limited.slice(15);
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
      <div className="mx-auto max-w-md p-6 py-40 flex justify-center">
        <Card className="w-full bg-black text-white border-gray-300">
          <CardHeader>
            <CardTitle>Cadastro de Revendedora</CardTitle>
            <CardDescription>Preencha os dados para se tornar uma revendedora.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">CNPJ</label>
                <input
                  {...register("cnpj", { 
                    required: "CNPJ é obrigatório", 
                    pattern: {
                      value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                      message: "Formato de CNPJ inválido (ex.: 12.345.678/0001-90)"
                    }
                  })}
                  value={cnpjInput}
                  onChange={handleCNPJChange}
                  maxLength={18}
                  className="w-full p-2 border border-gray-300 rounded bg-black text-white"
                  placeholder="12.345.678/0001-90"
                />
                {errors.cnpj?.message && (
                  <p className="text-red-500 text-sm">{errors.cnpj.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">CEP</label>
                <input
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
                  className="w-full p-2 border border-gray-300 rounded bg-black text-white"
                  placeholder="12345-678"
                />
                {errors.cep?.message && (
                  <p className="text-red-500 text-sm">{errors.cep.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Nome do Contato</label>
                <input
                  {...register("name", { required: "Nome é obrigatório" })}
                  className="w-full p-2 border border-gray-300 rounded bg-black text-white"
                />
                {errors.name?.message && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Nome da Empresa</label>
                <input
                  {...register("companyName", { required: "Nome da empresa é obrigatório" })}
                  className="w-full p-2 border border-gray-300 rounded bg-black text-white"
                />
                {errors.companyName?.message && (
                  <p className="text-red-500 text-sm">{errors.companyName.message}</p>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <HoverBorderGradient
              onClick={handleSubmit(onSubmit)}
              className=" px-33 py-2 text-lg"
            >
              <span>Cadastrar</span>
            </HoverBorderGradient>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}