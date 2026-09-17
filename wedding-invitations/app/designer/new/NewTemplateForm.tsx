"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  UploadCloud,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

export function NewTemplateForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [priceUsd, setPriceUsd] = useState("17.00");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setName(val);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsSlugManual(true);
    setSlug(slugify(e.target.value));
  }

  async function optimizeTemplateImage(rawFile: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(rawFile);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        // Canvas padrão do convite é 800x1200. Max resolução de retina: 1600x2400
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 2400;
        let { width, height } = img;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawFile);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(rawFile);
              return;
            }
            const optimized = new File([blob], rawFile.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(optimized);
          },
          "image/webp",
          0.90
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(rawFile);
      };
      img.src = objectUrl;
    });
  }

  function handleFileSelect(selectedFile: File) {
    setError(null);

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(selectedFile.type.toLowerCase())) {
      setError("Formato inválido. Apenas imagens PNG, JPG ou WEBP são suportadas.");
      return;
    }

    const maxSizeBytes = 25 * 1024 * 1024; // Permite até 25MB pois otimizamos automaticamente no cliente
    if (selectedFile.size > maxSizeBytes) {
      setError("Imagem demasiado grande. O tamanho máximo permitido é 25MB.");
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleRemoveImage() {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nome obrigatório");
      return;
    }

    if (!slug.trim()) {
      setError("Slug obrigatório");
      return;
    }

    const price = parseFloat(priceUsd);
    if (isNaN(price) || price <= 0) {
      setError("Preço inválido. O valor deve ser superior a 0.");
      return;
    }

    if (!file) {
      setError("Por favor, faça upload da imagem de fundo do convite.");
      return;
    }

    setLoading(true);

    try {
      // Otimizar e comprimir a imagem no cliente antes de enviar ao servidor (evita HTTP 413 na Vercel)
      const fileToUpload = await optimizeTemplateImage(file);

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("name", name.trim());
      formData.append("slug", slug.trim());
      formData.append("priceUsd", priceUsd);

      const res = await fetch("/api/designer/templates", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar modelo de convite");
      }

      // Redirecionamento direto para o editor do modelo recém-criado
      window.location.href = `/designer/editor/${data.slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar criação do modelo");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/designer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao painel do designer
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Novo Modelo de Convite</h1>
        <p className="text-sm text-gray-500">
          Adicione uma imagem de fundo, defina o nome e preço para começar a posicionar os componentes no editor.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* 1. Upload da Imagem */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Imagem de Fundo do Convite <span className="text-rose-600">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Formato PNG, JPG ou WEBP de alta resolução (máx. 5MB).
          </p>

          {!previewUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
                isDragging
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-gray-300 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.value && e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                Clique para escolher ou arraste a imagem para aqui
              </p>
              <p className="mt-1 text-xs text-gray-500">PNG ou JPG até 5MB</p>
            </div>
          ) : (
            <div className="relative rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative h-44 w-32 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview do fundo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Imagem carregada com sucesso
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      Trocar imagem
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.value && e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* 2. Nome do Modelo */}
        <div>
          <label htmlFor="template-name" className="block text-sm font-semibold text-gray-900">
            Nome do Modelo <span className="text-rose-600">*</span>
          </label>
          <input
            id="template-name"
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            placeholder="ex: Magnólia Dourada Casal"
            className="mt-1 block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* 3. Slug Identificador */}
        <div>
          <label htmlFor="template-slug" className="block text-sm font-semibold text-gray-900">
            Slug / Identificador Único <span className="text-rose-600">*</span>
          </label>
          <div className="mt-1 flex rounded-xl shadow-sm">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 px-3 text-xs text-gray-500 select-none">
              templates/
            </span>
            <input
              id="template-slug"
              type="text"
              required
              value={slug}
              onChange={handleSlugChange}
              placeholder="magnolia-dourada-casal"
              className="block w-full rounded-r-xl border border-gray-300 px-3.5 py-2.5 font-mono text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Gerado automaticamente a partir do nome. Pode personalizar se desejar.
          </p>
        </div>

        {/* 4. Preço em USD */}
        <div>
          <label htmlFor="template-price" className="block text-sm font-semibold text-gray-900">
            Preço em USD ($) <span className="text-rose-600">*</span>
          </label>
          <div className="mt-1 flex rounded-xl shadow-sm max-w-xs">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 px-3.5 text-sm font-semibold text-gray-600 select-none">
              $
            </span>
            <input
              id="template-price"
              type="number"
              step="0.01"
              min="1"
              required
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
              placeholder="17.00"
              className="block w-full rounded-r-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Preço de venda base em USD (será convertido em Meticais na taxa de câmbio configurada).
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Não foi possível criar o modelo</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-5">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                A criar modelo e a carregar editor...
              </>
            ) : (
              <>
                Criar modelo e continuar para o editor →
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
