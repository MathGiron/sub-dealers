import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ProductOrder = {
  name: string;
  quantity: number;
  price: number | string;
};

export async function POST(request: Request) {
  try {
    const { products, clientName, cnpj, contactNumber, orderDate, pdfBuffer }: {
      products: ProductOrder[];
      clientName: string;
      cnpj?: string;
      contactNumber?: string;
      orderDate: string;
      pdfBuffer?: string;
    } = await request.json();

    console.log("Dados recebidos:", { products, clientName, cnpj, contactNumber, orderDate, pdfBuffer });

    if (!products || !clientName || !orderDate) {
      return NextResponse.json({ success: false, error: "Dados incompletos" }, { status: 400 });
    }

    // Calcular detalhes do pedido
    const orderDetails = products
      .map((product: ProductOrder, index: number) => {
        const price = typeof product.price === "number" ? product.price : parseFloat(product.price) || 0;
        const quantity = product.quantity || 1;
        const total = price * quantity;
        return `
          <li>
            ${index + 1}. ${product.name}<br>
            Quantidade: ${quantity}<br>
            Preço Unitário: R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>
            Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </li>
        `;
      })
      .join("");

    const totalAmount = products.reduce((sum: number, product: ProductOrder) => {
      const price = typeof product.price === "number" ? product.price : parseFloat(product.price) || 0;
      return sum + price * (product.quantity || 1);
    }, 0);

    // Montar o corpo do e-mail
    const htmlContent = `
      <h2>Novo Pedido Recebido</h2>
      <p>Olá, Matheus!</p>
      <p>Agradecemos pelo seu pedido! Nossa equipe comercial entrará em contato em breve para dar continuidade.</p>
      <p><strong>QUERO SER UM REVENDEDOR!!</strong></p>
      <h3>Detalhes do Pedido</h3>
      <p><strong>Cliente:</strong> ${clientName}</p>
      <p><strong>CNPJ:</strong> ${cnpj || "Não informado"}</p>
      <p><strong>Contato:</strong> ${contactNumber || "Não informado"}</p>
      <p><strong>Data do Pedido:</strong> ${orderDate}</p>
      <h4>Produtos:</h4>
      <ul>${orderDetails}</ul>
      <p><strong>Total Geral:</strong> R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    `;

    const textContent = `
      Novo Pedido Recebido
      -------------------
      Data do Pedido: ${orderDate}
      Cliente: ${clientName}
      CNPJ: ${cnpj || "Não informado"}
      Contato: ${contactNumber || "Não informado"}
      -------------------
      Itens do Pedido:
      ${(products as ProductOrder[])
        .map((product: ProductOrder, index: number) => {
          const price = typeof product.price === "number" ? product.price : parseFloat(product.price) || 0;
          const quantity = product.quantity || 1;
          const total = price * quantity;
          return `${index + 1}. ${product.name}\n   Quantidade: ${quantity}\n   Preço Unitário: R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n   Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        })
        .join("\n\n")}
      -------------------
      Total Geral: R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      -------------------
      Agradecemos pelo seu pedido! Nossa equipe comercial entrará em contato em breve.
      QUERO SER UM REVENDEDOR!!
    `;

    // Configurar o transporte do Nodemailer
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

    // Enviar o e-mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "matheus.giron@grupotimber.com.br",
      subject: `Novo Pedido - ${clientName} (${orderDate.replace(/[^0-9]/g, '')})`,
      html: htmlContent,
      text: textContent,
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

    console.log("E-mail enviado com sucesso!");

    // Gerar link do WhatsApp
    const whatsappNumber = "+554191596957";
    const whatsappMessage = encodeURIComponent(textContent);
    const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${whatsappMessage}`;

    console.log("Link do WhatsApp gerado:", whatsappLink);

    return NextResponse.json({ success: true, whatsappLink }, { status: 200 });
  } catch (error) {
    console.error("Erro ao enviar pedido:", error);
    return NextResponse.json({ success: false, error: "Erro interno ao processar o pedido" }, { status: 500 });
  }
}