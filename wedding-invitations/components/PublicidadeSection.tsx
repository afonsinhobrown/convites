"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX, Maximize2, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";

const ADS_ITEMS = [
  {
    id: "ad-1",
    src: "/publicidade/1.jpeg",
    title: "DoReMi Eventos",
    subtitle: "Produção e Gestão Completa de Casamentos",
    badge: "Destaque",
  },
  {
    id: "ad-2",
    src: "/publicidade/2.jpeg",
    title: "Experiências Memoráveis",
    subtitle: "Decoração, Iluminação e Cenários Exclusivos",
    badge: "Exclusivo",
  },
  {
    id: "ad-3",
    src: "/publicidade/3.jpeg",
    title: "Assessoria & Cerimonial",
    subtitle: "Cada detalhe planeado com perfeição e requinte",
    badge: "Premium",
  },
  {
    id: "ad-4",
    src: "/publicidade/4.jpeg",
    title: "Convites & Momentos",
    subtitle: "A elegância que o seu grande dia merece",
    badge: "Tendência",
  },
];

export function PublicidadeSection() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  function handleVideoClick(videoEl: HTMLVideoElement | null) {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  }

  function handleToggleMute(videoEl: HTMLVideoElement | null) {
    if (!videoEl) return;
    videoEl.muted = !videoEl.muted;
    setIsMuted(videoEl.muted);
  }

  return (
    <section className="mt-20 border-t border-[#C5A059]/25 pt-16">
      {/* Título da Secção de Publicidade */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C5A059]/15 px-3.5 py-1 text-xs font-semibold text-[#8B5A2B] border border-[#C5A059]/30">
          <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
          Espaço DoReMi &amp; Parceiros
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-serif-custom font-bold text-gray-900">
          Publicidade &amp; Experiências DoReMi
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
          Conheça os nossos serviços especiais de produção de eventos, decoração e momentos únicos.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Bloco de Vídeo Promocional (Lado Esquerdo / 7 Colunas) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="group relative overflow-hidden rounded-3xl border-2 border-[#C5A059]/40 bg-black shadow-2xl transition hover:border-[#C5A059]">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black flex items-center justify-center">
              <video
                id="doremi-promo-video"
                src="/publicidade/DOREMI.mp4"
                playsInline
                loop
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="h-full w-full object-contain cursor-pointer"
                onClick={(e) => handleVideoClick(e.currentTarget)}
              />

              {/* Botão Central de Play/Pause Overlay quando pausado */}
              {!isPlaying && (
                <div
                  onClick={() => {
                    const videoEl = document.getElementById("doremi-promo-video") as HTMLVideoElement | null;
                    handleVideoClick(videoEl);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition"
                >
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#C5A059] text-white shadow-2xl transition transform group-hover:scale-110">
                    <Play className="h-8 w-8 ml-1 fill-white" />
                  </div>
                </div>
              )}

              {/* Controlos Inferiores */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-black/60 px-4 py-2 backdrop-blur-md text-white text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>DoReMi Eventos — Vídeo Oficial</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const videoEl = document.getElementById("doremi-promo-video") as HTMLVideoElement | null;
                      handleToggleMute(videoEl);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition"
                    title={isMuted ? "Ativar som" : "Desativar som"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const videoEl = document.getElementById("doremi-promo-video") as HTMLVideoElement | null;
                      if (videoEl?.requestFullscreen) videoEl.requestFullscreen();
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition"
                    title="Tela cheia"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 px-1">
            <span>🎥 Assista ao vídeo de apresentação dos nossos serviços</span>
            <span className="font-medium text-[#C5A059]">DoReMi Eventos</span>
          </div>
        </div>

        {/* Galeria de Flyers / Imagens Promocionais (Lado Direito / 5 Colunas) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {ADS_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(idx)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#C5A059]/30 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C5A059] hover:shadow-xl"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition" />
                
                {/* Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-full bg-[#C5A059]/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                    {item.badge}
                  </span>
                </div>

                {/* Textos no fundo do cartão */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <h4 className="font-serif-custom text-xs font-bold leading-tight line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-gray-200 line-clamp-1">
                    {item.subtitle}
                  </p>
                  <span className="mt-1 inline-block text-[9px] font-medium text-amber-300 group-hover:underline">
                    Ver imagem →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Lightbox para Ampliar as Imagens */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-black border border-[#C5A059]/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Imagem Ampliada */}
            <div className="relative aspect-[3/4] max-h-[80vh] w-[90vw] max-w-lg mx-auto">
              <Image
                src={ADS_ITEMS[selectedImage].src}
                alt={ADS_ITEMS[selectedImage].title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Legenda e Navegação */}
            <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-4 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#C5A059]">
                  {ADS_ITEMS[selectedImage].badge}
                </span>
                <h3 className="text-base font-bold font-serif-custom">
                  {ADS_ITEMS[selectedImage].title}
                </h3>
                <p className="text-xs text-gray-300">
                  {ADS_ITEMS[selectedImage].subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage((prev) => (prev !== null ? (prev - 1 + ADS_ITEMS.length) % ADS_ITEMS.length : 0))
                  }
                  className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage((prev) => (prev !== null ? (prev + 1) % ADS_ITEMS.length : 0))
                  }
                  className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
