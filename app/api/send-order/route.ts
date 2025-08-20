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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nota de Pedido - EcoFlow</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
        font-family: Arial, Helvetica, sans-serif !important;
        padding: 20px 15px !important;
        margin: 0 !important;
        font-size: 10px !important;
        line-height: 1.3 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      h2 {
        text-align: center !important;
        font-size: 18px !important;
        margin-bottom: 12px !important;
        color: #000000 !important;
        margin-top: 0 !important;
        font-weight: bold !important;
      }

      .container {
        max-width: 95% !important;
        margin: auto !important;
        background-color: #ffffff !important;
        padding: 15px !important;
      }

      section {
        margin-bottom: 12px !important;
        page-break-inside: avoid !important;
      }

      h3 {
        font-size: 14px !important;
        color: #000000 !important;
        border-bottom: 1px solid #333333 !important;
        padding-bottom: 4px !important;
        margin-bottom: 8px !important;
        margin-top: 0 !important;
        font-weight: bold !important;
      }

      p {
        margin: 3px 0 !important;
        font-size: 10px !important;
        color: #000000 !important;
        display: block !important;
      }

      label {
        display: inline !important;
        margin-right: 5px !important;
        font-weight: bold !important;
        font-size: 10px !important;
        color: #000000 !important;
      }

      .item-pedido {
        padding: 10px !important;
        background-color: #f8f8f8 !important;
        border-radius: 6px !important;
        margin-bottom: 10px !important;
        border-left: 2px solid #007acc !important;
      }

      table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 9px !important;
        margin-top: 4px !important;
        border: 1px solid #333333 !important;
      }

      th, td {
        border: 1px solid #333333 !important;
        padding: 4px !important;
        text-align: left !important;
        color: #000000 !important;
        background-color: #ffffff !important;
      }

      th {
        background-color: #f0f0f0 !important;
        color: #000000 !important;
        font-weight: bold !important;
      }

      .totais td {
        font-weight: bold !important;
        color: #000000 !important;
      }

      .bold {
        font-weight: bold !important;
        color: #000000 !important;
      }

      .observacao {
        font-size: 9px !important;
        color: #666666 !important;
        margin-top: 8px !important;
      }

      .observacao p {
        margin: 2px 0 !important;
        font-size: 9px !important;
        color: #666666 !important;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
  </head>
  <body>
    <h2>Nota de Pedido - Ecoflow</h2>
    <div class="container">
      <section>
        <h3>Dados da Empresa</h3>
        <p><label>Emitente:</label> ${dadosEmpresa.empresa} | <label>CNPJ:</label> ${dadosEmpresa.cnpj_empresa}</p>
        <p><label>Endereço:</label> ${dadosEmpresa.endereco_empresa}, ${dadosEmpresa.cidade} – ${dadosEmpresa.uf_empresa}</p>
        <p><label>Contato:</label> ${dadosEmpresa.contato_empresa} | <label>Vendedor:</label> ${dadosEmpresa.vendedor}</p>
      </section>
      <section>
        <h3>Dados do Cliente</h3>
        <p><label>Nome:</label> ${pedido.clientName || 'Cliente não identificado'} | <label>CNPJ/CPF:</label> ${pedido.cnpj || 'CNPJ não informado'}</p>
        <p><label>Contato:</label> ${pedido.contactNumber || 'Número de contato não informado'} | <label>Data:</label> ${dataPedido}</p>
        <p><label>Endereço:</label> ${pedido.deliveryAddress || 'Endereço não informado'} | <label>Estado:</label> ${pedido.state || 'Estado não informado'}</p>
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
        <p><label>Favorecido:</label> ${dadosBancarios.favorecido} | <label>Banco:</label> ${dadosBancarios.banco}</p>
        <p><label>Agência e Conta:</label> ${dadosBancarios.agencia_conta} | <label>CNPJ:</label> ${dadosBancarios.cnpj_banco}</p>
        <p><label>PIX:</label> ${dadosBancarios.pix}</p>
      </section>
      <section>
        <h3>Garantias</h3>
        <p><label>Painéis Solares:</label> 12 Meses | <label>Linha Delta e River:</label> 24 Meses | <label>Ar Condicionado Wave 2:</label> 12 Meses</p>
        <p><label>Geladeira Portátil Glacier:</label> 12 Meses | <label>Gerador Dual Fuel:</label> 12 Meses</p>
      </section>
      <div class="observacao">
        <p><label>Validade:</label> 02 dias a contar da data de envio | <label>Impostos:</label> PIS/COFINS, ICMS e IPI inclusos. Impostos de carga líquida ou diferença de ICMS, se for cobrado, será por conta do cliente.</p>
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
      
      // Em produção (Vercel), Puppeteer não funciona - usar jsPDF diretamente
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
        console.log('[SEND-ORDER] 🚫 Ambiente de produção detectado - Puppeteer não funciona aqui');
        console.log('[SEND-ORDER] 🔄 Usando jsPDF diretamente (única opção viável em produção)');
        
        pdfBuffer = gerarPdfComJsPDF(pedido);
        
        if (pdfBuffer.length > 0) {
          console.log('[SEND-ORDER] ✅ PDF gerado com jsPDF para produção, tamanho:', pdfBuffer.length, 'bytes');
          pdfGenerated = true;
        } else {
          console.log('[SEND-ORDER] ❌ jsPDF falhou em produção');
        }
      } else {
        // Em desenvolvimento, tentar Puppeteer primeiro
        try {
          console.log('[SEND-ORDER] 🚀 Ambiente de desenvolvimento - tentando Puppeteer...');
          const html = gerarHtmlPedido(pedido);
          
          // Log do HTML gerado para debug
          console.log('[SEND-ORDER] HTML gerado (primeiros 500 chars):', html.substring(0, 500));
          console.log('[SEND-ORDER] Tamanho do HTML:', html.length);
          
          // Usar Puppeteer com configurações otimizadas para ambos os ambientes
          console.log('[SEND-ORDER] Iniciando Puppeteer com configurações otimizadas...');
          const browser = await puppeteer.launch({ 
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--no-first-run",
              "--disable-extensions",
              "--disable-web-security",
              "--allow-running-insecure-content",
              "--disable-background-timer-throttling",
              "--disable-backgrounding-occluded-windows",
              "--disable-renderer-backgrounding"
            ],
            headless: true,
            timeout: 30000
          });
          
          const page = await browser.newPage();
          await page.setViewport({ width: 1200, height: 800 });
          
          // Aguardar o conteúdo ser carregado completamente
          await page.setContent(html, { waitUntil: 'networkidle0' });
          
          // Aguardar um pouco mais para garantir que o CSS seja aplicado
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Verificar se o conteúdo está visível
          const contentVisible = await page.evaluate(() => {
            const body = document.body;
            const hasText = body && body.textContent && body.textContent.trim().length > 0;
            const hasElements = body && body.children && body.children.length > 0;
            const title = document.title;
            const h2Text = document.querySelector('h2')?.textContent;
            const sections = document.querySelectorAll('section');
            
            console.log('Debug info:', {
              hasText,
              hasElements,
              title,
              h2Text,
              bodyTextLength: body?.textContent?.length || 0,
              childrenCount: body?.children?.length || 0,
              sectionsCount: sections.length
            });
            
            return hasText && hasElements && sections.length > 0;
          });
          
          console.log('[SEND-ORDER] Conteúdo visível na página:', contentVisible);
          
          // Capturar screenshot para debug se necessário
          if (!contentVisible) {
            const screenshot = await page.screenshot({ fullPage: true });
            console.log('[SEND-ORDER] Screenshot capturado para debug, tamanho:', screenshot.length);
            
            // Log adicional para debug
            const debugInfo = await page.evaluate(() => {
              return {
                bodyHTML: document.body?.innerHTML?.substring(0, 1000) || 'N/A',
                computedStyles: {
                  bodyDisplay: getComputedStyle(document.body).display,
                  bodyVisibility: getComputedStyle(document.body).visibility,
                  bodyOpacity: getComputedStyle(document.body).opacity
                }
              };
            });
            console.log('[SEND-ORDER] Debug adicional:', debugInfo);
          }
          
          if (contentVisible) {
            console.log('[SEND-ORDER] 🎯 Conteúdo detectado! Gerando PDF...');
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
              console.log('[SEND-ORDER] ✅ PDF gerado com Puppeteer, tamanho:', pdfBuffer.length, 'bytes');
              console.log('[SEND-ORDER] 💾 PDF salvo no buffer e será reutilizado para ambos os emails');
              pdfGenerated = true;
            }
          } else {
            console.log('[SEND-ORDER] ❌ Conteúdo não está visível, fechando browser e tentando jsPDF...');
            await browser.close();
          }
        } catch (puppeteerError) {
          console.error('[SEND-ORDER] ⚠️ Puppeteer falhou, tentando jsPDF...', puppeteerError);
          console.error('[SEND-ORDER] 📚 Stack trace:', (puppeteerError as Error).stack);
        }
        
        // Se Puppeteer falhou, usar jsPDF
        if (pdfBuffer.length === 0) {
          console.log('[SEND-ORDER] 🔄 Usando jsPDF como fallback...');
          pdfBuffer = gerarPdfComJsPDF(pedido);
          
          if (pdfBuffer.length > 0) {
            console.log('[SEND-ORDER] ✅ PDF gerado com jsPDF, tamanho:', pdfBuffer.length, 'bytes');
            console.log('[SEND-ORDER] 💾 PDF salvo no buffer e será reutilizado para ambos os emails');
            pdfGenerated = true;
          }
        }
      }
    }
    
    // 3. Enviar e-mails para usuário e remetente
    console.log('[SEND-ORDER] 📧 ===== INICIANDO ENVIO DE EMAILS =====');
    console.log('[SEND-ORDER] 📊 Status do PDF:', pdfGenerated ? '✅ Gerado com sucesso' : '❌ Falhou na geração');
    console.log('[SEND-ORDER] 📏 Tamanho do PDF no buffer:', pdfBuffer.length, 'bytes');
    console.log('[SEND-ORDER] 🔄 O MESMO PDF será usado para ambos os emails (não será gerado um novo)');
    
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
        
        console.log('[SEND-ORDER] 📎 Anexo preparado:');
        console.log('[SEND-ORDER]   - Número de anexos:', pdfAttachment.length);
        console.log('[SEND-ORDER]   - Tamanho do PDF no buffer:', pdfBuffer.length, 'bytes');
        console.log('[SEND-ORDER]   - Nome do arquivo:', `nota-pedido-${pedido.idPedido || `pedido_${Date.now()}`}.pdf`);
        console.log('[SEND-ORDER] 🔄 IMPORTANTE: O MESMO PDF será usado para ambos os emails!');
        
        // Enviar email para o usuário (destinatário)
        if (email) {
          console.log('[SEND-ORDER] 📤 ===== ENVIANDO EMAIL PARA USUÁRIO =====');
          console.log('[SEND-ORDER] 📧 Destinatário:', email);
          console.log('[SEND-ORDER] 📎 Anexos:', pdfAttachment.length, 'arquivo(s)');
          console.log('[SEND-ORDER] 💾 Usando PDF do buffer (tamanho:', pdfBuffer.length, 'bytes)');
          
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
          console.log('[SEND-ORDER] 📤 ===== ENVIANDO EMAIL PARA REMETENTE =====');
          console.log('[SEND-ORDER] 📧 Destinatário:', senderEmail);
          console.log('[SEND-ORDER] 📎 Anexos:', pdfAttachment.length, 'arquivo(s)');
          console.log('[SEND-ORDER] 💾 Usando o MESMO PDF do buffer (tamanho:', pdfBuffer.length, 'bytes)');
          console.log('[SEND-ORDER] 🔄 NENHUM PDF NOVO FOI GERADO - reutilizando o existente!');
          
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
            const whatsappLink = `https://wa.me/55419984403450?text=${encodeURIComponent(whatsappMessage)}`;
    
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