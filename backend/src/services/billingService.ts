import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

/**
 * MOTOR DE FATURAÇÃO CERTIFICADA (Ref Point #5)
 * Integração com API (Ex: InvoiceXpress / Moloni)
 */
export const generateInvoice = async (bookingId: string) => {
  try {
    const booking: any = await (prisma.booking as any).findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        staff: true,
        services: { include: { service: true } }
      }
    });

    if (!booking) throw new Error('Agendamento não encontrado.');

    // 1. Determinar Identidade Legal (Multi-NIF)
    const sellerNIF = booking.staff.nif;
    const sellerName = booking.staff.legalName || booking.staff.email;

    console.log(`📑 Gerando Fatura para ${booking.client.name} em nome de ${sellerName} (NIF: ${sellerNIF})`);

    // 2. Mapeamento de Itens para a API
    const items = booking.services.map((s: any) => ({
      name: s.service.label,
      unit_price: s.service.price,
      quantity: 1,
      tax_rate: 23 // Exemplo: IVA padrão
    }));

    // Simulação de Sucesso
    const mockInvoiceId = `FT-${Math.floor(Math.random() * 100000)}`;
    const mockInvoiceUrl = `https://studiobraz.com/invoices/${mockInvoiceId}.pdf`;

    // 4. Gravar na Base de Dados do Studio Braz
    await (prisma.booking as any).update({
      where: { id: bookingId },
      data: {
        invoiceId: mockInvoiceId,
        invoiceUrl: mockInvoiceUrl,
        status: 'paid'
      }
    });

    logger.info(`✅ Fatura ${mockInvoiceId} gerada e interligada ao agendamento ${bookingId}`);

    return { success: true, url: mockInvoiceUrl };

  } catch (error: any) {
    logger.error('❌ ERRO NA GERAÇÃO DE FATURA:', error.message);
    throw error;
  }
};

/**
 * Extração SAFT-T (Simulação de XML Realista para Contabilista)
 */
export const getSaftData = async (month: number, year: number, nif: string) => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

  const bookings: any[] = await (prisma.booking as any).findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      status: 'paid',
      staff: { nif }
    },
    include: { client: true, services: { include: { service: true } } }
  });

  const totalAmount = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalTax = totalAmount * 0.23;

  const xml = `<?xml version="1.0" encoding="Windows-1252"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:PT_1.04_01">
  <Header>
    <AuditFileVersion>1.04_01</AuditFileVersion>
    <CompanyID>${nif}</CompanyID>
    <TaxRegistrationNumber>${nif}</TaxRegistrationNumber>
    <BusinessName>Studio Braz - Mariana Braz</BusinessName>
    <CompanyName>STRELLA BRILHANTE UNIPESSOAL LDA</CompanyName>
  </Header>
  <SourceDocuments>
    <SalesInvoices>
      <NumberOfEntries>${bookings.length}</NumberOfEntries>
      <TotalDebit>0.00</TotalDebit>
      <TotalCredit>${totalAmount.toFixed(2)}</TotalCredit>
      ${bookings.map(b => `
      <Invoice>
        <InvoiceNo>${b.invoiceId}</InvoiceNo>
        <InvoiceDate>${b.date}</InvoiceDate>
        <CustomerID>${b.clientId}</CustomerID>
        <Line>
          <Amount>${b.totalPrice?.toFixed(2)}</Amount>
          <Tax><TaxPercentage>23</TaxPercentage></Tax>
        </Line>
      </Invoice>`).join('')}
    </SalesInvoices>
  </SourceDocuments>
</AuditFile>`;

  return {
    filename: `SAFT_PT_${nif}_${year}_${month}.xml`,
    content: xml,
    metrics: { count: bookings.length, total: totalAmount, tax: totalTax }
  };
};

/**
 * FECHO MENSAL (Relatório de Gestão para Mariana)
 */
export const generateMonthlyClosure = async (month: number, year: number, staffId?: string) => {
  const where: any = {
    date: { startsWith: `${year}-${month.toString().padStart(2, '0')}` },
    status: { in: ['paid', 'completed'] },
    deletedAt: null
  };

  if (staffId) {
    where.staffId = staffId;
  }

  const bookings: any[] = await (prisma.booking as any).findMany({
    where,
    include: { staff: true, services: { include: { service: true } } }
  });

  const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const byStaff = bookings.reduce((acc: any, b) => {
    const name = b.staff.legalName || b.staff.email;
    acc[name] = (acc[name] || 0) + (b.totalPrice || 0);
    return acc;
  }, {});

  // Despesas (apenas do estúdio geral ou vinculadas a staff no futuro)
  const expenses = await (prisma.expense as any).findMany({
    where: { date: `${year}-${month.toString().padStart(2, '0')}` }
  });
  const totalExpenses = staffId ? 0 : expenses.reduce((acc: number, e: any) => acc + e.amount, 0);

  return {
    month,
    year,
    revenue: totalRevenue,
    expenses: totalExpenses,
    profit: totalRevenue - totalExpenses,
    breakdown: byStaff,
    generatedAt: new Date().toISOString()
  };
};
