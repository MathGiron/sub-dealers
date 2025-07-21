"use client";

import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isValidCNPJ } from "@/lib/cnpj";
import { RegisterCompanyFormData } from "@/services/index";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [addressInput, setAddressInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [selectedState, setSelectedState] = useState<string>("AC"); // Default para Acre

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
      if (i === 2 || i === 5) formatted += "." + limited[i];
      else if (i === 8) formatted += "/" + limited[i];
      else if (i === 12) formatted += "-" + limited[i];
      else formatted += limited[i];
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
    const limited = cleaned.slice(0, 13);
    if (limited.length !== 13) return limited;
    const formatted = limited.slice(0, 2) + " " + limited.slice(2, 4) + " " + limited.slice(4, 9) + "-" + limited.slice(9, 13);
    return formatted;
  };

  const fetchAddressFromCEP = async (cep: string) => {
    const cleanedCEP = cep.replace(/\D/g, "");
    if (cleanedCEP.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
      const data = await response.json();
      if (!data.erro && data.logradouro) {
        setAddressInput(data.logradouro);
        setValue("address", data.logradouro, { shouldValidate: true });
        console.log("Endereço preenchido automaticamente:", data.logradouro);
      } else {
        console.log("CEP não encontrado ou inválido:", cep);
      }
    } catch (error) {
      console.error("Erro ao buscar endereço pelo CEP:", error);
    }
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
    fetchAddressFromCEP(formattedValue); // Chama a API do ViaCEP
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setAddressInput(rawValue);
    setValue("address", rawValue, { shouldValidate: true });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "").slice(0, 5); // Limita a 5 dígitos
    setNumberInput(rawValue);
    setValue("number", rawValue, { shouldValidate: true });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanedValue = rawValue.replace(/\D/g, "").slice(0, 13);
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
          address: data.address,
          number: data.number,
          companyName: data.companyName,
          contactNumber: data.contactNumber,
          state: selectedState,
          registerCompany: true,
        },
      });

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
        description: formattedDate,
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });

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
          <h2 className="text-xl font-bold text-neutral-200">Cadastro de Revendedora</h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-300">Preencha os dados para se tornar uma revendedora.</p>

          <form className="my-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <LabelInputContainer>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                {...register("cnpj", {
                  required: "CNPJ é obrigatório",
                  pattern: {
                    value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                    message: "Formato de CNPJ inválido (ex.: 12.345.678/0001-90)",
                  },
                  validate: (value) => isValidCNPJ(value) || "CNPJ inválido",
                })}
                value={cnpjInput}
                onChange={handleCNPJChange}
                maxLength={18}
                placeholder="12.345.678/0001-90"
                className="bg-black text-white border-gray-300"
              />
              {errors.cnpj?.message && <p className="text-red-500 text-sm">{errors.cnpj.message}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                {...register("cep", {
                  required: "CEP é obrigatório",
                  pattern: {
                    value: /^\d{5}-\d{3}$/,
                    message: "Formato de CEP inválido (ex.: 12345-678)",
                  },
                })}
                value={cepInput}
                onChange={handleCEPChange}
                maxLength={9}
                placeholder="12345-678"
                className="bg-black text-white border-gray-300"
              />
              {errors.cep?.message && <p className="text-red-500 text-sm">{errors.cep.message}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    {...register("address", {
                      required: "Endereço é obrigatório",
                    })}
                    value={addressInput}
                    onChange={handleAddressChange}
                    placeholder="Rua Exemplo"
                    className="bg-black text-white border-gray-300"
                  />
                  {errors.address?.message && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                </div>
                <div className="w-20">
                  <Label htmlFor="number">Nº</Label>
                  <Input
                    id="number"
                    {...register("number", {
                      required: "Número é obrigatório",
                      pattern: {
                        value: /^\d{1,5}$/,
                        message: "Número inválido (máximo 5 dígitos)",
                      },
                    })}
                    value={numberInput}
                    onChange={handleNumberChange}
                    placeholder="123"
                    className="bg-black text-white border-gray-300"
                  />
                  {errors.number?.message && <p className="text-red-500 text-sm">{errors.number.message}</p>}
                </div>
              </div>
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                {...register("companyName", { required: "Nome da empresa é obrigatório" })}
                placeholder="Nome da empresa"
                className="bg-black text-white border-gray-300"
              />
              {errors.companyName?.message && <p className="text-red-500 text-sm">{errors.companyName.message}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="contactNumber">Número de Contato</Label>
              <Input
                id="contactNumber"
                {...register("contactNumber", {
                  required: "Número de contato é obrigatório",
                  pattern: {
                    value: /^55\s\d{2}\s\d{5}-\d{4}$/,
                    message: "Formato inválido (ex.: 55 41 99999-9999)",
                  },
                })}
                value={contactInput}
                onChange={handleContactChange}
                maxLength={14}
                placeholder="55 41 99999-9999"
                className="bg-black text-white border-gray-300"
              />
              {errors.contactNumber?.message && <p className="text-red-500 text-sm">{errors.contactNumber.message}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="state">Estado</Label>
              <Select onValueChange={setSelectedState} value={selectedState}>
                <SelectTrigger className="bg-black text-white border-gray-300">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">Acre (AC)</SelectItem>
                  <SelectItem value="AL">Alagoas (AL)</SelectItem>
                  <SelectItem value="AP">Amapá (AP)</SelectItem>
                  <SelectItem value="AM">Amazonas (AM)</SelectItem>
                  <SelectItem value="BA">Bahia (BA)</SelectItem>
                  <SelectItem value="CE">Ceará (CE)</SelectItem>
                  <SelectItem value="DF">Distrito Federal (DF)</SelectItem>
                  <SelectItem value="ES">Espírito Santo (ES)</SelectItem>
                  <SelectItem value="GO">Goiás (GO)</SelectItem>
                  <SelectItem value="MA">Maranhão (MA)</SelectItem>
                  <SelectItem value="MT">Mato Grosso (MT)</SelectItem>
                  <SelectItem value="MS">Mato Grosso do Sul (MS)</SelectItem>
                  <SelectItem value="MG">Minas Gerais (MG)</SelectItem>
                  <SelectItem value="PA">Pará (PA)</SelectItem>
                  <SelectItem value="PB">Paraíba (PB)</SelectItem>
                  <SelectItem value="PR">Paraná (PR)</SelectItem>
                  <SelectItem value="PE">Pernambuco (PE)</SelectItem>
                  <SelectItem value="PI">Piauí (PI)</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro (RJ)</SelectItem>
                  <SelectItem value="RN">Rio Grande do Norte (RN)</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul (RS)</SelectItem>
                  <SelectItem value="RO">Rondônia (RO)</SelectItem>
                  <SelectItem value="RR">Roraima (RR)</SelectItem>
                  <SelectItem value="SC">Santa Catarina (SC)</SelectItem>
                  <SelectItem value="SP">São Paulo (SP)</SelectItem>
                  <SelectItem value="SE">Sergipe (SE)</SelectItem>
                  <SelectItem value="TO">Tocantins (TO)</SelectItem>
                </SelectContent>
              </Select>
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