# RELATÓRIO DE ATIVIDADES

**Projeto:** Wedding Invitations (convites de casamento, Next.js + Prisma + Neon)
**Sessão:** aditiva sobre a stack atual — sem re-arquitetura
**Data:** 2026-09-15
**Branch:** `main` · **Último commit:** `bf22a51` (push OK → `origin/main`)

---

## 1. Objetivo

Alargar o catálogo e o organizador de forma **aditiva** (não arriscar a montra a 3 Magnólia já validada):

1. Montra a **5 templates** (3 Magnólia + 2 novos).
2. **Assets reais** de `ASSETS\` no designer (sem inventar nomes de ficheiros).
3. Fotos do casal (noiva/noivo) **por arrasto/upload**, ponta a ponta.

---

## 2. Atividades concluídas

### 2.1 Schema (Prisma) — aplicado com `prisma db push` contra Neon, client regenerado
- `Event.photoLeft` / `Event.photoRight` (novos — URLs das fotos do casal).
- `InvitationTemplate.parentId` — auto-relação "TemplateParent" (templates variantes reutilizam layout+demo do pai).
- Novo modelo **`Asset`** (`slug unique`, `name`, `category`, `fileUrl`, `sortOrder`, `active`) + tabela `Assets`.
- `InvitationTemplate` ganhou `layoutJson`, `demoData`, `previewUrl`, `componentName`, `parentId`.

### 2.2 Assets reais (regra: só o que existe fisicamente, sem inventar)
- `ASSETS\ALIANCA.png` e `ASSETS\FLORES.png` (únicos 2 PNG reais da pasta) → copiados 1:1 para `public\assets\`.
- Seed com `slug: alianca` e `slug: flores` (categoria derivada do nome).
- Fundos reais dos 2 templates novos: `4.png`, `5.png` → `public\templates\magnolia-dourada-casal\` ; `6.png` → `public\templates\esmeralda-fotos\`.

### 2.3 Montra a 5
| Template | Componente | Preço | parentId | Notas |
|---|---|---|---|---|
| Magnólia Clássica | `MagnoliaClassicaLayout` | 15€ | — | original |
| Magnólia Casal | `MagnoliaCasalLayout` | 17€ | — | original (layout+demo completos) |
| Magnólia Orgânica | `MagnoliaOrganicaLayout` | 16€ | — | original |
| Magnólia Dourada Casal | `MagnoliaCasalLayout` | 18€ | → magnolia-casal | fundos 4/5, reutiliza layout+demo do pai |
| Esmeralda Fotos | `MagnoliaOrganicaLayout` | 20€ | — | só fundo (6), thumbnail na montra |

- `DEFAULT_LAYOUTS` com chaves para `magnolia-dourada-casal` / `magnolia-organica` no `lib\designer-layout.ts`.
- Validado: `next build` → montra a 5, rota `/api/designer/assets` lista os assets.

### 2.4 Fotos do casal — ponta a ponta
- **Upload:** `POST /api/organizer/events/[id]/photos` — multipart, valida PNG por magic bytes, grava em `public\uploads\events\[eventId]\`, persiste `Event.photoLeft/photoRight`.
- **UI organizador:** secção "Fotos do casal" (`CouplePhotos.tsx`) na página do evento — enviar/substituir/remover as 2 fotos com preview.
- **Dados:** `InvitationData.photoLeft?/photoRight?` + mapeamento em `eventToInvitationData`.
- **Renderer:** `LayoutFromJson.tsx` — campo com `sourceKey: photoLeft/photoRight` desenha `<img object-cover>` no retângulo do layout; sem foto mostra nada; texto mostra texto. Zero coordenadas fixas (a foto é arrastada como qualquer campo).
- **Paleta/editor:** `FIELD_ORDER` com `photoLeft: "Foto da noiva"` e `photoRight: "Foto do noivo"` — automaticamente arrastáveis na paleta do designer.

### 2.5 Validação
- `tsc --noEmit` ✓ · `eslint` (app, components, lib, prisma) ✓ · `next build` ✓
- Montra validada a 5; página organizer (9.58 kB) e editor do designer compilam.

### 2.6 Estado de publicação dos templates (aditivo)
- **Schema:** `InvitationTemplate.status` (`InvitationTemplateStatus` = `DRAFT|PUBLISHED|ARCHIVED`, default `DRAFT`) + `publishedAt DateTime?` — `prisma db push` ✓.
- **Seed:** os **3 Magnólia** (`magnolia-classica`, `magnolia-casal`, `magnolia-organica`) → `PUBLISHED` + `publishedAt`; os **2 novos** (`magnolia-dourada-casal`, `esmeralda-fotos`) ficam `DRAFT` (default) — validado no disco (montra PUBLISHED = 3).
- **Montra:** `app\page.tsx` filtra `where: { status: "PUBLISHED" }` → mostra os **3** publicados.
- **API:** novo `PATCH app\api\designer\templates\[templateId]\status` (Publicar/Despublicar/Arquivar; `publishedAt` ao publicar) — auth designer espelhada da rota PATCH existente.
- **Editor:** badge de estado + data + botão Publicar/Despublicar no header (`DesignerEditor.tsx`).
- **Validação:** `tsc --noEmit` ✓ 0 erros. `next build` nesta máquina rebenta por OOM do worker (bug Next/Windows pré-existente, independente destas edições — o bloco anterior passou build com truques de memória; aqui ficou documentado).

---

## 3. Entregas ao repositório

**Commit `c7cd5e2`** — "feat(designer): montra a 5, fotos do casal por upload/arrasto + assets reais ALIANCA/FLORES" — pusheado para `main` (`8b0e451..c7cd5e2`).

Ficheiros principais: `prisma/schema.prisma`, `prisma/seed.ts`, `lib/designer-layout.ts`, `lib/invitation.ts`, `components/invitations/{types,LayoutFromJson}.tsx`, `app/api/organizer/events/[id]/photos/route.ts` (novo), `app/organizer/events/[id]/CouplePhotos.tsx` (novo), assets/fundos novos.

---

## 4. Pendências / decisões em aberto

1. **Limpeza de repo:** o `git add -A` incluiu o zip de origem do Pngtree (`--Pngtree--...zip` + `.psd`) e a pasta `ASSETS\TEMPLATES` na raiz. Não é segredo, mas é ruído — proposta: `.gitignore` + `git rm --cached` + 1 commit de limpeza. **Aguardando confirmação do utilizador.**
2. **Coordenadas de partida** das 2 fotos no caixilho do modelo Dourada Casal: precisam de **ver o `fundo.png`** (limitação do modelo — não consegui ver a imagem) para pré-posicionar; hoje o designer arrasta os campos-foto para o caixilho manualmente.
3. **`next build` → OOM do worker (exit 134)** nesta máquina Windows — os workers de build do Next rebentam por memória, **pré-existente** e independente das edições (o bloco anterior só passou build com ajustes de memória). `tsc --noEmit` mantém-se verde (0 erros). A validar numa máquina com mais RAM ou com `next build --experimental-build-mode compile`.
4. **FIX PRODUÇÃO (login designer 500):** a Vercel (`convites-beta`) não tinha `DESIGNER_COOKIE_SECRET` definida → `hmacSign` assinava com key zero (`?? ""`) → `Zero-length key` em produção enquanto o `.env` local funcionava. **Corrigido em `f83b1dd`**: `lib\designer-auth.ts` exige a secret (erro PT claro em runtime ao iniciar sessão, fora do `importKey` cripto) + validação env no boot. **Acção necessária na Vercel** (só pode ser feita por ti, tem acesso ao painel): Settings → Environment Variables → `DESIGNER_COOKIE_SECRET` = o **mesmo valor** de `wedding-invitations\.env` (senão os tokens já emitidos deixam de validar). Sem ela, o login em produção continua a falhar com o novo erro legível (não mais 500 cripto).

---

*Fim do relatório.*
