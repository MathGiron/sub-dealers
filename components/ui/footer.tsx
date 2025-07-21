"use client";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Seção de Contato */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-200 mb-3">Contato</h3>
            <p className="text-sm text-neutral-300 mb-2">
              Estamos no WhatsApp:{" "}
              <a
                href="https://wa.me/5541991175069"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                (41) 99117-5069
              </a>
            </p>
            <p className="text-sm text-neutral-300">
              E-mail:{" "}
              <a
                href="mailto:contato@rodoparana.com.br"
                className="text-cyan-400 hover:underline"
              >
                contato@rodoparana.com.br
              </a>
            </p>
          </div>

          {/* Seção de Localização */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-200 mb-3">Localização</h3>
            <p className="text-sm text-neutral-300">
              Av. Juscelino Kubitschek De Oliveira - Ld, 2211 - Loja 8
            </p>
            <p className="text-sm text-neutral-300">
              Cidade Industrial de Curitiba, Curitiba - PR, 81270-200
            </p>
          </div>

          {/* Seção de Horário e Empresa */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-200 mb-3">Horário de Atendimento</h3>
            <p className="text-sm text-neutral-300">Segunda à Sexta, 09:00 às 17:00</p>
            <h3 className="text-lg font-semibold text-neutral-200 mt-4 mb-3">Empresa</h3>
            <p className="text-sm text-neutral-300">
              RODOPARANÁ IMPLEMENTOS RODOVIÁRIOS LTDA.
            </p>
            <p className="text-sm text-neutral-300">CNPJ: 97.467.856/0010-02</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-sm text-neutral-400">
          © {new Date().getFullYear()} RODOPARANÁ IMPLEMENTOS RODOVIÁRIOS LTDA. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}