import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ProductEmail = {
  name: string;
  quantity: number;
  price: number;
};

export async function POST(request: Request) {
  try {
    const { clientName, cnpj, contactNumber, orderDate, products, total, whatsappLink, pdfBuffer }: {
      clientName: string;
      cnpj: string;
      contactNumber: string;
      orderDate: string;
      products: ProductEmail[];
      total: number;
      whatsappLink: string;
      pdfBuffer: string;
    } = await request.json();

    // Configurar o transporte do Nodemailer (exemplo com Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Seu e-mail (ex.: seuemail@gmail.com)
        pass: process.env.EMAIL_PASS, // Sua senha de app do Gmail
      },
    });

    // Montar o corpo do e-mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "matheus.giron@grupotimber.com.br",
      subject: "Novo Pedido Recebido",
      html: `
        <h2>Novo Pedido Recebido</h2>
        <p>Olá, Matheus!</p>
        <p>Agradecemos pelo seu pedido! Nossa equipe comercial entrará em contato em breve para dar continuidade.</p>
        <p><strong>QUERO SER UM REVENDEDOR!!</strong></p>
        <p>Você pode continuar a conversa diretamente no WhatsApp clicando no link abaixo:</p>
        <p><a href="${whatsappLink}" target="_blank">Continuar no WhatsApp</a></p>
        <h3>Detalhes do Pedido</h3>
        <p><strong>Cliente:</strong> ${clientName}</p>
        <p><strong>CNPJ:</strong> ${cnpj}</p>
        <p><strong>Contato:</strong> ${contactNumber}</p>
        <p><strong>Data do Pedido:</strong> ${orderDate}</p>
        <h4>Produtos:</h4>
        <ul>
          ${products.map((product: ProductEmail) => `
            <li>
              ${product.name} - Quantidade: ${product.quantity} - Preço Unitário: R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - Total: R$ ${(product.price * product.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </li>
          `).join('')}
        </ul>
        <p><strong>Total Geral:</strong> R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      `,
      attachments: [
        {
          filename: `pedido_${orderDate.replace(/[^0-9]/g, '')}.pdf`,
          content: Buffer.from(pdfBuffer, 'base64'),
          contentType: 'application/pdf',
        },
      ],
    };

    // Enviar o e-mail
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return NextResponse.json({ success: false, error: "Erro ao enviar e-mail." }, { status: 500 });
  }
}