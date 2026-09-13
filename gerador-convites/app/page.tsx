"use client";

import { useState } from "react";
import { InvitationPreview, InvitationData } from "@/components/InvitationPreview";
import { InvitationForm } from "@/components/InvitationForm";

export default function Home() {
  const [data, setData] = useState<InvitationData>({
    brideName: "Ana Artur",
    groomName: "Zlatan Osp",
    day: "24",
    month: "OUTUBRO",
    year: "2026",
    time: "15:30",
    locationName: "Quinta dos Coqueiros",
    locationAddress: "Av. da Marginal, Maputo",
    rsvpContact: "+258 84 123 4567",
    rsvpDate: "15 de Outubro",
  });

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Gerador de Convites
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Modelo: Magnólia Dourada · Preview em tempo real
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="order-2 lg:order-1">
            <InvitationForm data={data} onChange={setData} />
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <InvitationPreview data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
