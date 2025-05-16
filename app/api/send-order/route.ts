import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { products, clientName, cnpj, contactNumber, orderDate } = await request.json();

    console.log("Dados recebidos:", { products, clientName, cnpj, contactNumber, orderDate });

    // Montar a mensagem do pedido
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
      CNPJ: ${cnpj}
      Contato: ${contactNumber}
      -------------------
      Itens do Pedido:
      ${orderDetails}
      -------------------
      Total Geral: R$ ${totalAmount.toFixed(2)}
    `;

    console.log("Mensagem montada:", message);

    // Configurar o transporte de email com nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("Tentando enviar email com user:", process.env.EMAIL_USER);

    // Enviar email pro time comercial
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "comercial@revendas.com",
      subject: `Novo Pedido - ${clientName} (${orderDate})`,
      text: message,
    });

    console.log("Email enviado com sucesso!");

    // Gerar link do WhatsApp
    const whatsappNumber = "5511999999999"; // Substitua por um número real
    const whatsappMessage = encodeURIComponent(message);
    const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${whatsappMessage}`;

    console.log("Link do WhatsApp gerado:", whatsappLink);

    return NextResponse.json({ success: true, whatsappLink });
  } catch (error) {
    console.error("Erro ao enviar pedido:", error);
    return NextResponse.json({ success: false, error: "Erro interno ao processar o pedido" }, { status: 500 });
  }
}