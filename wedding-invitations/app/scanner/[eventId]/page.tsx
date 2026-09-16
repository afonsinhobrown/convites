"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  RefreshCw,
  LogOut,
  Camera,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface GuestInfo {
  id: string;
  name: string;
  phone?: string | null;
  rsvpStatus: string;
  guestsCount: number;
  maxCompanions: number;
  checkedInAt?: string | null;
  companions?: { id: string; name: string; checkedIn: boolean }[];
}

interface ScanResult {
  status: "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID" | "ERROR";
  message: string;
  guest?: GuestInfo;
}

export default function PortariaScannerPage({ params }: { params: { eventId: string } }) {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Dados do evento e portaria
  const [eventName, setEventName] = useState("");
  const [stats, setStats] = useState({ totalGuests: 0, totalConfirmed: 0, totalCheckedIn: 0 });
  const [recentGuests, setRecentGuests] = useState<GuestInfo[]>([]);

  // Estados do Scanner
  const [scannerActive, setScannerActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Autenticar com o PIN da Portaria
  async function handleAuthenticatePin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAuthError(null);

    try {
      const res = await fetch(`/api/events/${params.eventId}/checkin?pin=${encodeURIComponent(pin)}`);
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "PIN incorreto. Verifique o PIN com o organizador.");
        return;
      }

      setEventName(`${data.event.brideName} & ${data.event.groomName}`);
      setStats(data.stats);
      setRecentGuests(data.guests.filter((g: GuestInfo) => g.checkedInAt));
      setAuthenticated(true);
    } catch {
      setAuthError("Erro de ligação ao servidor. Tente novamente.");
    }
  }

  // Processar leitura de QR Code / Código
  const processCode = useCallback(
    async (token: string) => {
      if (!token || processing) return;
      setProcessing(true);

      try {
        const res = await fetch(`/api/events/${params.eventId}/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin, token }),
        });

        const data = await res.json();

        if (res.ok && data.status === "SUCCESS") {
          setScanResult({
            status: "SUCCESS",
            message: "Entrada Autorizada!",
            guest: data.guest,
          });
          setStats((prev) => ({ ...prev, totalCheckedIn: prev.totalCheckedIn + 1 }));
          setRecentGuests((prev) => [data.guest, ...prev.filter((g) => g.id !== data.guest.id)]);
        } else if (data.status === "ALREADY_CHECKED_IN") {
          setScanResult({
            status: "ALREADY_CHECKED_IN",
            message: data.message || "Convite já utilizado anteriormente!",
            guest: data.guest,
          });
        } else {
          setScanResult({
            status: "INVALID",
            message: data.message || "Convite Inválido / Não encontrado para este evento.",
          });
        }
      } catch {
        setScanResult({
          status: "ERROR",
          message: "Erro ao comunicar com o servidor.",
        });
      } finally {
        setProcessing(false);
      }
    },
    [params.eventId, pin, processing]
  );

  // Ligar a câmara para scanner
  useEffect(() => {
    if (!authenticated || !scannerActive) return;

    const qrElementId = "qr-reader-container";
    const qrCode = new Html5Qrcode(qrElementId);
    html5QrCodeRef.current = qrCode;

    qrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          processCode(decodedText);
        },
        () => {
          // leitura em andamento
        }
      )
      .catch((err) => {
        console.error("Erro ao iniciar câmara:", err);
      });

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [authenticated, scannerActive, processCode]);

  // Se não autenticado, mostra o ecrã de PIN
  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] p-4 text-white">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1E1E1E] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C5A059]/20 text-[#C5A059] mb-6">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h1 className="text-xl font-bold font-serif-custom">Portaria &amp; Scanner</h1>
          <p className="mt-1 text-xs text-gray-400">
            Introduza o PIN de segurança fornecido pelo organizador do casamento.
          </p>

          <form onSubmit={handleAuthenticatePin} className="mt-6 space-y-4">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              maxLength={8}
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN de Acesso (Ex: 1234)"
              className="w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3.5 text-center text-2xl font-bold tracking-widest text-[#C5A059] focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />

            {authError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C5A059] px-4 py-3.5 text-sm font-bold text-black shadow-lg hover:bg-[#b08f4a] transition"
            >
              <Lock className="h-4 w-4" />
              Entrar na Portaria
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header Portaria */}
      <header className="border-b border-white/10 bg-[#1A1A1A] sticky top-0 z-30">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">
              Portaria do Evento
            </span>
            <h1 className="text-base font-bold text-white">{eventName}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAuthenticatePin()}
              className="rounded-lg bg-white/10 p-2 text-gray-300 hover:bg-white/20"
              title="Atualizar lista"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthenticated(false);
                setPin("");
              }}
              className="rounded-lg bg-white/10 p-2 text-red-400 hover:bg-red-500/20"
              title="Sair da portaria"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Métricas de Entrada em Tempo Real */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-3.5 text-center">
            <p className="text-[10px] uppercase text-gray-400">Total Convidados</p>
            <p className="mt-1 text-xl font-bold text-white">{stats.totalGuests}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-center">
            <p className="text-[10px] uppercase text-emerald-400">Confirmados</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">{stats.totalConfirmed}</p>
          </div>
          <div className="rounded-2xl border border-[#C5A059]/40 bg-[#C5A059]/10 p-3.5 text-center">
            <p className="text-[10px] uppercase text-[#C5A059]">Entradas Registadas</p>
            <p className="mt-1 text-xl font-bold text-[#C5A059]">{stats.totalCheckedIn}</p>
          </div>
        </div>

        {/* Ecrã de Leitura QR Code e Câmara */}
        <div className="rounded-3xl border border-white/10 bg-[#1A1A1A] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-[#C5A059]" />
              <h2 className="text-sm font-bold text-white">Scanner de QR Code</h2>
            </div>
            <button
              type="button"
              onClick={() => setScannerActive(!scannerActive)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                scannerActive
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              {scannerActive ? "Desativar Câmara" : "Ativar Câmara"}
            </button>
          </div>

          {scannerActive ? (
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-square max-w-sm mx-auto flex items-center justify-center border-2 border-[#C5A059]">
              <div id="qr-reader-container" className="w-full h-full" />
            </div>
          ) : (
            <div
              onClick={() => setScannerActive(true)}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-black/30 p-8 text-center cursor-pointer hover:border-[#C5A059] transition"
            >
              <Camera className="h-10 w-10 text-gray-500 mb-2" />
              <p className="text-xs font-medium text-gray-300">Toque para abrir a câmara e ler o QR Code</p>
              <p className="mt-1 text-[11px] text-gray-500">Aponte para o QR Code no telemóvel do convidado</p>
            </div>
          )}

          {/* Entrada Manual de Token/Código */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processCode(manualCode);
              setManualCode("");
            }}
            className="mt-4 flex gap-2"
          >
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ou introduza o código/token manual..."
              className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!manualCode.trim() || processing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#C5A059] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#b08f4a] disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" />
              Validar
            </button>
          </form>
        </div>

        {/* Card de Resultado da Leitura */}
        {scanResult && (
          <div
            className={`rounded-3xl border p-6 transition-all shadow-2xl ${
              scanResult.status === "SUCCESS"
                ? "border-emerald-500 bg-emerald-950/70 text-emerald-100"
                : scanResult.status === "ALREADY_CHECKED_IN"
                ? "border-amber-500 bg-amber-950/70 text-amber-100"
                : "border-red-500 bg-red-950/70 text-red-100"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`rounded-2xl p-3 ${
                  scanResult.status === "SUCCESS"
                    ? "bg-emerald-500 text-black"
                    : scanResult.status === "ALREADY_CHECKED_IN"
                    ? "bg-amber-500 text-black"
                    : "bg-red-500 text-white"
                }`}
              >
                {scanResult.status === "SUCCESS" && <CheckCircle2 className="h-8 w-8" />}
                {scanResult.status === "ALREADY_CHECKED_IN" && <AlertTriangle className="h-8 w-8" />}
                {scanResult.status === "INVALID" && <XCircle className="h-8 w-8" />}
                {scanResult.status === "ERROR" && <XCircle className="h-8 w-8" />}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold">{scanResult.message}</h3>

                {scanResult.guest && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="font-semibold text-white text-base">{scanResult.guest.name}</p>
                    <p className="text-xs opacity-90">
                      Entrada para <strong>{scanResult.guest.guestsCount} pessoa(s)</strong>{" "}
                      {scanResult.guest.maxCompanions > 0 &&
                        `(${scanResult.guest.maxCompanions} acompanhante(s))`}
                    </p>

                    {scanResult.guest.companions && scanResult.guest.companions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1">
                          Acompanhantes registados:
                        </p>
                        <ul className="space-y-1 text-xs">
                          {scanResult.guest.companions.map((comp) => (
                            <li key={comp.id} className="flex items-center gap-1.5">
                              <UserCheck className="h-3 w-3" />
                              <span>{comp.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Últimas Entradas Registadas */}
        <div className="rounded-3xl border border-white/10 bg-[#1A1A1A] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Últimos Convidados que Entraram</h3>
            </div>
            <span className="text-xs text-gray-400">{recentGuests.length} registos</span>
          </div>

          {recentGuests.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-500">
              Nenhuma entrada registada ainda nesta sessão.
            </p>
          ) : (
            <ul className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {recentGuests.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <p className="font-bold text-white">{g.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {g.guestsCount} pessoa(s){" "}
                      {g.checkedInAt &&
                        `· ${new Date(g.checkedInAt).toLocaleTimeString("pt-MZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Entrada Confirmada
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
