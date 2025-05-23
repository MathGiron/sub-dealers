import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { products, clientName, cnpj, contactNumber, orderDate, pdfBuffer } = await request.json();

    console.log("Dados recebidos:", { products, clientName, cnpj, contactNumber, orderDate, pdfBuffer });

    if (!products || !clientName || !orderDate) {
      return NextResponse.json({ success: false, error: "Dados incompletos" }, { status: 400 });
    }

    const orderDetails = products
      .map((product: any, index: number) => {
        const price = product.specs?.[0]?.price ? parseFloat(product.specs[0].price) : 0;
        const total = price * (product.quantity || 1);
        return `${index + 1}. ${product.name}\n   Quantidade: ${product.quantity}\n   Preço Unitário: R$ ${price.toFixed(2)}\n   Total: R$ ${total.toFixed(2)}`;
      })
      .join("\n\n");
    const totalAmount = products.reduce((sum: number, product: any) => {
      const price = product.specs?.[0]?.price ? parseFloat(product.specs[0].price) : 0;
      return sum + price * (product.quantity || 1);
    }, 0);

    const message = `
      Novo Pedido Recebido
      -------------------
      Data do Pedido: ${orderDate}
      Cliente: ${clientName}
      CNPJ: ${cnpj || "Não informado"}
      Contato: ${contactNumber || "Não informado"}
      -------------------
      Itens do Pedido:
      ${orderDetails}
      -------------------
      Total Geral: R$ ${totalAmount.toFixed(2)}
      -------------------
      Agradecemos pelo seu pedido! Nossa equipe comercial entrará em contato em breve.
      QUERO SER UM REVENDEDOR!!
    `;

    console.log("Mensagem montada:", message);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ success: false, error: "Credenciais de email não configuradas" }, { status: 500 });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "matheus.giron@grupotimber.com.br",
      subject: `Novo Pedido - ${clientName} (${orderDate})`,
      text: message,
      attachments: pdfBuffer
        ? [
            {
              filename: `pedido_${orderDate.replace(/[^0-9]/g, '')}.pdf`,
              content: Buffer.from(pdfBuffer, 'base64'),
              contentType: 'application/pdf',
            },
          ]
        : [],
    });

    console.log("Email enviado com sucesso!");

    const whatsappNumber = "+554191596957"; // Usando o número fornecido
    const whatsappMessage = encodeURIComponent(message);
    const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${whatsappMessage}`;

    console.log("Link do WhatsApp gerado:", whatsappLink);

    return NextResponse.json({ success: true, whatsappLink });
  } catch (error) {
    console.error("Erro ao enviar pedido:", error);
    return NextResponse.json({ success: false, error: "Erro interno ao processar o pedido" }, { status: 500 });
  }
}