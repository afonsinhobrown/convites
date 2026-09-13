import type { InvitationData } from "../types";

export function BasicLayout({ data }: { data: InvitationData }) {
  return (
    <div className="relative w-full max-w-md mx-auto bg-white text-gray-900 overflow-hidden shadow-2xl rounded-lg border border-gray-200 aspect-[2/3]">
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-5">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
          Convite de casamento
        </p>
        <h2 className="text-3xl font-serif-custom font-bold text-gray-900 leading-tight">
          {data.brideName}
        </h2>
        <span className="text-2xl text-gray-400 font-cursive-custom">&</span>
        <h2 className="text-3xl font-serif-custom font-bold text-gray-900 leading-tight">
          {data.groomName}
        </h2>
        <div className="mt-2 space-y-1 text-gray-600">
          <p className="text-sm font-medium">
            {data.day} de {data.month.toLowerCase()} de {data.year}
          </p>
          <p className="text-sm">{data.time}</p>
          <p className="text-sm">{data.venue}</p>
          <p className="text-xs text-gray-500">{data.address}</p>
        </div>
        <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-500">
          RSVP: {data.rsvpContact}
        </div>
      </div>
    </div>
  );
}