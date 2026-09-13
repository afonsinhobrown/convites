"use client";

import { Calendar, Clock, MapPin, Heart, MessageCircle } from "lucide-react";
import { AutoFitText } from "../AutoFitText";
import type { InvitationData } from "../types";

export function MagnoliaGoldLayout({ data }: { data: InvitationData }) {
  return (
    <div className="relative w-full max-w-md mx-auto bg-[#FDFBF7] text-[#1A1A1A] overflow-hidden shadow-2xl rounded-lg aspect-[2/3]">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8B5A2B]/10 rounded-full blur-3xl" />
        <div className="absolute inset-3 border border-[#C5A059]/40 rounded-sm" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6 sm:p-8">
        <div className="text-center space-y-2">
          <p className="text-[10px] font-sans-custom font-bold uppercase tracking-[0.25em] text-[#8B5A2B]">
            Com a Bênção de Deus
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-[#C5A059]" />
            <Heart className="h-3 w-3 fill-[#C5A059] text-[#C5A059]" />
            <span className="h-px w-10 bg-[#C5A059]" />
          </div>
          <p className="text-[9px] font-sans-custom uppercase tracking-widest text-gray-500 pt-1">
            Temos a alegria de vos convidar
            <br />
            para o nosso casamento
          </p>
        </div>

        <div className="mt-6 space-y-1 text-center">
          <div className="h-14 flex items-center justify-center">
            <AutoFitText
              text={data.brideName}
              maxFontSize={36}
              minFontSize={18}
              maxLines={1}
              className="font-serif-custom font-bold text-[#1A1A1A] w-full px-2"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-[#C5A059]">
            <span className="h-px w-12 bg-current opacity-40" />
            <span className="font-cursive-custom text-2xl">&</span>
            <span className="h-px w-12 bg-current opacity-40" />
          </div>

          <div className="h-14 flex items-center justify-center">
            <AutoFitText
              text={data.groomName}
              maxFontSize={36}
              minFontSize={18}
              maxLines={1}
              className="font-serif-custom font-bold text-[#1A1A1A] w-full px-2"
            />
          </div>
        </div>

        <p className="text-center font-cursive-custom text-lg text-[#8B5A2B] mt-4 leading-snug">
          Duas vidas, dois corações,
          <br />
          uma história para toda a vida.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-[#C5A059]/30">
          <div className="flex flex-col items-center text-center gap-1">
            <div className="p-1.5 bg-[#C5A059]/10 rounded-full">
              <Calendar className="h-4 w-4 text-[#8B5A2B]" />
            </div>
            <p className="text-[9px] font-sans-custom font-bold uppercase text-[#8B5A2B] tracking-wider">Dia</p>
            <p className="text-sm font-serif-custom font-bold">{data.day}</p>
            <p className="text-[9px] font-sans-custom text-gray-600 leading-tight">
              DE {data.month.toLowerCase()}
              <br />
              DE {data.year}
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-1">
            <div className="p-1.5 bg-[#C5A059]/10 rounded-full">
              <Clock className="h-4 w-4 text-[#8B5A2B]" />
            </div>
            <p className="text-[9px] font-sans-custom font-bold uppercase text-[#8B5A2B] tracking-wider">Hora</p>
            <p className="text-sm font-serif-custom font-bold">{data.time}</p>
          </div>

          <div className="flex flex-col items-center text-center gap-1">
            <div className="p-1.5 bg-[#C5A059]/10 rounded-full">
              <MapPin className="h-4 w-4 text-[#8B5A2B]" />
            </div>
            <p className="text-[9px] font-sans-custom font-bold uppercase text-[#8B5A2B] tracking-wider">Local</p>
            <p className="text-[10px] font-serif-custom font-bold leading-tight">{data.venue}</p>
            <p className="text-[8px] font-sans-custom text-gray-600 leading-tight">{data.address}</p>
          </div>
        </div>

        <div className="mt-auto pt-6 space-y-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Heart className="h-3 w-3 fill-[#C5A059] text-[#C5A059]" />
            <Heart className="h-3 w-3 fill-[#C5A059] text-[#C5A059]" />
          </div>

          <p className="text-[10px] font-sans-custom text-gray-600 italic px-4">
            Será uma honra celebrar este momento
            <br />
            tão especial na presença de vocês.
          </p>

          <p className="font-cursive-custom text-2xl text-[#C5A059]">Juntos para sempre</p>

          <div className="pt-3 border-t border-[#C5A059]/20">
            <div className="flex items-center justify-center gap-1.5">
              <MessageCircle className="h-3 w-3 text-[#8B5A2B]" />
              <p className="text-[10px] font-sans-custom font-bold uppercase tracking-widest text-[#1A1A1A]">RSVP</p>
            </div>
            <p className="text-[10px] font-sans-custom text-gray-600 mt-1">
              {data.rsvpContact}
              {data.rsvpDate ? ` · Até ${data.rsvpDate}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}