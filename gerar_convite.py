#!/usr/bin/env python3
"""
Gerador automático do projeto "Convite Magnólia Dourada"
Cria toda a estrutura Next.js + React + Tailwind com preview em tempo real.

Uso:
    python gerar_convite.py
    cd gerador-convites
    npm install
    npm run dev
"""

import os
import json
from pathlib import Path

PROJECT_NAME = "gerador-convites"


def criar_estrutura():
    """Cria a estrutura de pastas do projeto."""
    pastas = [
        f"{PROJECT_NAME}/app",
        f"{PROJECT_NAME}/components",
        f"{PROJECT_NAME}/lib",
        f"{PROJECT_NAME}/public",
    ]
    for pasta in pastas:
        Path(pasta).mkdir(parents=True, exist_ok=True)
        print(f"  📁 Criada pasta: {pasta}")


def escrever(caminho, conteudo):
    """Escreve conteúdo num ficheiro."""
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(conteudo)
    print(f"  📄 Criado: {caminho}")


def gerar_package_json():
    conteudo = {
        "name": "gerador-convites",
        "version": "1.0.0",
        "private": True,
        "scripts": {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint"
        },
        "dependencies": {
            "next": "14.2.0",
            "react": "18.3.0",
            "react-dom": "18.3.0",
            "lucide-react": "^0.400.0"
        },
        "devDependencies": {
            "typescript": "^5.4.0",
            "@types/node": "^20.0.0",
            "@types/react": "^18.3.0",
            "@types/react-dom": "^18.3.0",
            "tailwindcss": "^3.4.0",
            "postcss": "^8.4.0",
            "autoprefixer": "^10.4.0"
        }
    }
    escrever(
        f"{PROJECT_NAME}/package.json",
        json.dumps(conteudo, indent=2, ensure_ascii=False)
    )


def gerar_tsconfig():
    conteudo = {
        "compilerOptions": {
            "target": "es5",
            "lib": ["dom", "dom.iterable", "esnext"],
            "allowJs": True,
            "skipLibCheck": True,
            "strict": True,
            "noEmit": True,
            "esModuleInterop": True,
            "module": "esnext",
            "moduleResolution": "bundler",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "preserve",
            "incremental": True,
            "plugins": [{"name": "next"}],
            "paths": {"@/*": ["./*"]}
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
    }
    escrever(
        f"{PROJECT_NAME}/tsconfig.json",
        json.dumps(conteudo, indent=2)
    )


def gerar_tailwind_config():
    conteudo = """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif-custom': ['"Playfair Display"', 'Georgia', 'serif'],
        'cursive-custom': ['"Great Vibes"', 'cursive'],
        'sans-custom': ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
"""
    escrever(f"{PROJECT_NAME}/tailwind.config.js", conteudo)


def gerar_postcss_config():
    conteudo = """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"""
    escrever(f"{PROJECT_NAME}/postcss.config.js", conteudo)


def gerar_next_config():
    conteudo = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
"""
    escrever(f"{PROJECT_NAME}/next.config.js", conteudo)


def gerar_layout():
    conteudo = '''import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerador de Convites de Casamento",
  description: "Sistema de convites personalizados",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
'''
    escrever(f"{PROJECT_NAME}/app/layout.tsx", conteudo)


def gerar_globals_css():
    conteudo = """@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');

html, body {
  font-family: 'Inter', sans-serif;
}
"""
    escrever(f"{PROJECT_NAME}/app/globals.css", conteudo)


def gerar_autofit():
    conteudo = '''"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  maxFontSize?: number;
  minFontSize?: number;
  maxLines?: number;
  className?: string;
}

export function AutoFitText({
  text,
  maxFontSize = 48,
  minFontSize = 20,
  maxLines = 2,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const adjust = () => {
      let size = maxFontSize;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      while (size > minFontSize) {
        container.style.fontSize = `${size}px`;
        const lines = Math.ceil(container.scrollHeight / (size * 1.2));
        const fitsWidth = container.scrollWidth <= containerWidth;
        const fitsHeight = container.scrollHeight <= containerHeight;
        const fitsLines = lines <= maxLines;

        if (fitsWidth && fitsHeight && fitsLines) break;
        size -= 2;
      }

      setFontSize(size);
    };

    adjust();
    window.addEventListener("resize", adjust);
    return () => window.removeEventListener("resize", adjust);
  }, [text, maxFontSize, minFontSize, maxLines]);

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-200 ${className}`}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.2 }}
    >
      {text}
    </div>
  );
}
'''
    escrever(f"{PROJECT_NAME}/components/AutoFitText.tsx", conteudo)


def gerar_preview():
    conteudo = '''"use client";

import { AutoFitText } from "./AutoFitText";
import { Calendar, Clock, MapPin, Heart, MessageCircle } from "lucide-react";

export interface InvitationData {
  brideName: string;
  groomName: string;
  day: string;
  month: string;
  year: string;
  time: string;
  locationName: string;
  locationAddress: string;
  rsvpContact: string;
  rsvpDate: string;
}

export function InvitationPreview({ data }: { data: InvitationData }) {
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
            Temos a alegria de vos convidar<br />para o nosso casamento
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
          Duas vidas, dois corações,<br />uma história para toda a vida.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-[#C5A059]/30">
          <div className="flex flex-col items-center text-center gap-1">
            <div className="p-1.5 bg-[#C5A059]/10 rounded-full">
              <Calendar className="h-4 w-4 text-[#8B5A2B]" />
            </div>
            <p className="text-[9px] font-sans-custom font-bold uppercase text-[#8B5A2B] tracking-wider">Dia</p>
            <p className="text-sm font-serif-custom font-bold">{data.day}</p>
            <p className="text-[9px] font-sans-custom text-gray-600 leading-tight">
              DE {data.month}<br />DE {data.year}
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
            <p className="text-[10px] font-serif-custom font-bold leading-tight">{data.locationName}</p>
            <p className="text-[8px] font-sans-custom text-gray-600 leading-tight">{data.locationAddress}</p>
          </div>
        </div>

        <div className="mt-auto pt-6 space-y-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Heart className="h-3 w-3 fill-[#C5A059] text-[#C5A059]" />
            <Heart className="h-3 w-3 fill-[#C5A059] text-[#C5A059]" />
          </div>

          <p className="text-[10px] font-sans-custom text-gray-600 italic px-4">
            Será uma honra celebrar este momento<br />tão especial na presença de vocês.
          </p>

          <p className="font-cursive-custom text-2xl text-[#C5A059]">
            Juntos para sempre
          </p>

          <div className="pt-3 border-t border-[#C5A059]/20">
            <div className="flex items-center justify-center gap-1.5">
              <MessageCircle className="h-3 w-3 text-[#8B5A2B]" />
              <p className="text-[10px] font-sans-custom font-bold uppercase tracking-widest text-[#1A1A1A]">RSVP</p>
            </div>
            <p className="text-[10px] font-sans-custom text-gray-600 mt-1">
              {data.rsvpContact} · Até {data.rsvpDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
'''
    escrever(f"{PROJECT_NAME}/components/InvitationPreview.tsx", conteudo)


def gerar_form():
    conteudo = '''"use client";

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
'''
    escrever(f"{PROJECT_NAME}/components/InvitationForm.tsx", conteudo)


def gerar_page():
    conteudo = '''"use client";

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
'''
    escrever(f"{PROJECT_NAME}/app/page.tsx", conteudo)


def gerar_gitignore():
    conteudo = """# Dependências
/node_modules
/.pnp
.pnp.js

# Next.js
/.next/
/out/

# Produção
/build

# Ambiente
.env*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Sistema
.DS_Store
*.pem

# IDE
.vscode/
.idea/
"""
    escrever(f"{PROJECT_NAME}/.gitignore", conteudo)


def gerar_readme():
    conteudo = """# Gerador de Convites de Casamento

Sistema de geração de convites personalizados com preview em tempo real.

## Modelo incluído
- Magnólia Dourada

## Como correr

```bash
npm install
npm run dev
```
"""
    escrever(f"{PROJECT_NAME}/README.md", conteudo)


if __name__ == "__main__":
    print(f"🚀 A gerar o projeto '{PROJECT_NAME}'...")
    criar_estrutura()
    gerar_package_json()
    gerar_tsconfig()
    gerar_tailwind_config()
    gerar_postcss_config()
    gerar_next_config()
    gerar_layout()
    gerar_globals_css()
    gerar_autofit()
    gerar_preview()
    gerar_form()
    gerar_page()
    gerar_gitignore()
    gerar_readme()
    print("✅ Projeto gerado com sucesso!")
    print(f"\\n👉 Para começar:\\n   cd {PROJECT_NAME}\\n   npm install\\n   npm run dev")
