"use client";

export default function Footer() {
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Seção de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Contato
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  WhatsApp:{" "}
                  <a
                    href="https://wa.me/5541991175069"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors duration-200 font-medium"
                  >
                    (41) 99117-5069
                  </a>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  E-mail:{" "}
                  <a
                    href="mailto:contato@rodoparana.com.br"
                    className="text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors duration-200 font-medium"
                  >
                    contato@rodoparana.com.br
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Seção de Localização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Localização
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--chart-2)] rounded-full"></div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Av. Juscelino Kubitschek De Oliveira - Ld, 2211 - Loja 8
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--chart-2)] rounded-full"></div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Cidade Industrial de Curitiba, Curitiba - PR, 81270-200
                </p>
              </div>
            </div>
          </div>

          {/* Seção de Horário e Empresa */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Horário de Atendimento
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--chart-3)] rounded-full"></div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Segunda à Sexta, 09:00 às 17:00
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Empresa
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[var(--chart-4)] rounded-full"></div>
                  <p className="text-sm text-[var(--muted-foreground)] font-medium">
                    GRUPO TIMBER<br></br>
                    RODOPARANÁ IMPLEMENTOS RODOVIÁRIOS LTDA.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[var(--chart-4)] rounded-full"></div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    CNPJ: 97.467.856/0010-02
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha separadora */}
        <div className="border-t border-[var(--border)] mt-8 pt-8">
          <div className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} RODOPARANÁ IMPLEMENTOS RODOVIÁRIOS LTDA. 
              <span className="mx-2">•</span>
              Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}