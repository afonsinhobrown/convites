"use client";

import { InvitationData } from "./InvitationPreview";

interface Props {
  data: InvitationData;
  onChange: (data: InvitationData) => void;
}

export function InvitationForm({ data, onChange }: Props) {
  const update = (field: keyof InvitationData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const loadStressTest = () => {
    onChange({
      brideName: "Maria Fernanda da Conceição Nhantumbo",
      groomName: "Alexandre Manuel Francisco da Silva",
      day: "24",
      month: "OUTUBRO",
      year: "2026",
      time: "15:30",
      locationName: "Quinta dos Coqueiros Eventos e Conferências",
      locationAddress: "Av. da Marginal, nº 1234, Maputo",
      rsvpContact: "+258 84 123 4567",
      rsvpDate: "15 de Outubro",
    });
  };

  const fields: { key: keyof InvitationData; label: string; placeholder: string }[] = [
    { key: "brideName", label: "Nome da Noiva", placeholder: "Ex: Maria" },
    { key: "groomName", label: "Nome do Noivo", placeholder: "Ex: João" },
    { key: "day", label: "Dia", placeholder: "Ex: 24" },
    { key: "month", label: "Mês", placeholder: "Ex: OUTUBRO" },
    { key: "year", label: "Ano", placeholder: "Ex: 2026" },
    { key: "time", label: "Hora", placeholder: "Ex: 15:30" },
    { key: "locationName", label: "Nome do Local", placeholder: "Ex: Quinta dos Coqueiros" },
    { key: "locationAddress", label: "Endereço", placeholder: "Ex: Av. da Marginal, Maputo" },
    { key: "rsvpContact", label: "Contacto RSVP", placeholder: "Ex: +258 84 123 4567" },
    { key: "rsvpDate", label: "Data Limite RSVP", placeholder: "Ex: 15 de Outubro" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Editar Convite</h2>
        <button
          type="button"
          onClick={loadStressTest}
          className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
        >
          🔥 Testar Nomes Longos
        </button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              {field.label}
            </label>
            <input
              type="text"
              value={data[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
