"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, UploadCloud } from "lucide-react";

type Props = {
  eventId: string;
  bridesName: string;
  groomsName: string;
  initialLeft: string | null;
  initialRight: string | null;
};

export function CouplePhotos({
  eventId,
  bridesName,
  groomsName,
  initialLeft,
  initialRight,
}: Props) {
  const [photoLeft, setPhotoLeft] = useState(initialLeft);
  const [photoRight, setPhotoRight] = useState(initialRight);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leftRef = useRef<HTMLInputElement>(null);
  const rightRef = useRef<HTMLInputElement>(null);

  async function upload(field: "photoLeft" | "photoRight", file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Escolha um ficheiro de imagem (PNG ou JPG).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append(field, file);
      const res = await fetch(`/api/organizer/events/${eventId}/photos`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? "Erro ao enviar a foto.");
        return;
      }
      const json = await res.json();
      if (field === "photoLeft") setPhotoLeft(json.photoLeft);
      else setPhotoRight(json.photoRight);
    } catch {
      setError("Erro de ligação ao enviar a foto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {(
          [
            { key: "photoLeft" as const, label: `Foto da ${bridesName}`, ref: leftRef, value: photoLeft, set: setPhotoLeft },
            { key: "photoRight" as const, label: `Foto do ${groomsName}`, ref: rightRef, value: photoRight, set: setPhotoRight },
          ]
        ).map(({ key, label, ref, value, set }) => (
          <div key={key} className="rounded-xl border border-[#C5A059]/30 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-start gap-3">
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-[#FDFBF7]">
                {value ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={value} alt={label} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
                    <ImagePlus className="h-6 w-6" />
                    <span className="px-2 text-center text-[11px]">Sem foto</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={ref}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(key, f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => ref.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A1A1A] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#333] disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {value ? "Substituir" : "Enviar foto"}
                </button>
                {value && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setError(null);
                      try {
                        const res = await fetch(`/api/organizer/events/${eventId}/photos`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ [key]: null }),
                        });
                        if (res.ok) set(null);
                      } catch {
                        setError("Erro ao remover a foto.");
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="w-full text-center text-xs text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
