import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { CheckCircle2, FileDown, ArrowRight } from "lucide-react";
import { formatEventDate } from "@/lib/invitation";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { type?: string };
}) {
  const organizerId = await getCurrentOrganizerId();
  if (!organizerId) redirect("/organizer/login");

  const event = await prisma.event.findFirst({
    where: { id: params.id, organizerId },
  });

  if (!event) notFound();

  const isGuestFee = searchParams.type === "guest-fee";
  const typeStr = isGuestFee ? "GUEST_FEE" : "TEMPLATE";

  const payment = await prisma.payment.findFirst({
    where: { eventId: event.id, type: typeStr, status: "PAID" },
    orderBy: { confirmedAt: "desc" },
  });

  if (!payment) {
    // Se não encontrou o pagamento, redirecionar de volta para o evento
    redirect(`/organizer/events/${event.id}`);
  }

  const amount = Math.round(payment.amountCents / 100);
  const reference = payment.providerRef || payment.id;
  const dateStr = payment.confirmedAt
    ? new Date(payment.confirmedAt).toLocaleDateString("pt-MZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const { day, month, year } = formatEventDate(event.weddingDate);

  return (
    <main className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#C5A059]/20 overflow-hidden">
        {/* Banner Sucesso */}
        <div className="bg-[#C5A059] px-6 py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white mb-4 shadow-sm">
            <CheckCircle2 className="h-8 w-8 text-[#C5A059]" />
          </div>
          <h1 className="text-2xl font-bold text-white font-serif-custom">
            Pagamento Confirmado!
          </h1>
          <p className="text-[#FDFBF7] mt-2 text-sm">
            {isGuestFee
              ? "A sua taxa de emissão de convites foi liquidada com sucesso."
              : "O seu modelo de convite foi pago e ativado com sucesso."}
          </p>
        </div>

        {/* Detalhes do Recibo HTML */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">
            Detalhes da Transação
          </h2>

          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 font-medium">Evento</dt>
              <dd className="text-gray-900 font-semibold text-right">
                {event.brideName} &amp; {event.groomName} <br />
                <span className="text-xs font-normal text-gray-500">
                  {day} de {month.toLowerCase()} de {year}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 font-medium">Referência</dt>
              <dd className="text-gray-900 font-mono text-xs mt-0.5">{reference}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 font-medium">Data</dt>
              <dd className="text-gray-900">{dateStr}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-4 mt-2">
              <dt className="text-base font-bold text-gray-900">Total Pago</dt>
              <dd className="text-base font-bold text-[#C5A059]">{amount} MT</dd>
            </div>
          </dl>

          {/* Botão Descarregar PDF Real */}
          <div className="mt-8">
            <a
              href={`/api/organizer/events/${event.id}/payment/receipt?type=${searchParams.type || "template"}`}
              download={`recibo_${reference}.pdf`}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#C5A059] bg-transparent px-4 py-3 text-sm font-bold text-[#C5A059] transition hover:bg-[#C5A059]/5"
            >
              <FileDown className="h-5 w-5" />
              Descarregar Recibo PDF
            </a>
          </div>
        </div>

        {/* Link para o Painel (Login Automático / Continuar) */}
        <div className="bg-gray-50 px-6 py-6 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            Próximo passo
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            {isGuestFee
              ? "Aceda ao seu painel para gerar e baixar os convites individuais para os seus convidados."
              : "Aceda ao seu painel (Login) para editar o seu evento e adicionar os seus convidados."}
          </p>

          <Link
            href={`/organizer/events/${event.id}`}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] px-4 py-3 text-sm font-bold text-white transition shadow hover:bg-black"
          >
            Aceder ao Painel / Login <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
