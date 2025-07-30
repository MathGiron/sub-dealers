import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import type { PedidoData } from "@/types/api";

// Função para montar o HTML do pedido usando o template completo
function gerarHtmlPedido(pedido: PedidoData) {
  // Dados da empresa (fixos para Rodoparaná)
  const dadosEmpresa = {
    empresa: "RODOPARANA IMPLEMENTOS RODOVIARIOS LTDA",
    cnpj_empresa: "97.467.856/0010-02",
    contato_empresa: "(41) 99999-9999",
    endereco_empresa: "AV JUSCELINO KUBITSCHEK DE OLIVEIRA, 3.545",
    cidade: "Curitiba",
    uf_empresa: "PR",
    vendedor: "Equipe Comercial Rodoparaná"
  };

  // Dados bancários (fixos para Rodoparaná)
  const dadosBancarios = {
    favorecido: "Rodoparaná Implementos Rodoviários LTDA",
    banco: "Bradesco",
    agencia_conta: "AG: 3645-5 – CC: 888-5",
    cnpj_banco: "97.467.856/0001-03",
    pix: "pix@rodoparana.com.br ou CNPJ – 97.467.856/0001-03"
  };

  // Calcular totais dos produtos
  const subtotal = pedido.products?.reduce((sum: number, product) => {
    const price = product.variantPrice || product.selectedVariant?.price || product.price || 0;
    return sum + (Number(price) * product.quantity);
  }, 0) || 0;

  const frete = pedido.freightCost || 0;
  const taxas = pedido.additionalFees || 0;
  const totalCompleto = subtotal + frete + taxas;

  // Formatar data
  const dataPedido = new Date().toLocaleDateString('pt-BR') + ', ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return `
  <!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8">
    <title>Nota de Pedido - EcoFlow</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
    <style>
      body {
        background-color: #ffffff;
        color: #000;
        font-family: 'Montserrat', sans-serif;
        padding: 20px 15px;
        margin: 0;
        font-size: 10px;
        line-height: 1.3;
      }

      h2 {
        text-align: center;
        font-size: 18px;
        margin-bottom: 12px;
        color: #000;
        margin-top: 0;
      }

      .container {
        max-width: 95%;
        margin: auto;
        background-color: #ffffff;
        padding: 15px;
        
      }

      section {
        margin-bottom: 12px;
      }

      h3 {
        font-size: 14px;
        color: #000;
        border-bottom: 1px solid #333;
        padding-bottom: 4px;
        margin-bottom: 8px;
        margin-top: 0;
      }

      p {
        margin: 3px 0;
        font-size: 10px;
        color: #000;
      }

      label {
        display: block;
        margin-bottom: 3px;
        font-weight: 600;
        font-size: 10px;
        color: #000;
      }

      .item-pedido {
        padding: 10px;
        background-color: #f8f8f8;
        border-radius: 6px;
        margin-bottom: 10px;
        border-left: 2px solid #007acc;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9px;
        margin-top: 4px;
      }

      th, td {
        border: 1px solid #333;
        padding: 4px;
        text-align: left;
        color: #000;
      }

      th {
        background-color: #f0f0f0;
        color: #000;
        font-weight: 600;
      }

      .totais td {
        font-weight: bold;
        color: #000;
      }

      .bold {
        font-weight: 600;
        color: #000;
      }

      .observacao {
        font-size: 9px;
        color: #666;
        margin-top: 8px;
      }

      .observacao p {
        margin: 2px 0;
        font-size: 9px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <h2>Nota de Pedido - Ecoflow</h2>
    <div class="container">
      <section>
        <h3>Dados da Empresa</h3>
        <p><span class="bold">Emitente:</span> ${dadosEmpresa.empresa} | <span class="bold">CNPJ:</span> ${dadosEmpresa.cnpj_empresa}</p>
        <p><span class="bold">Endereço:</span> ${dadosEmpresa.endereco_empresa}, ${dadosEmpresa.cidade} – ${dadosEmpresa.uf_empresa}</p>
        <p><span class="bold">Contato:</span> ${dadosEmpresa.contato_empresa} | <span class="bold">Vendedor:</span> ${dadosEmpresa.vendedor}</p>
      </section>
      <section>
        <h3>Dados do Cliente</h3>
        <p><span class="bold">Nome:</span> ${pedido.clientName || 'Cliente não identificado'} | <span class="bold">CNPJ/CPF:</span> ${pedido.cnpj || 'CNPJ não informado'}</p>
        <p><span class="bold">Contato:</span> ${pedido.contactNumber || 'Número de contato não informado'} | <span class="bold">Data:</span> ${dataPedido}</p>
        <p><span class="bold">Endereço:</span> ${pedido.deliveryAddress || 'Endereço não informado'} | <span class="bold">Estado:</span> ${pedido.state || 'Estado não informado'}</p>
      </section>
      <section>
        <h3>Itens do Pedido</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Descrição</th>
              <th>Quantidade</th>
              <th>Preço Unitário</th>
              <th>Total do Item</th>
            </tr>
          </thead>
          <tbody>
            ${Array.isArray(pedido.products) ? pedido.products.map((product, idx: number) => {
              const price = product.variantPrice || product.selectedVariant?.price || product.price || 0;
              const total = Number(price) * product.quantity;
              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                  <td>R$ ${Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `;
            }).join('') : '<tr><td colspan="5">Nenhum item informado</td></tr>'}
          </tbody>
        </table>
      </section>
      <section>
        <h3>Totais</h3>
        <table class="totais">
          <tr><td>Subtotal</td><td>R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
          <tr><td>Frete Estimado</td><td>R$ ${frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
          <tr><td>Taxas Adicionais</td><td>R$ ${taxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
          <tr><td><strong>Total com Frete e Taxas</strong></td><td><strong>R$ ${totalCompleto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td></tr>
        </table>
      </section>
      <section>
        <h3>Dados Bancários</h3>
        <p><span class="bold">Favorecido:</span> ${dadosBancarios.favorecido} | <span class="bold">Banco:</span> ${dadosBancarios.banco}</p>
        <p><span class="bold">Agência e Conta:</span> ${dadosBancarios.agencia_conta} | <span class="bold">CNPJ:</span> ${dadosBancarios.cnpj_banco}</p>
        <p><span class="bold">PIX:</span> ${dadosBancarios.pix}</p>
      </section>
      <section>
        <h3>Garantias</h3>
        <p><span class="bold">Painéis Solares:</span> 12 Meses | <span class="bold">Linha Delta e River:</span> 24 Meses | <span class="bold">Ar Condicionado Wave 2:</span> 12 Meses</p>
        <p><span class="bold">Geladeira Portátil Glacier:</span> 12 Meses | <span class="bold">Gerador Dual Fuel:</span> 12 Meses</p>
      </section>
      <div class="observacao">
        <p><span class="bold">Validade:</span> 02 dias a contar da data de envio | <span class="bold">Impostos:</span> PIS/COFINS, ICMS e IPI inclusos. Impostos de carga líquida ou diferença de ICMS, se for cobrado, será por conta do cliente.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export async function POST(request: Request) {
  try {
    console.log('[SEND-ORDER] Início do processamento do pedido');
    const pedido = await request.json();
    console.log('[SEND-ORDER] Dados do pedido recebidos:', JSON.stringify(pedido, null, 2));
    // 1. Montar o HTML preenchido
    const html = gerarHtmlPedido(pedido);
    console.log('[SEND-ORDER] HTML do pedido gerado com sucesso');
    // 2. Gerar o PDF com puppeteer
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    console.log('[SEND-ORDER] PDF gerado com sucesso, tamanho:', pdfBuffer.length);
    // 3. Enviar o e-mail com o PDF em anexo (exemplo básico)
    const email = pedido.email || pedido.clientEmail;
    if (!email) {
      console.error('[SEND-ORDER] Campo email não informado no pedido!');
      return NextResponse.json({ error: 'Campo email é obrigatório.' }, { status: 400 });
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('[SEND-ORDER] Iniciando envio de e-mail para:', email);
    await transporter.sendMail({
      from: 'EcoFlow <matheus.giron@grupotimber.com.br>',
      to: email,
      subject: `Nota de Pedido - EcoFlow - ${pedido.idPedido || `pedido_${Date.now()}`}`,
      text: 'Segue em anexo a nota de pedido.',
      attachments: [
        {
          filename: `${pedido.idPedido ? pedido.idPedido : 'nota-pedido'}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf',
        },
      ],
    });
    console.log('[SEND-ORDER] E-mail enviado com sucesso!');
    
    // Gerar link do WhatsApp
    const whatsappMessage = `Oi tudo bem? Realizei o pedido ${pedido.idPedido || `pedido_${Date.now()}`}, gostaria de ser um revendedor!`;
    const whatsappLink = `https://wa.me/5541996698959?text=${encodeURIComponent(whatsappMessage)}`;
    
    return NextResponse.json({ 
      success: true, 
      whatsappLink,
      idPedido: pedido.idPedido || `pedido_${Date.now()}`
    });
  } catch (error) {
    console.error('[SEND-ORDER] Erro ao gerar e enviar PDF:', error);
    return NextResponse.json({ error: 'Erro ao gerar e enviar PDF', detalhe: (error as Error)?.message }, { status: 500 });
  }
}