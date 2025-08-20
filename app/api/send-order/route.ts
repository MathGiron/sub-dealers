import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import { jsPDF } from "jspdf";
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

// Função para gerar PDF usando jsPDF (fallback para produção)
function gerarPdfComJsPDF(pedido: PedidoData): Buffer {
  try {
    console.log('[SEND-ORDER] Gerando PDF com jsPDF...');
    
    const doc = new jsPDF();
    
    // Dados da empresa
    doc.setFontSize(20);
    doc.text('Nota de Pedido - Ecoflow', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Dados da Empresa', 20, 40);
    doc.setFontSize(10);
    doc.text('Emitente: RODOPARANA IMPLEMENTOS RODOVIARIOS LTDA', 20, 50);
    doc.text('CNPJ: 97.467.856/0010-02', 20, 57);
    doc.text('Endereço: AV JUSCELINO KUBITSCHEK DE OLIVEIRA, 3.545, Curitiba - PR', 20, 64);
    doc.text('Contato: (41) 99999-9999 | Vendedor: Equipe Comercial Rodoparaná', 20, 71);
    
    // Dados do cliente
    doc.setFontSize(12);
    doc.text('Dados do Cliente', 20, 85);
    doc.setFontSize(10);
    doc.text(`Nome: ${pedido.clientName || 'Cliente não identificado'}`, 20, 95);
    doc.text(`CNPJ/CPF: ${pedido.cnpj || 'CNPJ não informado'}`, 20, 102);
    doc.text(`Contato: ${pedido.contactNumber || 'Número de contato não informado'}`, 20, 109);
    doc.text(`Endereço: ${pedido.deliveryAddress || 'Endereço não informado'}`, 20, 116);
    doc.text(`Estado: ${pedido.state || 'Estado não informado'}`, 20, 123);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR') + ', ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 20, 130);
    
    // Itens do pedido
    doc.setFontSize(12);
    doc.text('Itens do Pedido', 20, 145);
    doc.setFontSize(10);
    
    let yPosition = 155;
    if (Array.isArray(pedido.products) && pedido.products.length > 0) {
      pedido.products.forEach((product, idx) => {
        const price = product.variantPrice || product.selectedVariant?.price || product.price || 0;
        const total = Number(price) * product.quantity;
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`${idx + 1}. ${product.name}`, 20, yPosition);
        doc.text(`Qtd: ${product.quantity} | Preço: R$ ${Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 25, yPosition + 7);
        yPosition += 15;
      });
    } else {
      doc.text('Nenhum item informado', 20, yPosition);
      yPosition += 15;
    }
    
    // Totais
    const subtotal = pedido.products?.reduce((sum: number, product) => {
      const price = product.variantPrice || product.selectedVariant?.price || product.price || 0;
      return sum + (Number(price) * product.quantity);
    }, 0) || 0;
    const frete = pedido.freightCost || 0;
    const taxas = pedido.additionalFees || 0;
    const totalCompleto = subtotal + frete + taxas;
    
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('Totais', 20, yPosition);
    doc.setFontSize(10);
    doc.text(`Subtotal: R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition + 10);
    doc.text(`Frete: R$ ${frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition + 17);
    doc.text(`Taxas: R$ ${taxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition + 24);
    doc.setFontSize(12);
    doc.text(`Total: R$ ${totalCompleto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition + 35);
    
    // Dados bancários
    if (yPosition + 50 > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('Dados Bancários', 20, yPosition + 50);
    doc.setFontSize(10);
    doc.text('Favorecido: Rodoparaná Implementos Rodoviários LTDA', 20, yPosition + 60);
    doc.text('Banco: Bradesco | Agência: 3645-5 | Conta: 888-5', 20, yPosition + 67);
    doc.text('CNPJ: 97.467.856/0001-03 | PIX: pix@rodoparana.com.br', 20, yPosition + 74);
    
    // Garantias
    if (yPosition + 90 > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('Garantias', 20, yPosition + 90);
    doc.setFontSize(10);
    doc.text('Painéis Solares: 12 Meses | Linha Delta e River: 24 Meses', 20, yPosition + 100);
    doc.text('Ar Condicionado Wave 2: 12 Meses | Geladeira Glacier: 12 Meses', 20, yPosition + 107);
    doc.text('Gerador Dual Fuel: 12 Meses', 20, yPosition + 114);
    
    // Observações
    if (yPosition + 130 > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(10);
    doc.text('Validade: 02 dias a contar da data de envio', 20, yPosition + 130);
    doc.text('Impostos: PIS/COFINS, ICMS e IPI inclusos', 20, yPosition + 137);
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('[SEND-ORDER] PDF gerado com jsPDF, tamanho:', pdfBuffer.length);
    
    return pdfBuffer;
  } catch (error) {
    console.error('[SEND-ORDER] Erro ao gerar PDF com jsPDF:', error);
    return Buffer.from('');
  }
}

export async function POST(request: Request) {
  try {
    console.log('[SEND-ORDER] Início do processamento do pedido');
    const pedido = await request.json();
    console.log('[SEND-ORDER] Dados do pedido recebidos:', JSON.stringify(pedido, null, 2));
    
    // 1. Verificar se já temos um PDF enviado pelo cliente
    let pdfBuffer: Buffer = Buffer.from('');
    let pdfGenerated = false;
    
    if (pedido.pdfBuffer) {
      try {
        pdfBuffer = Buffer.from(pedido.pdfBuffer, 'base64');
        console.log('[SEND-ORDER] PDF recebido do cliente, tamanho:', pdfBuffer.length);
        pdfGenerated = true;
      } catch (pdfError) {
        console.error('[SEND-ORDER] Erro ao decodificar PDF do cliente:', pdfError);
      }
    }
    
    // 2. Se não temos PDF do cliente, tentar gerar um
    if (pdfBuffer.length === 0) {
      console.log('[SEND-ORDER] Tentando gerar PDF...');
      
      // Primeiro, tentar com Puppeteer (funciona em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        try {
          console.log('[SEND-ORDER] Ambiente de desenvolvimento detectado, tentando Puppeteer...');
          const html = gerarHtmlPedido(pedido);
          
          const browser = await puppeteer.launch({ 
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--no-first-run",
              "--disable-extensions"
            ],
            headless: true
          });
          
          const page = await browser.newPage();
          await page.setViewport({ width: 1200, height: 800 });
          await page.setContent(html, { waitUntil: 'networkidle0' });
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const pdfData = await page.pdf({ 
            format: 'A4',
            printBackground: true,
            margin: {
              top: '20px',
              right: '20px',
              bottom: '20px',
              left: '20px'
            }
          });
          
          pdfBuffer = Buffer.from(pdfData);
          await browser.close();
          
          if (pdfBuffer.length > 0) {
            console.log('[SEND-ORDER] PDF gerado com Puppeteer, tamanho:', pdfBuffer.length);
            pdfGenerated = true;
          }
        } catch (puppeteerError) {
          console.error('[SEND-ORDER] Puppeteer falhou, tentando jsPDF...', puppeteerError);
        }
      }
      
      // Se Puppeteer falhou ou estamos em produção, usar jsPDF
      if (pdfBuffer.length === 0) {
        console.log('[SEND-ORDER] Usando jsPDF como fallback...');
        pdfBuffer = gerarPdfComJsPDF(pedido);
        
        if (pdfBuffer.length > 0) {
          console.log('[SEND-ORDER] PDF gerado com jsPDF, tamanho:', pdfBuffer.length);
          pdfGenerated = true;
        }
      }
    }
    
    // 3. Enviar e-mails para usuário e remetente
    const email = pedido.email || pedido.clientEmail;
    const senderEmail = process.env.EMAIL_USER;
    
    console.log('[SEND-ORDER] Email do usuário:', email);
    console.log('[SEND-ORDER] Email do remetente:', senderEmail);
    console.log('[SEND-ORDER] EMAIL_USER configurado:', !!process.env.EMAIL_USER);
    console.log('[SEND-ORDER] EMAIL_PASS configurado:', !!process.env.EMAIL_PASS);
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        
        // Preparar anexo do PDF - SÓ ENVIAR SE TIVER CONTEÚDO
        const pdfAttachment = pdfBuffer.length > 0 ? [
          {
            filename: `nota-pedido-${pedido.idPedido || `pedido_${Date.now()}`}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ] : [];
        
        console.log('[SEND-ORDER] Anexo preparado, tamanho:', pdfAttachment.length);
        console.log('[SEND-ORDER] PDF buffer tamanho:', pdfBuffer.length);
        
        // Enviar email para o usuário (destinatário)
        if (email) {
          console.log('[SEND-ORDER] Iniciando envio de e-mail para usuário:', email);
          await transporter.sendMail({
            from: `EcoFlow <${senderEmail}>`,
            to: email,
            subject: `Nota de Pedido - EcoFlow - ${pedido.idPedido || `pedido_${Date.now()}`}`,
            html: `
              <h2>Nota de Pedido - EcoFlow</h2>
              <p>Olá ${pedido.clientName || 'Cliente'}!</p>
              <p>Segue em anexo a nota de pedido com todos os detalhes.</p>
              <p>Obrigado por escolher a EcoFlow!</p>
              ${!pdfGenerated ? `
                <hr>
                <h3>Detalhes do Pedido:</h3>
                <p><strong>Cliente:</strong> ${pedido.clientName || 'Cliente não identificado'}</p>
                <p><strong>CNPJ/CPF:</strong> ${pedido.cnpj || 'CNPJ não informado'}</p>
                <p><strong>Contato:</strong> ${pedido.contactNumber || 'Número de contato não informado'}</p>
                <p><strong>Endereço:</strong> ${pedido.deliveryAddress || 'Endereço não informado'}</p>
                <p><strong>Estado:</strong> ${pedido.state || 'Estado não informado'}</p>
                <p><strong>Data do Pedido:</strong> ${new Date().toLocaleDateString('pt-BR') + ', ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Total do Pedido:</strong> R$ ${((pedido.products?.reduce((sum: number, product: { variantPrice?: number; selectedVariant?: { price?: number }; price?: number; quantity: number }) => {
                  const price = product.variantPrice || product.selectedVariant?.price || product.price || 0;
                  return sum + (Number(price) * product.quantity);
                }, 0) || 0) + (pedido.freightCost || 0) + (pedido.additionalFees || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              ` : ''}
            `,
            attachments: pdfAttachment,
          });
          console.log('[SEND-ORDER] E-mail enviado com sucesso para o usuário!');
        }
        
        // Enviar cópia para o remetente (email que está enviando) - SEMPRE ENVIAR
        if (senderEmail) {
          console.log('[SEND-ORDER] Iniciando envio de cópia para remetente:', senderEmail);
          await transporter.sendMail({
            from: `EcoFlow <${senderEmail}>`,
            to: senderEmail,
            subject: `Cópia - Novo Pedido Recebido - ${pedido.clientName || 'Cliente'} - ${pedido.idPedido || `pedido_${Date.now()}`}`,
            html: `
              <h2>Cópia - Novo Pedido Recebido</h2>
              <p><strong>Cliente:</strong> ${pedido.clientName || 'Cliente não identificado'}</p>
              <p><strong>CNPJ/CPF:</strong> ${pedido.cnpj || 'CNPJ não informado'}</p>
              <p><strong>Contato:</strong> ${pedido.contactNumber || 'Número de contato não informado'}</p>
              <p><strong>Email:</strong> ${email || 'Email não informado'}</p>
              <p><strong>Endereço:</strong> ${pedido.deliveryAddress || 'Endereço não informado'}</p>
              <p><strong>Estado:</strong> ${pedido.state || 'Estado não informado'}</p>
              <p><strong>Data do Pedido:</strong> ${new Date().toLocaleDateString('pt-BR') + ', ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Total do Pedido:</strong> R$ ${((pedido.products?.reduce((sum: number, product: { variantPrice?: number; selectedVariant?: { price?: number }; price?: number; quantity: number }) => {
                const price = product.variantPrice || product.selectedVariant?.price || product.price || 0;
                return sum + (Number(price) * product.quantity);
              }, 0) || 0) + (pedido.freightCost || 0) + (pedido.additionalFees || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>Segue em anexo a nota de pedido completa.</p>
              ${!pdfGenerated ? '<p><strong>Nota:</strong> PDF não foi gerado devido a limitações do servidor. Detalhes incluídos no email.</p>' : ''}
            `,
            attachments: pdfAttachment,
          });
          console.log('[SEND-ORDER] Cópia enviada com sucesso para o remetente!');
        }
      } catch (emailError) {
        console.error('[SEND-ORDER] Erro ao enviar e-mail:', emailError);
        console.error('[SEND-ORDER] Detalhes do erro:', {
          message: (emailError as Error).message,
          stack: (emailError as Error).stack
        });
        // Continuar mesmo se o email falhar
      }
    } else {
      console.log('[SEND-ORDER] Configurações de email não encontradas, pulando envio de email');
      console.log('[SEND-ORDER] Email:', email);
      console.log('[SEND-ORDER] EMAIL_USER:', !!process.env.EMAIL_USER);
      console.log('[SEND-ORDER] EMAIL_PASS:', !!process.env.EMAIL_PASS);
    }
    
    // Gerar link do WhatsApp
    const whatsappMessage = `Oi tudo bem? Realizei o pedido ${pedido.idPedido || `pedido_${Date.now()}`}, gostaria de ser um revendedor!`;
    const whatsappLink = `https://wa.me/554191596957?text=${encodeURIComponent(whatsappMessage)}`;
    
    return NextResponse.json({ 
      success: true, 
      whatsappLink,
      idPedido: pedido.idPedido || `pedido_${Date.now()}`,
      pdfGenerated: pdfGenerated
    });
  } catch (error) {
    console.error('[SEND-ORDER] Erro ao processar pedido:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar pedido', 
      detalhe: (error as Error)?.message 
    }, { status: 500 });
  }
}